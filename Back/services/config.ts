const config = {
    "DEV": {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"],
            credentials: true
        },
        debug: true
    },
    "PROD": {
        cors: {
            origin: "https://murder.hosh.it",
            methods: ["GET", "POST"],
            credentials: true
        },
        debug: false
    }
}

let currentConfig = config.PROD

if (process.env.ENV == "DEV") {
    currentConfig = config.DEV
}

export default currentConfig