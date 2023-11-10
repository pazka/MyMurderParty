"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    "DEV": {
        target: "localhost",
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"],
            credentials: true,
        },
        domain: "localhost",
        debug: true,
        port: 8001
    },
    "STAGING": {
        target: "0.0.0.0",
        cors: {
            origins: ["http://dev.localhost/", "http://dev.localhost/:9874"],
            methods: ["GET", "POST"],
            credentials: true,
        },
        domain: "localhost",
        debug: true,
        port: 80
    },
    "PROD": {
        target: "0.0.0.0",
        cors: {
            origins: ["https://murder.hosh.it"],
            methods: ["GET", "POST"],
            credentials: true,
        },
        domain: ".hosh.it",
        debug: false,
        port: 80
    }
};
let currentConfig = config.PROD;
if (process.env.ENV != null && process.env.ENV != "") {
    currentConfig = config[process.env.ENV];
}
exports.default = currentConfig;
