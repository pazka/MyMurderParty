// Post-deploy capability check, run INSIDE the container by hosh-deploy (deploy/hosh-deploy.conf POST_DEPLOY;
// plain argv, no shell):  node /app/ops/smoke.js http://127.0.0.1:8000
// Read-only on purpose (production players see every room): creates no user and no room. Checks the front,
// /info, /healthz, /rooms + /users shapes (no passwords / session ids), the PROD CORS allow-list, and a real
// Socket.IO connection (engine.io handshake, namespace connect, the server's "you-are" + lists). Exit 1 on failure.
'use strict'
const assert = require('node:assert/strict')

const BASE = process.argv[2] || 'http://127.0.0.1:8000'
const SEP = '\x1e'
const t = {signal: AbortSignal.timeout(5000)}
const get = path => fetch(BASE + path, {...t, redirect: 'manual'})

async function socketIo() {
    const url = sid => `${BASE}/socket.io/?EIO=4&transport=polling${sid ? '&sid=' + sid : ''}`
    const open = await (await fetch(url(), t)).text()
    assert.equal(open[0], '0', 'engine.io open packet')
    const {sid} = JSON.parse(open.slice(1))
    const post = async body => assert.equal(await (await fetch(url(sid), {...t, method: 'POST', body,
        headers: {'content-type': 'text/plain;charset=UTF-8'}})).text(), 'ok')
    await post('40')
    const seen = new Set()
    const until = Date.now() + 5000
    while (!(seen.has('connect') && seen.has('you-are') && seen.has('all-rooms')) && Date.now() < until) {
        for (const p of (await (await fetch(url(sid), t)).text()).split(SEP)) {
            if (p.startsWith('40')) seen.add('connect')
            else if (p.startsWith('42')) {
                const [name, arg] = JSON.parse(p.slice(2))
                if (name === 'you-are') assert.equal(arg, null, 'anonymous socket is nobody')
                if (name === 'all-rooms') assert.ok(Array.isArray(arg))
                seen.add(name)
            }
        }
    }
    await post('1').catch(() => {})
    assert.ok(seen.has('connect') && seen.has('you-are') && seen.has('all-rooms'), 'socket.io events: ' + [...seen])
}

async function main() {
    let r = await get('/')
    assert.equal(r.status, 200, 'GET /')
    assert.match(await r.text(), /<div id="root">/, 'front index')

    r = await get('/info')
    assert.equal(r.status, 200, '/info')
    assert.match(await r.text(), /^\d+\.\d+\.\d+$/)

    r = await get('/healthz')
    assert.equal(r.status, 200, '/healthz')
    const h = await r.json()
    assert.equal(h.status, 'ok')
    for (const k of ['users', 'rooms', 'sockets']) assert.ok(Number.isInteger(h[k]), 'healthz.' + k)

    const rooms = await (await get('/rooms')).json()
    assert.ok(Array.isArray(rooms) && rooms.every(x => !('password' in x)), '/rooms: list without passwords')
    const users = await (await get('/users')).json()
    assert.ok(Array.isArray(users) && users.every(x => !('sessionId' in x)), '/users: list without session ids')

    r = await fetch(BASE + '/rooms', {...t, method: 'OPTIONS',
        headers: {origin: 'https://murder.hosh.it', 'access-control-request-method': 'GET'}})
    assert.equal(r.headers.get('access-control-allow-origin'), 'https://murder.hosh.it', 'CORS (ENV=PROD)')

    await socketIo()
    console.log(`smoke OK: front, /info ${h.version}, /healthz (${h.users} users, ${h.rooms} rooms), /rooms, /users, CORS, socket.io`)
}

main().catch(e => { console.error('smoke FAIL:', e.message); process.exit(1) })
