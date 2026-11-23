// Logging standard (pazka/hosh-management AGENTS.md section 11): the format cannot rot.
// Unit tests of the built services/log.js, the request logger on a real Express app, and the built server
// (dist/index.js, spawned as the image runs it): startup line, error lines with `err`, shutdown line, nothing
// but JSON on stdout, never a session id, cookie, room password, player or room name, payload, path or IP.
// Node built-ins plus the app's own express:  npm run build && node --test test/log.test.js
'use strict'

const {test} = require('node:test')
const assert = require('node:assert/strict')
const {spawn} = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')
const express = require('express')
const {PollClient} = require('./sio-poll')

const BACK = path.join(__dirname, '..')
const DIST = path.join(BACK, 'dist')
const L = require(path.join(DIST, 'services', 'log.js'))
const TS = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
const KEYS = ['ts', 'level', 'service', 'version', 'event', 'msg']
const sleep = ms => new Promise(r => setTimeout(r, ms))

function memLogger(level, version = 'v1.2.3') {
    const lines = []
    const logger = L.createLogger(level, {write: s => lines.push(s)}, version)
    logger.lines = lines
    logger.parsed = () => lines.map(l => JSON.parse(l))
    return logger
}

// ---- services/log.js ----------------------------------------------------------------------------------------

test('log: one JSON object per line with ts, level, service, version, event, msg; level filter', () => {
    const lg = memLogger('info')
    lg.debug('hidden', 'not at info')
    lg.info('one', 'first', {n: 1})
    lg.warn('two', 'second')
    lg.error('three', 'third')
    assert.equal(lg.lines.length, 3)
    for (const l of lg.lines) assert.ok(l.endsWith('\n') && !l.slice(0, -1).includes('\n'))
    const [a, b, c] = lg.parsed()
    assert.deepEqual(Object.keys(a), [...KEYS, 'n'])
    assert.match(a.ts, TS)
    assert.deepEqual([a.level, a.service, a.version, a.event, a.msg, a.n], ['info', 'my-murder-party', 'v1.2.3', 'one', 'first', 1])
    assert.deepEqual([b.level, c.level], ['warn', 'error'])
    assert.equal(memLogger('debug').level, 'debug')
    assert.equal(memLogger('loud').level, 'info')
    const e = memLogger('error'); e.warn('x', 'x'); e.error('y', 'y')
    assert.deepEqual(e.parsed().map(o => o.event), ['y'])
})

test('log: LOG_LEVEL, else APP_LOG_LEVEL, else info; config names without values', () => {
    assert.equal(L.levelFromEnv({LOG_LEVEL: 'debug', APP_LOG_LEVEL: 'error'}), 'debug')
    assert.equal(L.levelFromEnv({APP_LOG_LEVEL: 'warn'}), 'warn')
    assert.equal(L.levelFromEnv({}), 'info')
    assert.deepEqual(L.configNamesSet({ENV: 'PROD', PORT: '8000', LOG_LEVEL: '', OTHER: 'x', APP_VERSION: 'v1'}),
        ['ENV', 'PORT', 'APP_VERSION'])
})

test('log: errField has type, message, code, stack frames; hidden strings never reach it', () => {
    const e = new Error('open /r/SECRET-ROOM failed')
    e.code = 'ENOENT'
    const {err} = L.errField(e, ['/r/SECRET-ROOM'])
    assert.deepEqual(Object.keys(err), ['type', 'message', 'stack', 'code'])
    assert.deepEqual([err.type, err.message, err.code], ['Error', 'open <hidden> failed', 'ENOENT'])
    assert.match(err.stack, /^Error: open <hidden> failed\n\s+at /)
    assert.ok(!JSON.stringify(err).includes('SECRET'))
    assert.deepEqual(L.errField('plain', []).err, {type: 'string', message: 'plain'})
    assert.equal(L.errField(new TypeError('x')).err.type, 'TypeError')
})

test('log: request id from X-Request-Id when it is a plain token, else a new UUID', () => {
    assert.equal(L.requestId('abc-123_X.y:z'), 'abc-123_X.y:z')
    assert.equal(L.requestId(['first', 'second']), 'first')
    assert.equal(L.requestId('a'.repeat(64)), 'a'.repeat(64))
    for (const bad of ['a'.repeat(65), 'has space', 'x\ny', '', undefined]) assert.match(L.requestId(bad), UUID)
})

