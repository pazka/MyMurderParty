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
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetRoomForUser = exports.notifyRoomUpdate = exports.setupUserRoomEvents = void 0;
const persist_1 = require("../persist");
const roomService_1 = require("../roomService");
const roomSocketService_1 = require("../roomService/roomSocketService");
const socket_io_1 = require("../socket-io");
const userService_1 = require("../userService");
const setupUserRoomEvents = (user, userSocket, io) => {
    //check if user is in a room
    userSocket.on('new-room', (newRoom) => {
        console.log("New room creation : ", newRoom);
        (0, roomService_1.createNewRoom)(newRoom).then((createdRoom) => __awaiter(void 0, void 0, void 0, function* () {
            (0, socket_io_1.broadcastAllRooms)();
        })).catch((err) => {
            console.log(err.message);
            userSocket.emit('error', err.message);
        });
    });
    userSocket.on('join-room', (data) => __awaiter(void 0, void 0, void 0, function* () {
        (0, userService_1.pingUser)(user.id);
        if (!(yield (0, roomSocketService_1.ensureRoomExistOrError)(data.roomId, userSocket)))
            return;
        (0, roomService_1.userJoinRoom)(data.roomId, data.password, user.id).then((room) => {
            userSocket.join(room.id);
            io.to(room.id).emit('user-joined-room', user);
            (0, exports.notifyRoomUpdate)(io, room.id);
        }).catch((err) => {
            console.log(err.message);
            userSocket.emit('error', err.message);
        });
    }));
    userSocket.on('leave-room', (data) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        (0, userService_1.pingUser)(user.id);
        const rooms = yield (0, roomService_1.getRoomsOfUser)(user.id);
        //check if user is in this room
        const currentRoomId = (_a = rooms.find(r => r.id === data.roomId)) === null || _a === void 0 ? void 0 : _a.id;
        if (!currentRoomId) {
            userSocket.emit('error', "You are not in this room");
            return;
        }
        (0, roomService_1.userLeaveRoom)(data.roomId, user.id).then(() => {
            var _a;
            userSocket.leave(data.roomId);
            userSocket.emit('update-room', null);
            io.to(data.roomId).emit('user-left-room', user);
            (0, exports.notifyRoomUpdate)(io, (_a = data.roomId) !== null && _a !== void 0 ? _a : "");
        }).catch((err) => {
            console.log(err.message);
            userSocket.emit('error', err.message);
        });
    }));
    userSocket.on('update-room-objects', (data) => __awaiter(void 0, void 0, void 0, function* () {
        (0, userService_1.pingUser)(user.id);
        if (!(yield (0, roomSocketService_1.ensureUserIsInARoom)(user.id, data.roomId, userSocket))) {
            console.log("User is not in the room");
            return;
        }
        ;
        (0, roomService_1.updateRoomObjects)(user.id, data.roomId, data.objects).then(() => {
            io.to(data.roomId).emit('room-object-update', { user, objects: data.objects });
            (0, exports.notifyRoomUpdate)(io, data.roomId);
        }).catch((err) => {
            console.log(err.message);
            userSocket.emit('error', err.message);
        });
    }));
    userSocket.on('broadcast-to-room', (data) => __awaiter(void 0, void 0, void 0, function* () {
        (0, userService_1.pingUser)(user.id);
        if (!(yield (0, roomSocketService_1.ensureUserIsInARoom)(user.id, data.roomId, userSocket)))
            return;
        const room = persist_1.RoomCRUD.read(data.roomId);
        room.roomHistory.push(`${user.name} : ${data.message}`);
        persist_1.RoomCRUD.update(room);
        io.to(data.roomId).emit('broadcast-from-room', { sender: user, data });
        (0, exports.notifyRoomUpdate)(io, data.roomId);
    }));
    userSocket.on('delete-room', (data) => __awaiter(void 0, void 0, void 0, function* () {
        (0, userService_1.pingUser)(user.id);
        if (!(yield (0, roomSocketService_1.ensureRoomExistOrError)(data.roomId, userSocket)))
            return;
        const room = persist_1.RoomCRUD.read(data.roomId);
        if (room.password !== data.password) {
            userSocket.emit('error', "Wrong password");
            return;
        }
        io.to(data.roomId).emit('room-deleted', { by: user });
        //make all user who joined room leave 
        Object.keys(room.users).forEach(userId => {
            (0, roomService_1.userLeaveRoom)(data.roomId, userId);
        });
        persist_1.RoomCRUD.delete(data.roomId);
        (0, socket_io_1.broadcastAllRooms)();
    }));
};
exports.setupUserRoomEvents = setupUserRoomEvents;
const notifyRoomUpdate = (io, roomId) => __awaiter(void 0, void 0, void 0, function* () {
    const room = persist_1.RoomCRUD.read(roomId);
    const users = yield (0, roomService_1.getUsersInRoom)(roomId);
    io.to(roomId).emit('update-room', room);
    io.to(roomId).emit('update-room-users', users);
    (0, socket_io_1.broadcastAllRooms)();
});
exports.notifyRoomUpdate = notifyRoomUpdate;
const resetRoomForUser = (userSocket) => __awaiter(void 0, void 0, void 0, function* () {
    userSocket.emit('update-room', null);
    userSocket.emit('update-room-users', []);
});
exports.resetRoomForUser = resetRoomForUser;
