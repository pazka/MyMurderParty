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

async function start(env, marker) {
    let log = ''
    const p = spawn(process.execPath, ['index.js'], {cwd: DIST, env: {...process.env, ENV: env}})
    p.stdout.on('data', d => { log += d })
    p.stderr.on('data', d => { log += d })
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

test('unknown routes redirect to /', async () => {
    const r = await fetch(DEV + '/some/page', {redirect: 'manual'})
    assert.deepEqual([r.status, r.headers.get('location')], [302, '/'])
})

test('login: name length rule, you-are, new-user broadcast; /users lists users WITH their sessionId', async () => {
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
        assert.deepEqual((await waitUntil(watcher, 'new-user'))[0].name, 'Alice')

        // Known issue kept as is (TESTING.md): anyone can read every session id here.
        const users = await (await fetch(DEV + '/users')).json()
        assert.ok(users.some(u => u.id === me.id && u.sessionId === c.sessionId))

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

        // Known issue kept as is: room passwords are public.
        const listed = (await (await fetch(DEV + '/rooms')).json()).find(r => r.id === room.id)
        assert.equal(listed.password, 'pw')

        await guest.emit('new-room', roomPayload(name))
        assert.deepEqual(await guest.waitFor('error'), ['Room with same name already exists'])

        await guest.emit('join-room', {roomId: room.id, password: 'nope'})
        assert.deepEqual(await guest.waitFor('error'), ['Wrong password'])
        await guest.emit('join-room', {roomId: room.id, password: 'pw'})
        await waitUntil(host, 'user-joined-room', u => u.name === 'Guesty')
        const [users] = await waitUntil(host, 'update-room-users', u => u.length === 2)
        assert.deepEqual(users.map(u => u.name).sort(), ['Guesty', 'Hostess'])

        await host.emit('choose-character', {roomId: room.id, characterId: 'butler'})
        await waitUntil(host, 'update-room', r => r && r.characters.butler)
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

test('quirk: a room created without roomHistory cannot be joined (the server trusts the client shape)', async () => {
    const c = await player('Quirky')
    try {
        const {roomHistory, ...noHistory} = roomPayload('NoHistory-' + Date.now())
        await c.emit('new-room-and-join', noHistory)
        const [err] = await c.waitFor('error')
        assert.match(err, /reading 'push'/)
    } finally {
        await c.close()
    }
})
