"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
//For env File 
dotenv_1.default.config();
const fs_1 = __importDefault(require("fs"));
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const http_1 = __importDefault(require("http"));
const server = http_1.default.createServer(app);
const userEvents_1 = __importDefault(require("./services/socketService/userEvents"));
const roomService_1 = require("./services/roomService");
const config_1 = __importDefault(require("./services/config"));
const userService_1 = require("./services/userService");
const cors_1 = __importDefault(require("cors"));
const cookie_1 = __importDefault(require("cookie"));
const socket_io_1 = require("./services/socket-io");
const io = (0, socket_io_1.initIo)(server, { cors: config_1.default.cors });
const getVersion = () => {
    const versionTxt = fs_1.default.readFileSync('./version.txt');
    const version = versionTxt.toString();
    const versionArray = version.split('.');
    return versionArray.map((v) => parseInt(v));
};
const port = process.env.PORT || 8000;
app.use(express_1.default.json());
app.use((0, cors_1.default)(config_1.default.cors));
app.use(express_1.default.static('public'));
app.get('/session', (req, res) => {
    var _a;
    console.log("Session Request : existant : " + req.headers.cookie);
    const cookies = cookie_1.default.parse((_a = req.headers.cookie) !== null && _a !== void 0 ? _a : '');
    if (cookies.sessionId) {
        return res.send(cookies.sessionId);
    }
    //setcookie if not found
    const sessionId = "sess_" + (0, userService_1.generateId)();
    res.setHeader('Set-Cookie', cookie_1.default.serialize('sessionId', sessionId, Object.assign({ path: '/', httpOnly: config_1.default.debug ? false : true, secure: config_1.default.debug ? false : true, maxAge: 60 * 60 * 24 * 7 }, (config_1.default.debug ? {} : {
        sameSite: 'strict',
        domain: config_1.default.domain
    }))));
    res.send(sessionId);
});
app.get('/info', (req, res) => {
    res.send(getVersion().join('.'));
});
app.get('/users', (req, res) => {
    (0, userService_1.getAllUsers)().then((users) => {
        res.send(users);
    });
});
app.get('/rooms', (req, res) => {
    return (0, roomService_1.getAllRooms)().then((rooms) => {
        res.send(rooms);
    });
});
//Socket.io
io.on('connection', (userSocket) => {
    (0, userEvents_1.default)(userSocket, io);
});
server.listen(port, () => {
    console.log(`Server is Fire at http://localhost:${port}`);
});
