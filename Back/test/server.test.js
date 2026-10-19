// Upgrade safety net (see TESTING.md at the repo root): black-box characterization tests of the built Back
// (`npm run build` -> dist/), started like the image does (`node index.js`, cwd dist/). They pin what the
// server does TODAY, quirks included, so a Node, Express, Socket.IO or TypeScript bump that changes
// behaviour fails here. Node built-ins only:  npm run build && node --test test/server.test.js
'use strict'

const {test, before, after} = require('node:test')
const assert = require('node:assert/strict')
const {spawn} = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')
const dns = require('node:dns')
const {PollClient} = require('./sio-poll')

const DIST = path.join(__dirname, '..', 'dist')
let DEV                               // config DEV: "localhost":8001, debug cookies (set in before())
const PROD = 'http://127.0.0.1:80'    // config PROD: 0.0.0.0:80, hardened cookies
const servers = []
const logs = {}                       // env -> everything the server printed so far

async function start(env, marker) {
    let log = ''
    const p = spawn(process.execPath, ['index.js'], {cwd: DIST, env: {...process.env, ENV: env}})
    p.stdout.on('data', d => { log += d; logs[env] = log })
    p.stderr.on('data', d => { log += d; logs[env] = log })
    servers.push(p)
    const until = Date.now() + 15000
    while (!log.includes(marker)) {
        if (Date.now() > until || p.exitCode !== null) throw new Error(`${env} server did not start:\n${log}`)
        await new Promise(r => setTimeout(r, 50))
    }
}

before(async () => {
    // server.listen("localhost") binds the first address dns.lookup returns (::1 on some hosts).
    const {address, family} = await dns.promises.lookup('localhost')
    DEV = `http://${family === 6 ? `[${address}]` : address}:8001`
    await start('DEV', 'Server is Fire at http://localhost:8001')
    await start('PROD', 'Server is Fire at http://0.0.0.0:80')
})
after(() => servers.forEach(p => p.kill()))

const ID = /^[A-Z]{3}-\d{3}$/

async function session(base) {
    const r = await fetch(base + '/session')
    return {id: await r.text(), cookie: r.headers.get('set-cookie')}
}

async function waitUntil(client, name, pred = () => true) {
    for (;;) {
        const args = await client.waitFor(name)
        if (pred(...args)) return args
    }
}

async function player(name) {
    const {id} = await session(DEV)
    const c = await new PollClient(DEV, {cookie: `sessionId=${id}`}).connect()
    assert.deepEqual(await c.waitFor('you-are'), [null])
    if (name) {
        await c.emit('login', {name})
        const [me] = await waitUntil(c, 'you-are', u => u !== null)
        c.me = me
    }
    c.sessionId = id
    return c
}

// The payload the front sends (Front/src/services/roomService getDefaultRoom()).
const roomPayload = (name, password = 'pw') => ({
    id: '', name, password, users: {}, objects: {}, characters: {}, roomHistory: [], gameConfigName: 'Murder',
})

test('/info returns version.txt', async () => {
    const want = fs.readFileSync(path.join(DIST, 'version.txt'), 'utf8').trim()
    assert.equal(await (await fetch(DEV + '/info')).text(), want)
})

test('/session issues an id cookie (debug flags in DEV) and echoes an existing one', async () => {
    const {id, cookie} = await session(DEV)
    assert.match(id, ID)
    assert.equal(cookie, `sessionId=${id}; Max-Age=604800; Path=/`)
    const again = await fetch(DEV + '/session', {headers: {cookie: `sessionId=${id}`}})
    assert.equal(await again.text(), id)
    assert.equal(again.headers.get('set-cookie'), null)
})

test('/session cookie in PROD: HttpOnly, Secure, SameSite=Strict, Domain=.hosh.it', async () => {
    const {id, cookie} = await session(PROD)
    assert.equal(cookie, `sessionId=${id}; Max-Age=604800; Domain=.hosh.it; Path=/; HttpOnly; Secure; SameSite=Strict`)
})

