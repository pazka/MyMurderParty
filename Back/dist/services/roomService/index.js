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
exports.deleteRoom = exports.userLeaveAllRooms = exports.updateRoomObjects = exports.userChoosesACharacter = exports.userLeaveRoom = exports.userJoinRoom = exports.createNewRoomWithOneUser = exports.getUsersInRoom = exports.createNewRoom = exports.getRoomsOfUser = exports.getAllRooms = void 0;
const persist_1 = require("../persist");
const persist_2 = require("../persist");
const socket_io_1 = require("../socket-io");
const roomEvents_1 = require("../socketService/roomEvents");
const getAllRooms = () => __awaiter(void 0, void 0, void 0, function* () {
    const allRooms = persist_1.RoomCRUD.readAll();
    return allRooms;
});
exports.getAllRooms = getAllRooms;
const getRoomsOfUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const allRooms = yield (0, exports.getAllRooms)();
    const roomsOfUser = allRooms.filter(r => r.users[userId]);
    return roomsOfUser;
});
exports.getRoomsOfUser = getRoomsOfUser;
const createNewRoom = (newRoom) => __awaiter(void 0, void 0, void 0, function* () {
    if (newRoom.name.length < 3) {
        throw new Error("Room name must be at least 3 characters long");
    }
    //check that room with same name dosen't already exist 
    const allRooms = yield (0, exports.getAllRooms)();
    if (allRooms.find(r => r.name === newRoom.name)) {
        throw new Error("Room with same name already exists");
    }
    let createdRoom = persist_1.RoomCRUD.create(newRoom);
    createdRoom = Object.assign(Object.assign({}, createdRoom), { users: {}, objects: {}, characters: {} });
    persist_1.RoomCRUD.update(createdRoom);
    return createdRoom;
});
exports.createNewRoom = createNewRoom;
const getUsersInRoom = (roomId) => __awaiter(void 0, void 0, void 0, function* () {
    const room = persist_1.RoomCRUD.read(roomId);
    if (!room) {
        return [];
    }
    const allUsers = persist_2.UserCRUD.readAll();
    const allUsersInRoom = allUsers.filter(u => room.users[u.id]);
    return allUsersInRoom;
});
exports.getUsersInRoom = getUsersInRoom;
const createNewRoomWithOneUser = (newRoom, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const room = yield (0, exports.createNewRoom)(newRoom);
    //check that user exists
    const user = persist_2.UserCRUD.read(userId);
    if (!user) {
        throw new Error("User does not exist");
    }
    room.users[userId] = user;
    persist_1.RoomCRUD.update(room);
    return room;
});
exports.createNewRoomWithOneUser = createNewRoomWithOneUser;
const userJoinRoom = (roomId, password, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const room = persist_1.RoomCRUD.read(roomId);
    const user = persist_2.UserCRUD.read(userId);
    if (!room || !user) {
        throw new Error("User or room does not exist");
    }
    if (room.users[userId]) {
        return room;
    }
    //check password 
    if (room.password !== password) {
        throw new Error("Wrong password");
    }
    //check if there is already a user with the same name in the party
    const allUsersInRoom = yield (0, exports.getUsersInRoom)(roomId);
    if (allUsersInRoom.find(u => u.name === user.name)) {
        throw new Error("User with same name already exists in the party");
    }
    room.users[userId] = user;
    room.roomHistory.push(`${user.name} joined the party`);
    persist_1.RoomCRUD.update(room);
    return room;
});
exports.userJoinRoom = userJoinRoom;
const userLeaveRoom = (roomId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const room = persist_1.RoomCRUD.read(roomId);
    const user = persist_2.UserCRUD.read(userId);
    if (!room || !user) {
        return;
    }
    if (!room.users[userId]) {
        throw new Error("User does not exist in the party");
    }
    room.roomHistory.push(`${user.name} left the party`);
    delete room.users[userId];
    persist_1.RoomCRUD.update(room);
    persist_2.UserCRUD.update(user);
});
exports.userLeaveRoom = userLeaveRoom;
const userChoosesACharacter = (userId, roomId, characterId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const room = persist_1.RoomCRUD.read(roomId);
    const currentUser = persist_2.UserCRUD.read(userId);
    if (!room || !currentUser) {
        return;
    }
    //check if user has another character in the party
    const takenByUserCharId = (_a = Object.entries(room.characters).find(([charId, user]) => user.id === userId)) === null || _a === void 0 ? void 0 : _a[0];
    if (takenByUserCharId && takenByUserCharId == characterId)
        return;
    if (takenByUserCharId && takenByUserCharId != characterId) {
        //remove the current character from the user
        delete room.characters[takenByUserCharId];
        room.roomHistory.push(`${currentUser.name} left a character`);
    }
    if (room.characters[characterId]) {
        throw new Error("Character is already taken");
        return;
    }
    room.characters[characterId] = currentUser;
    room.roomHistory.push(`${currentUser.name} chose a character`);
    persist_1.RoomCRUD.update(room);
});
exports.userChoosesACharacter = userChoosesACharacter;
const updateRoomObjects = (userId, roomId, objects) => __awaiter(void 0, void 0, void 0, function* () {
    const room = persist_1.RoomCRUD.read(roomId);
    if (!room) {
        return;
    }
    room.objects = objects;
    persist_1.RoomCRUD.update(room);
});
exports.updateRoomObjects = updateRoomObjects;
const userLeaveAllRooms = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const allRooms = yield (0, exports.getAllRooms)();
    allRooms.forEach(room => {
        var _a;
        //check if user has another character in the party
        const characterId = (_a = Object.entries(room.characters).find(([charId, userId]) => userId === userId)) === null || _a === void 0 ? void 0 : _a[0];
        if (characterId)
            delete room.characters[characterId];
        if (room.users[userId]) {
            delete room.users[userId];
            persist_1.RoomCRUD.update(room);
        }
        (0, roomEvents_1.notifyRoomUpdate)((0, socket_io_1.getIo)(), room.id);
    });
});
exports.userLeaveAllRooms = userLeaveAllRooms;
const deleteRoom = (roomId) => __awaiter(void 0, void 0, void 0, function* () {
    persist_1.RoomCRUD.delete(roomId);
    (0, socket_io_1.broadcastAllRooms)();
});
exports.deleteRoom = deleteRoom;
