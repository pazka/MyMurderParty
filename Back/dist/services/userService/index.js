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
exports.generateId = exports.deleteUser = exports.pingUser = exports.updateUser = exports.getAllUsers = exports.getUser = exports.createOrGetNewUser = exports.getUserBySessionId = exports.createNewUser = void 0;
const persist_1 = require("../persist");
const createNewUser = (newUser, sessionId) => __awaiter(void 0, void 0, void 0, function* () {
    const createdUser = persist_1.UserCRUD.create(newUser);
    createdUser.lastActivity = Date.now();
    createdUser.sessionId = sessionId;
    persist_1.UserCRUD.update(createdUser);
    return createdUser;
});
exports.createNewUser = createNewUser;
const getUserBySessionId = (sessionId) => __awaiter(void 0, void 0, void 0, function* () {
    const allUsers = persist_1.UserCRUD.readAll();
    const user = allUsers.find((user) => user.sessionId === sessionId);
    return user;
});
exports.getUserBySessionId = getUserBySessionId;
const createOrGetNewUser = (newUser, sessionId) => __awaiter(void 0, void 0, void 0, function* () {
    const allUsers = persist_1.UserCRUD.readAll();
    const user = allUsers.find((user) => user.sessionId === sessionId);
    if (user) {
        return user;
    }
    else {
        return (0, exports.createNewUser)(newUser, sessionId);
    }
});
exports.createOrGetNewUser = createOrGetNewUser;
const getUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = persist_1.UserCRUD.read(userId);
    return user;
});
exports.getUser = getUser;
const getAllUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    const allUsers = persist_1.UserCRUD.readAll();
    return allUsers;
});
exports.getAllUsers = getAllUsers;
const updateUser = (user) => __awaiter(void 0, void 0, void 0, function* () {
    persist_1.UserCRUD.update(user);
    return user;
});
exports.updateUser = updateUser;
const pingUser = (userId, disconnected = false) => __awaiter(void 0, void 0, void 0, function* () {
    const user = persist_1.UserCRUD.read(userId);
    user.lastActivity = Date.now();
    if (disconnected)
        user.lastActivity = -1;
    persist_1.UserCRUD.update(user);
});
exports.pingUser = pingUser;
const deleteUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    persist_1.UserCRUD.delete(userId);
});
exports.deleteUser = deleteUser;
const generateId = () => {
    return Array(4).fill(0).map(x => Math.random().toString(36).substring(2, 5)).join('-');
};
exports.generateId = generateId;