test('startup log has no dotenv banner (dotenv >= 17 prints one unless quiet)', () => {
    for (const env of ['DEV', 'PROD']) {
        assert.match(logs[env], /Server is Fire at/)
        assert.doesNotMatch(logs[env], /injecting env|injected env|\[dotenv@/)
    }
})

test('unknown routes redirect to /', async () => {
    const r = await fetch(DEV + '/some/page', {redirect: 'manual'})
    assert.deepEqual([r.status, r.headers.get('location')], [302, '/'])
})

test('login: name length rule, you-are (own sessionId), new-user broadcast and /users without session ids', async () => {
    const watcher = await player()
    const c = await player()
    try {
        await c.emit('login', {name: 'ab'})
        assert.deepEqual(await c.waitFor('error'), ['Name must be at least 3 characters long'])

        await c.emit('login', {name: 'Alice'})
        const [me] = await waitUntil(c, 'you-are', u => u !== null)
        assert.match(me.id, ID)
        assert.deepEqual([me.name, me.sessionId], ['Alice', c.sessionId])
        assert.equal(typeof me.lastActivity, 'number')
        const [announced] = await waitUntil(watcher, 'new-user')
        assert.deepEqual(announced, {id: me.id, name: 'Alice', lastActivity: me.lastActivity})

        // A session id is a login credential: other people never receive it.
        const users = await (await fetch(DEV + '/users')).json()
        assert.deepEqual(users.find(u => u.id === me.id), {id: me.id, name: 'Alice', lastActivity: me.lastActivity})
        assert.ok(users.every(u => !('sessionId' in u)))
        const [all] = await waitUntil(watcher, 'all-users', list => list.some(u => u.id === me.id))
        assert.ok(all.every(u => !('sessionId' in u)))

        // A reconnect with the same cookie is recognised.
        const back = await new PollClient(DEV, {cookie: `sessionId=${c.sessionId}`}).connect()
        assert.equal((await back.waitFor('you-are'))[0].id, me.id)
        await back.close()
    } finally {
        await watcher.close()
        await c.close()
    }
})

test('rooms: create, unique name, join with password, characters, objects, broadcast, delete', async () => {
    const host = await player('Hostess')
    const guest = await player('Guesty')
    const name = 'Manor-' + Date.now()
    try {
        await host.emit('new-room-and-join', roomPayload(name))
        const [room] = await waitUntil(host, 'update-room', r => r && r.name === name)
        assert.match(room.id, ID)
        assert.deepEqual(Object.keys(room.users), [host.me.id])
        assert.deepEqual(room.roomHistory, ['Hostess joined the party'])

        // Passwords and session ids stay on the server.
        assert.ok(!('password' in room))
        assert.ok(Object.values(room.users).every(u => !('sessionId' in u)))
        const listed = (await (await fetch(DEV + '/rooms')).json()).find(r => r.id === room.id)
        assert.deepEqual([listed.name, 'password' in listed], [name, false])

        await guest.emit('new-room', roomPayload(name))
        assert.deepEqual(await guest.waitFor('error'), ['Room with same name already exists'])

        await guest.emit('join-room', {roomId: room.id, password: 'nope'})
        assert.deepEqual(await guest.waitFor('error'), ['Wrong password'])
        await guest.emit('join-room', {roomId: room.id, password: 'pw'})
        await waitUntil(host, 'user-joined-room', u => u.name === 'Guesty')
        const [users] = await waitUntil(host, 'update-room-users', u => u.length === 2)
        assert.deepEqual(users.map(u => u.name).sort(), ['Guesty', 'Hostess'])

        await host.emit('choose-character', {roomId: room.id, characterId: 'butler'})
        const [withChar] = await waitUntil(host, 'update-room', r => r && r.characters.butler)
        assert.deepEqual(withChar.characters.butler, {id: host.me.id, name: 'Hostess', lastActivity: withChar.characters.butler.lastActivity})
        await guest.emit('choose-character', {roomId: room.id, characterId: 'butler'})
        assert.deepEqual(await guest.waitFor('error'), ['Character is already taken'])

        await guest.emit('update-room-objects', {roomId: room.id, objects: [{id: 'knife', owner: 'butler'}]})
        const [upd] = await waitUntil(host, 'room-object-update')
        assert.deepEqual([upd.user.name, upd.objects], ['Guesty', [{id: 'knife', owner: 'butler'}]])

        await host.emit('broadcast-to-room', {roomId: room.id, popUpMessage: {message: 'Lights out!'}})
        const [msg] = await waitUntil(guest, 'broadcast-from-room')
        assert.equal(msg.sender.name, 'Hostess')
        const [after] = await waitUntil(guest, 'update-room', r => r && r.roomHistory.includes('Lights out!'))
        assert.ok(after.roomHistory.includes('Hostess chose a character'))

        await guest.emit('delete-room', {roomId: room.id, password: 'nope'})
        assert.deepEqual(await guest.waitFor('error'), ['Wrong password'])
        await host.emit('delete-room', {roomId: room.id, password: 'pw'})
        assert.equal((await waitUntil(guest, 'room-deleted'))[0].by.name, 'Hostess')
        await waitUntil(guest, 'all-rooms', rooms => !rooms.some(r => r.id === room.id))
    } finally {
        await host.close()
        await guest.close()
    }
})

test('room fields come from the server: history initialised, injected users/characters ignored', async () => {
    const c = await player('Builder')
    try {
        const name = 'Shape-' + Date.now()
        await c.emit('new-room-and-join', {name, password: '', gameConfigName: 'Murder',
            users: {'XXX-000': {id: 'XXX-000', name: 'ghost'}}, characters: {butler: {id: 'XXX-000'}}})
        const [room] = await waitUntil(c, 'update-room', r => r && r.name === name)
        assert.deepEqual(Object.keys(room.users), [c.me.id])
        assert.deepEqual(room.characters, {})
        assert.deepEqual(room.roomHistory, ['Builder joined the party'])
    } finally {
        await c.close()
    }
})

test('joining by room code, as the front does: empty password, or none at all', async () => {
    const host = await player('Opener')
    const a = await player('Joiner')
    const b = await player('Nopass')
    try {
        const name = 'Open-' + Date.now()
        await host.emit('new-room-and-join', roomPayload(name, ''))
        const [room] = await waitUntil(host, 'update-room', r => r && r.name === name)
        await a.emit('join-room', {roomId: room.id, password: ''})
        assert.equal((await waitUntil(a, 'update-room', r => r && r.id === room.id))[0].id, room.id)
        await b.emit('join-room', {roomId: room.id})
        const [users] = await waitUntil(host, 'update-room-users', u => u.length === 3)
        assert.deepEqual(users.map(u => u.name).sort(), ['Joiner', 'Nopass', 'Opener'])
    } finally {
        await host.close()
        await a.close()
        await b.close()
    }
})

test('logout releases only the leaving player\'s character', async () => {
    const a = await player('Butler')
    const b = await player('Maidy')
    try {
        const name = 'Chars-' + Date.now()
        await a.emit('new-room-and-join', roomPayload(name, ''))
        const [room] = await waitUntil(a, 'update-room', r => r && r.name === name)
        await b.emit('join-room', {roomId: room.id, password: ''})
        await waitUntil(a, 'update-room-users', u => u.length === 2)
        // The other player picks first: the old bug released the room's FIRST character, not the leaver's.
        await b.emit('choose-character', {roomId: room.id, characterId: 'maid'})
        await waitUntil(b, 'update-room', r => r && r.characters.maid)
        await a.emit('choose-character', {roomId: room.id, characterId: 'butler'})
        await waitUntil(b, 'update-room', r => r && r.characters.butler && r.characters.maid)
        await a.emit('logout')
        const [after] = await waitUntil(b, 'update-room', r => r && !r.users[a.me.id])
        assert.deepEqual(Object.keys(after.characters), ['maid'])
        assert.equal(after.characters.maid.name, 'Maidy')
    } finally {
        await a.close()
        await b.close()
    }
})

test('CORS in PROD: murder.hosh.it is allowed, other origins are not', async () => {
    const pre = origin => fetch(PROD + '/rooms', {method: 'OPTIONS', headers: {origin, 'access-control-request-method': 'GET'}})
    const ok = await pre('https://murder.hosh.it')
    assert.equal(ok.headers.get('access-control-allow-origin'), 'https://murder.hosh.it')
    assert.equal(ok.headers.get('access-control-allow-credentials'), 'true')
    const ko = await pre('https://evil.example')
    assert.equal(ko.headers.get('access-control-allow-origin'), null)
})