test('log: route templates, never the raw path or query string', () => {
    const want = {
        '/healthz': '/healthz', '/healthz?x=1': '/healthz', '/session': '/session', '/SESSION/': '/session',
        '/info': '/info', '/users': '/users', '/rooms?secret=1': '/rooms', '/': '/', '/?q=1': '/',
        '/assets/index-abc.js': '/assets/:file', '/favicon.ico': '/:file', '/party/ABC-123': '(other)',
        '/images/drawer.jpg': '(other)', '/a/b/c?d=e': '(other)',
    }
    for (const [url, route] of Object.entries(want)) assert.equal(L.routeOf(url), route, url)
})

async function withApp(level, fn) {
    const lg = memLogger(level)
    let clock = 0
    const app = express()
    app.use(L.requestLogger(lg, () => clock))
    app.get('/healthz', (req, res) => res.status(Number(req.query.s || 200)).end())
    app.get('/info', (req, res) => { clock += Number(req.query.ms || 0); res.status(Number(req.query.s || 200)).end() })
    app.get('/rooms', () => { throw new Error('boom at /rooms?secret=ROOMPW') })
    app.use(L.errorRecorder)
    const server = app.listen(0, '127.0.0.1')
    await new Promise(r => server.once('listening', r))
    const base = `http://127.0.0.1:${server.address().port}`
    try {
        await fn(base, lg)
    } finally {
        await new Promise(r => server.close(r))
    }
}

test('request logger: 5xx = one error line with err, slow = warn, the rest only at debug; X-Request-Id', async () => {
    await withApp('info', async (base, lg) => {
        const r = await fetch(base + '/rooms?secret=ROOMPW', {headers: {'x-request-id': 'req-1'}})
        assert.equal(r.status, 500)
        assert.equal(r.headers.get('x-request-id'), 'req-1')
        await fetch(base + '/info?s=503')                 // a 5xx without an exception: no err
        await fetch(base + '/info?ms=1000')               // exactly 1 s: not slow
        await fetch(base + '/info?ms=1001')
        await fetch(base + '/info?s=404')
        await fetch(base + '/healthz?s=503')              // /healthz never above debug
        const g = await fetch(base + '/info', {headers: {'x-request-id': 'bad id'}})
        assert.match(g.headers.get('x-request-id'), UUID)
        await sleep(100)
        const lines = lg.parsed()
        assert.deepEqual(lines.map(o => [o.event, o.level, o.status]),
            [['request_failed', 'error', 500], ['request_failed', 'error', 503], ['request_slow', 'warn', 200]])
        const [fail, noErr, slow] = lines
        assert.deepEqual([fail.req_id, fail.method, fail.route, typeof fail.dur_ms], ['req-1', 'GET', '/rooms', 'number'])
        assert.deepEqual([fail.err.type, fail.err.message], ['Error', 'boom at <hidden>'])
        assert.match(fail.err.stack, /^Error: boom at <hidden>\n\s+at /)
        assert.ok(!('err' in noErr))
        assert.deepEqual([slow.route, slow.dur_ms], ['/info', 1001])
        assert.ok(!lg.lines.join('').includes('ROOMPW'))
    })
    await withApp('debug', async (base, lg) => {
        await fetch(base + '/healthz?s=503')
        await fetch(base + '/info?x=SECRET')
        await sleep(100)
        assert.deepEqual(lg.parsed().map(o => [o.event, o.level, o.route, o.status]),
            [['healthz', 'debug', '/healthz', 503], ['request', 'debug', '/info', 200]])
        assert.ok(!lg.lines.join('').includes('SECRET'))
    })
})

// ---- the built server (dist/index.js), black box ----------------------------------------------------------

// root writes and reads everywhere: those tests then run the server as nobody (65534), as the image runs
// as a non-root uid (CI's test job runs as root in a node container)
const asRoot = typeof process.getuid === 'function' && process.getuid() === 0

function startServer(port, extraEnv = {}, {cwd = DIST, spawnOpts = {}} = {}) {
    const env = {...process.env, ENV: 'STAGING', PORT: String(port), ...extraEnv}
    for (const k of ['LOG_LEVEL', 'APP_LOG_LEVEL', 'APP_VERSION', 'NODE_ENV']) if (!(k in extraEnv)) delete env[k]
    const s = {out: '', err: '', base: `http://127.0.0.1:${port}`}
    s.proc = spawn(process.execPath, ['index.js'], {cwd, env, ...spawnOpts})
    s.proc.stdout.on('data', d => { s.out += d })
    s.proc.stderr.on('data', d => { s.err += d })
    s.exited = new Promise(r => s.proc.once('exit', (code, signal) => r({code, signal})))
    s.lines = () => s.out.split('\n').filter(Boolean).map(l => JSON.parse(l)) // every line is JSON
    s.ready = (async () => {
        const until = Date.now() + 15000
        while (!s.out.includes('"event":"startup"')) {
            if (Date.now() > until || s.proc.exitCode !== null) throw new Error('server did not start:\n' + s.out + s.err)
            await sleep(50)
        }
    })()
    s.stop = async () => {
        if (s.proc.exitCode === null && s.proc.signalCode === null) s.proc.kill('SIGKILL')
        await s.exited
    }
    return s
}

