// Image HEALTHCHECK / compose healthcheck: GET /healthz on the port the server listens on (same config:
// ENV + PORT), exit 0 only on 200 + {"status":"ok"}. Node built-ins only (the image has no curl).
//   node /app/ops/healthcheck.js
'use strict'
const config = require('../services/config').default
const host = !config.target || config.target === '0.0.0.0' ? '127.0.0.1' : config.target
fetch(`http://${host}:${config.port}/healthz`, {signal: AbortSignal.timeout(4000)})
    .then(async r => {
        const body = await r.json()
        if (r.status !== 200 || body.status !== 'ok') throw new Error(`${r.status} ${JSON.stringify(body)}`)
    })
    .then(() => process.exit(0), e => { console.error('unhealthy:', e.message); process.exit(1) })
