const config = {
    "DEV": {
        target : "localhost",
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"],
            credentials: true,
        },
        domain : "localhost",
        debug: true,
        port : 8001
    },
    "STAGING": {
        target : "0.0.0.0",
        cors: {
            origin: ["http://dev.localhost", "http://dev.localhost:9874"],
            methods: ["GET", "POST"],
            credentials: true,
        },
        domain : "localhost",
        debug: true,
        port : 80
    },
    "PROD": {
        target : "0.0.0.0",
        cors: {
            origin: ["https://murder.hosh.it"],
            methods: ["GET", "POST"],
            credentials: true,
        },
        domain : ".hosh.it",
        debug: false,
        port : 80
    }
}

let currentConfig = config.PROD

if (process.env.ENV != null && process.env.ENV != "") {
    currentConfig = (config as any)[process.env.ENV]
}

// PORT (optional) overrides the listen port of the chosen config: the hosh-deploy compose sets PORT=8000;
// unset, PROD/STAGING listen on 80 and DEV on 8001 as before (legacy box compose: 127.0.0.1:9674 -> 80).
if (process.env.PORT != null && process.env.PORT != "") {
    const port = Number(process.env.PORT)
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        throw new Error(`PORT must be an integer 1-65535 (got "${process.env.PORT}")`)
    }
    currentConfig = { ...currentConfig, port }
}

export default currentConfig