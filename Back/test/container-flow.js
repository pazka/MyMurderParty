// Capability check of a RUNNING container (scripts/smoke.sh), Node built-ins only. Run with the image's own
// node:  node test/container-flow.js http://127.0.0.1:PORT [play|empty]
//   play  (default): two players drive a whole party over Socket.IO like the front does (session cookie,
//         login, create-and-join, join by code, character, shared objects, room message), checked through
//         the REST endpoints too, then the room is deleted and both players log out.
//   keep:  one player creates the room "restart-probe" and leaves it there (state to lose on a restart).
//   empty: the server holds no user and no room (state is in memory: a restart starts from scratch).
'use strict'

const assert = require('node:assert/strict')
const {PollClient} = require('./sio-poll')

const BASE = process.argv[2]
const MODE = process.argv[3] || 'play'
const ID = /^[A-Z]{3}-\d{3}$/

async function json(path) {
    const r = await fetch(BASE + path)
    assert.equal(r.status, 200, path)
    return r.json()
}

async function waitUntil(client, name, pred = () => true) {
    for (;;) {
        const args = await client.waitFor(name)
        if (pred(...args)) return args
    }
}

async function player(name) {
    const r = await fetch(BASE + '/session')
    const id = await r.text()
    assert.match(id, ID)
    const c = await new PollClient(BASE, {cookie: `sessionId=${id}`}).connect()
    assert.deepEqual(await c.waitFor('you-are'), [null])
    await c.emit('login', {name})
    const [me] = await waitUntil(c, 'you-are', u => u !== null)
    assert.equal(me.sessionId, id)
    c.me = me
    return c
}

async function play() {
    const host = await player('Smoke Host')
    const guest = await player('Smoke Guest')
    try {
        const name = 'smoke-' + Date.now()
        await host.emit('new-room-and-join', {id: '', name, password: '', users: {}, objects: {}, characters: {},
            roomHistory: [], gameConfigName: 'Murder'})
        const [room] = await waitUntil(host, 'update-room', r => r && r.name === name)
        assert.match(room.id, ID)
        assert.deepEqual(room.roomHistory, ['Smoke Host joined the party'])

        const listed = (await json('/rooms')).find(r => r.id === room.id)
        assert.ok(listed, '/rooms lists the new room')
        assert.ok(!('password' in listed))
        const users = (await json('/users')).map(u => u.name).sort()
        assert.deepEqual(users, ['Smoke Guest', 'Smoke Host'])

        await guest.emit('join-room', {roomId: room.id, password: ''})
        await waitUntil(host, 'update-room-users', u => u.length === 2)
        await host.emit('choose-character', {roomId: room.id, characterId: 'butler'})
        await waitUntil(guest, 'update-room', r => r && r.characters.butler)
        await guest.emit('update-room-objects', {roomId: room.id, objects: [{id: 'knife', owner: 'butler'}]})
        const [upd] = await waitUntil(host, 'room-object-update')
        assert.deepEqual(upd.objects, [{id: 'knife', owner: 'butler'}])
        await host.emit('broadcast-to-room', {roomId: room.id, popUpMessage: {message: 'Lights out!'}})
        assert.equal((await waitUntil(guest, 'broadcast-from-room'))[0].sender.name, 'Smoke Host')

        await host.emit('delete-room', {roomId: room.id, password: ''})
        await waitUntil(guest, 'room-deleted')
        await host.emit('logout')
        await guest.emit('logout')
        await waitUntil(host, 'all-users', u => u.length === 0)
    } finally {
        await host.close()
        await guest.close()
    }
    assert.deepEqual(await json('/rooms'), [])
}

async function keep() {
    const c = await player('Restart Probe')
    try {
        await c.emit('new-room-and-join', {name: 'restart-probe', password: '', gameConfigName: 'Murder'})
        await waitUntil(c, 'update-room', r => r && r.name === 'restart-probe')
    } finally {
        await c.close()
    }
    assert.ok((await json('/rooms')).some(r => r.name === 'restart-probe'))
}

async function empty() {
    assert.deepEqual(await json('/rooms'), [])
    assert.deepEqual(await json('/users'), [])
}

;({play, keep, empty}[MODE] || (() => Promise.reject(new Error('mode: play|keep|empty'))))().then(
    () => console.log(`container-flow ${MODE}: OK`),
    e => { console.error(`container-flow ${MODE}: FAIL`, e); process.exit(1) })
