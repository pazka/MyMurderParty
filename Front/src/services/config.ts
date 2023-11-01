const config = {
    "DEV": {
        host: "http://localhost:8001",
        debug: true
    },
    "PROD": {
        host: "https://murder.hosh.it",
        debug: false
    }
}

let currentConfig = config.PROD

if (window.location.href.includes('localhost')) {
    currentConfig = config.DEV
}

export default currentConfig