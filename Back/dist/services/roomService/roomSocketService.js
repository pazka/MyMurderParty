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
exports.ensureRoomExistOrError = exports.ensureUserIsInARoom = void 0;
const _1 = require(".");
const persist_1 = require("../persist");
const ensureUserIsInARoom = (userId, roomId, userSocket) => __awaiter(void 0, void 0, void 0, function* () {
    const room = persist_1.RoomCRUD.read(roomId);
    if (!room) {
        userSocket.emit('error', "Room does not exist");
        return false;
    }
    const rooms = yield (0, _1.getRoomsOfUser)(userId);
    if (rooms.length === 0) {
        userSocket.emit('error', "You are not in a room");
        return false;
    }
    if (!rooms.find(r => r.id === roomId)) {
        userSocket.emit('error', "You are not in this party");
        return false;
    }
    return true;
});
exports.ensureUserIsInARoom = ensureUserIsInARoom;
const ensureRoomExistOrError = (roomId, userSocket) => __awaiter(void 0, void 0, void 0, function* () {
    const room = persist_1.RoomCRUD.read(roomId);
    if (!room) {
        userSocket.emit('error', "Room does not exist");
        return false;
    }
    return true;
});
exports.ensureRoomExistOrError = ensureRoomExistOrError;