async function exitedWithin(s, ms) {
    return Promise.race([s.exited, sleep(ms).then(() => { throw new Error(`no exit ${ms} ms after the signal`) })])
}

async function waitUntil(client, name, pred = () => true) {
    for (;;) {
        const args = await client.waitFor(name)
        if (pred(...args)) return args
    }
}

// a player: session cookie, socket, login, then a party with a password
async function playAParty(base, {player = 'Secret Player Name', room = 'Secret Room Name', password = 'secret-room-pw'} = {}) {
    const sessionId = await (await fetch(base + '/session', {headers: {'x-forwarded-for': '203.0.113.77', 'user-agent': 'SecretAgent/1.0'}})).text()
    const c = await new PollClient(base, {cookie: `sessionId=${sessionId}`, 'user-agent': 'SecretAgent/1.0'}).connect()
    await c.waitFor('you-are')
    await c.emit('login', {name: player})
    const [me] = await waitUntil(c, 'you-are', u => u !== null)
    await c.emit('new-room-and-join', {id: '', name: room, password, users: {}, objects: {}, characters: {}, roomHistory: [], gameConfigName: 'Murder'})
    const [r] = await waitUntil(c, 'update-room', x => x && x.name === room)
    return {c, sessionId, me, room: r}
}

test('server: startup line, user_created and room_created at info, shutdown on SIGTERM; never a secret', async () => {
    const s = startServer(9871, {APP_VERSION: 'v9.8.7'})
    try {
        await s.ready
        const st = s.lines().find(o => o.event === 'startup')
        assert.match(st.ts, TS)
        assert.deepEqual(Object.keys(st), [...KEYS, 'port', 'env', 'log_level', 'config'])   // nothing else (no env values)
        assert.deepEqual([st.level, st.service, st.version, st.msg, st.port, st.env, st.log_level],
            ['info', 'my-murder-party', 'v9.8.7', 'Server is Fire at http://0.0.0.0:9871', 9871, 'STAGING', 'info'])
        assert.deepEqual(st.config, ['ENV', 'PORT', 'APP_VERSION'])

        const {c, sessionId, me, room} = await playAParty(s.base)
        assert.equal((await fetch(s.base + '/rooms')).status, 200)
        assert.equal((await fetch(s.base + '/healthz')).status, 200)
        await c.emit('join-room', {roomId: 'ZZZ-999', password: 'wrong-secret-pw'})   // refused: debug only
        await c.waitFor('error')
        await c.emit('new-room-and-join', {name: 'Secret Room Name', password: 'other-secret-pw', gameConfigName: 'Murder'})
        assert.deepEqual(await c.waitFor('error'), ['Room with same name already exists'])   // refused: debug only
        await c.emit('delete-room', {roomId: room.id, password: 'secret-room-pw'})
        await waitUntil(c, 'room-deleted')
        await c.emit('logout')
        await sleep(300)
        await c.close()

        s.proc.kill('SIGTERM')
        assert.deepEqual(await exitedWithin(s, 5000), {code: 0, signal: null})
        const lines = s.lines()
        // at info: no request, healthz, socket or refused-action line
        assert.deepEqual(lines.map(o => o.event), ['startup', 'user_created', 'room_created', 'room_deleted', 'user_deleted', 'shutdown'])
        for (const o of lines) {
            assert.deepEqual(Object.keys(o).slice(0, 6), KEYS)
            assert.match(o.ts, TS)
            assert.deepEqual([o.level, o.service, o.version], ['info', 'my-murder-party', 'v9.8.7'])
        }
        assert.deepEqual([lines[1].users, lines[2].rooms, lines[3].rooms], [1, 1, 0])
        const down = lines[5]
        assert.deepEqual(Object.keys(down), [...KEYS, 'signal', 'uptime_s'])
        assert.deepEqual([down.signal, typeof down.uptime_s], ['SIGTERM', 'number'])
        for (const x of [sessionId, me.id, 'Secret Player', 'Secret Room', 'secret-room-pw', 'wrong-secret-pw', 'other-secret-pw', '203.0.113',
            '127.0.0.1', 'SecretAgent', room.id]) assert.ok(!s.out.includes(x), x)
        assert.equal(s.err, '', 'nothing on stderr')
    } finally {
        await s.stop()
    }
})

