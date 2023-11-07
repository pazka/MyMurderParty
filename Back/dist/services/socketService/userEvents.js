"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userService_1 = require("../userService");
const roomEvents_1 = require("./roomEvents");
const cookie_1 = __importDefault(require("cookie"));
const socket_io_1 = require("../socket-io");
const roomService_1 = require("../roomService");
exports.default = (userSocket, io) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const cookies = cookie_1.default.parse((_a = userSocket.handshake.headers.cookie) !== null && _a !== void 0 ? _a : "");
    console.log('New socket connection', userSocket.id, 'from', userSocket.handshake.address, 'with', userSocket.handshake.headers['user-agent'], "sessionId?", cookies.sessionId);
    (0, roomEvents_1.resetRoomForUser)(userSocket);
    let currentUser = yield (0, userService_1.getUserBySessionId)(cookies.sessionId);
    //case user already has a session but hasn't logged in yet
    if (currentUser) {
        (0, roomEvents_1.setupUserRoomEvents)(currentUser, userSocket, io);
        (0, userService_1.pingUser)(currentUser.id);
        userSocket.emit('you-are', currentUser);
    }
    (0, socket_io_1.broadcastAllClients)();
    (0, socket_io_1.broadcastAllRooms)();
    (0, roomService_1.getRoomsOfUser)((_b = currentUser === null || currentUser === void 0 ? void 0 : currentUser.id) !== null && _b !== void 0 ? _b : "").then((rooms) => {
        rooms.forEach((room) => {
            userSocket.join(room.id);
            (0, roomEvents_1.notifyRoomUpdate)(io, room.id);
        });
    });
    userSocket.onAny((event, ...args) => {
        console.log(`Received ${event} with args : `, args);
    });
    //case user session is linked ot nothing
    userSocket.on('login', (data) => {
        var _a, _b;
        if (currentUser) {
            userSocket.emit('error', "You are already logged in");
            return;
        }
        if (((_b = (_a = data === null || data === void 0 ? void 0 : data.name) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) < 3) {
            userSocket.emit('error', "Name must be at least 3 characters long");
            return;
        }
        console.log("Hello ! I'm", data);
        (0, userService_1.createNewUser)(data, cookies.sessionId).then((user) => {
            console.log(user);
            currentUser = user;
            (0, roomEvents_1.setupUserRoomEvents)(currentUser, userSocket, io);
            io.emit('new-user', currentUser);
            (0, socket_io_1.broadcastAllClients)();
        });
    });
    userSocket.on('disconnect', () => {
        console.log('Socket disconnected', userSocket.id);
        if (!currentUser)
            return;
        (0, userService_1.pingUser)(currentUser.id, true);
        (0, socket_io_1.broadcastAllClients)();
    });
    userSocket.on('logout', () => {
        if (!currentUser)
            return;
        (0, userService_1.deleteUser)(currentUser.id);
        (0, roomService_1.userLeaveAllRooms)(currentUser.id);
        currentUser = undefined;
        console.log('Socket deleted', userSocket.id);
        (0, socket_io_1.broadcastAllClients)();
        (0, socket_io_1.broadcastAllRooms)();
    });
    userSocket.on('choose-character', (data) => {
        if (!currentUser)
            return;
        (0, roomService_1.userChoosesACharacter)(currentUser.id, data.roomId, data.characterId).then(x => {
            userSocket.emit('you-are', currentUser);
            (0, roomEvents_1.notifyRoomUpdate)(io, data.roomId);
            (0, socket_io_1.broadcastAllClients)();
        }).catch((err) => {
            console.log(err.message);
            userSocket.emit('error', err.message);
        });
    });
    userSocket.on('ping', () => {
        if (!currentUser)
            return;
        (0, userService_1.pingUser)(currentUser.id);
    });
});
