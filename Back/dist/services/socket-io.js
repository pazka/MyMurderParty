"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIo = exports.broadcastAllRooms = exports.broadcastAllClients = exports.initIo = void 0;
const socket_io_1 = require("socket.io");
const userService_1 = require("./userService");
const roomService_1 = require("./roomService");
let _io = null;
const initIo = (server, option) => {
    _io = new socket_io_1.Server(server, option);
    return _io;
};
exports.initIo = initIo;
const broadcastAllClients = () => {
    (0, userService_1.getAllUsers)().then((allUsers) => _io === null || _io === void 0 ? void 0 : _io.emit('all-users', allUsers));
};
exports.broadcastAllClients = broadcastAllClients;
const broadcastAllRooms = () => {
    (0, roomService_1.getAllRooms)().then((allUsers) => _io === null || _io === void 0 ? void 0 : _io.emit('all-rooms', allUsers));
};
exports.broadcastAllRooms = broadcastAllRooms;
const getIo = () => {
    if (!_io) {
        throw new Error("Socket io has not been initialized");
    }
    return _io;
};
exports.getIo = getIo;