// a logged-in player without a party
async function aPlayer(base, name) {
    const sessionId = await (await fetch(base + '/session')).text()
    const c = await new PollClient(base, {cookie: `sessionId=${sessionId}`}).connect()
    await c.waitFor('you-are')
    await c.emit('login', {name})
    const [me] = await waitUntil(c, 'you-are', u => u !== null)
    return {c, sessionId, me}
}

test('server: new-room (create without joining) broadcasts all-rooms and logs one room_created with the count', async () => {
    const s = startServer(9876)
    try {
        await s.ready
        const {c, room} = await playAParty(s.base)
        await sleep(200)
        assert.deepEqual(s.lines().filter(o => o.event === 'room_created').map(o => o.rooms), [1])
        await c.emit('new-room', {id: '', name: 'Secret Lobby Room', password: 'lobby-secret-pw', users: {}, objects: {},
            characters: {}, roomHistory: [], gameConfigName: 'Murder'})
        // the front's room list (UI/Cheats/AllRooms.tsx) is fed by this broadcast; nothing else triggers one here
        const [all] = await waitUntil(c, 'all-rooms', rooms => rooms.some(r => r.name === 'Secret Lobby Room'))
        assert.deepEqual(all.map(r => r.name).sort(), ['Secret Lobby Room', 'Secret Room Name'])
        assert.ok(all.every(r => !('password' in r)))
        const lobby = all.find(r => r.name === 'Secret Lobby Room')
        assert.deepEqual(Object.keys(lobby.users), [], 'new-room does not join')
        assert.deepEqual((await (await fetch(s.base + '/rooms')).json()).map(r => r.name).sort(), ['Secret Lobby Room', 'Secret Room Name'])
        await sleep(200)
        const created = s.lines().filter(o => o.event === 'room_created')
        assert.deepEqual(created.map(o => [o.level, o.rooms]), [['info', 1], ['info', 2]])
        assert.deepEqual(Object.keys(created[1]), [...KEYS, 'rooms'])
        await c.close()
        for (const x of ['Secret Lobby', 'lobby-secret-pw', 'Secret Room', 'Secret Player', lobby.id, room.id]) assert.ok(!s.out.includes(x), x)
        assert.equal(s.err, '', 'nothing on stderr')
    } finally {
        await s.stop()
    }
})

