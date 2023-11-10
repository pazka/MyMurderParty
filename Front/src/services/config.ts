const config = {
    "DEV": {
        host: "http://localhost:8001",
        debug: true
    },
    "STAGING": {
        host: "http://dev.localhost:9874",
        debug: false
    },
    "PROD": {
        host: "https://murder.hosh.it",
        debug: false
    }
}

let currentConfig = config.PROD

if (window.location.hostname == 'localhost') {
    currentConfig = config.DEV
} else if (window.location.hostname == 'dev.localhost') {
    currentConfig = config.STAGING
} else {
    currentConfig = config.PROD
}

export default currentConfig