test('server: LOG_LEVEL=debug adds request, healthz, socket and refused-action lines (names only, no payload)', async () => {
    const s = startServer(9872, {LOG_LEVEL: 'debug'})
    try {
        await s.ready
        assert.equal(s.lines().find(o => o.event === 'startup').log_level, 'debug')
        const {c, sessionId, room} = await playAParty(s.base)
        await fetch(s.base + '/healthz?secret=q')
        await fetch(s.base + '/party/SECRET-PATH?q=secret-query', {redirect: 'manual'})  // redirected to /
        const bad = await fetch(s.base + '/session', {method: 'POST', headers: {'content-type': 'application/json'}, body: '{"secret-body'})
        assert.equal(bad.status, 400)                                                  // Express's own 400, as before
        await c.emit('new-room-and-join', {name: 'Secret Room Name', password: 'wrong-secret-pw', gameConfigName: 'Murder'})
        assert.deepEqual(await c.waitFor('error'), ['Room with same name already exists'])
        // a second player: wrong room password, then the character the first player holds
        const p2 = await aPlayer(s.base, 'Secret Second Player')
        await p2.c.emit('join-room', {roomId: room.id, password: 'bad-guess-secret-pw'})
        assert.deepEqual(await p2.c.waitFor('error'), ['Wrong password'])
        await p2.c.emit('join-room', {roomId: room.id, password: 'secret-room-pw'})
        await waitUntil(c, 'update-room-users', u => u.length === 2)
        await c.emit('choose-character', {roomId: room.id, characterId: 'butler'})
        await waitUntil(p2.c, 'update-room', r => r && r.characters.butler)
        await p2.c.emit('choose-character', {roomId: room.id, characterId: 'butler'})
        assert.deepEqual(await p2.c.waitFor('error'), ['Character is already taken'])
        await p2.c.close()
        await c.close()
        await sleep(300)
        const lines = s.lines()
        const hz = lines.find(o => o.event === 'healthz')
        assert.deepEqual([hz.level, hz.route, hz.status], ['debug', '/healthz', 200])
        assert.match(hz.req_id, UUID)
        const rd = lines.find(o => o.event === 'request' && o.route === '(other)')
        assert.deepEqual([rd.level, rd.method, rd.status], ['debug', 'GET', 302])
        assert.ok(lines.some(o => o.event === 'request' && o.route === '/session' && o.status === 400))
        assert.ok(lines.some(o => o.event === 'socket_connect' && o.level === 'debug' && o.known_user === false))
        assert.deepEqual(lines.filter(o => o.event === 'socket_event').map(o => o.name), ['login', 'new-room-and-join', 'new-room-and-join',
            'login', 'join-room', 'join-room', 'choose-character', 'choose-character'])
        const refused = lines.filter(o => o.event === 'action_refused')
        assert.deepEqual(refused.map(o => [o.level, o.action, o.reason]), [
            ['debug', 'new-room-and-join', 'Room with same name already exists'],
            ['debug', 'join-room', 'Wrong password'],
            ['debug', 'choose-character', 'Character is already taken'],
        ])
        for (const o of refused) assert.deepEqual(Object.keys(o), [...KEYS, 'action', 'reason'])
        assert.ok(lines.some(o => o.event === 'socket_disconnect' && o.level === 'debug' && typeof o.clients === 'number'))
        for (const x of [sessionId, 'Secret Player', 'Secret Room', 'secret-room-pw', 'wrong-secret-pw', 'SECRET-PATH',
            'secret-query', 'secret-body', 'secret=q', '127.0.0.1', 'SecretAgent', room.id, 'Secret Second', 'bad-guess-secret-pw',
            p2.sessionId, p2.me.id, 'butler']) assert.ok(!s.out.includes(x), x)
        assert.equal(s.err, '', 'nothing on stderr (Express env "test")')
    } finally {
        await s.stop()
    }
})

test('server: an unreadable version.txt gives healthz_failed (503) and request_failed (500) error lines with err', async () => {
    // a copy of dist/ next to it (node_modules resolve from Back/), with version.txt unreadable for the server
    const copy = fs.mkdtempSync(path.join(BACK, '.test-log-'))
    try {
        fs.cpSync(DIST, copy, {recursive: true, filter: src => !src.includes(`${path.sep}public${path.sep}`)})
        fs.chmodSync(path.join(copy, 'version.txt'), 0o000)
        fs.chmodSync(copy, 0o755)
        const s = startServer(9873, {}, {cwd: copy, spawnOpts: asRoot ? {uid: 65534, gid: 65534} : {}})
        try {
            await s.ready
            const h = await fetch(s.base + '/healthz', {headers: {'x-request-id': 'req-hz-1'}})
            assert.deepEqual([h.status, await h.json()], [503, {status: 'error'}])
            const i = await fetch(s.base + '/info?secret=SECRET-Q', {headers: {'x-request-id': 'req-info-1'}})
            assert.equal(i.status, 500)
            assert.match(await i.text(), /<pre>Error: EACCES: permission denied, open/)  // Express's own page, as before
            await sleep(100)
            const lines = s.lines()
            const hf = lines.filter(o => o.event === 'healthz_failed')
            assert.equal(hf.length, 1, s.out)
            assert.match(hf[0].ts, TS)
            assert.deepEqual([hf[0].level, hf[0].msg, hf[0].err.type, hf[0].err.code], ['error', 'healthz failed', 'Error', 'EACCES'])
            assert.match(hf[0].err.stack, /^Error: EACCES: permission denied, open '\.\/version\.txt'\n\s+at /)
            assert.ok(!lines.some(o => o.event === 'healthz'), '/healthz itself stays at debug')
            const rf = lines.filter(o => o.event === 'request_failed')
            assert.equal(rf.length, 1, s.out)
            assert.deepEqual([rf[0].level, rf[0].req_id, rf[0].method, rf[0].route, rf[0].status, rf[0].err.code],
                ['error', 'req-info-1', 'GET', '/info', 500, 'EACCES'])
            assert.match(rf[0].err.stack, /^Error: EACCES: .*\n\s+at /)
            assert.ok(!s.out.includes('SECRET-Q'), 'no query string')
            assert.equal(s.err, '', 'nothing on stderr')
        } finally {
            await s.stop()
        }
    } finally {
        fs.rmSync(copy, {recursive: true, force: true})
    }
})
