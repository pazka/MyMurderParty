"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserCRUD = exports.RoomCRUD = exports.BaseEntityORM = void 0;
const userService_1 = require("../userService");
let data = {
    rooms: {},
    users: {}
};
class BaseEntityORM {
    constructor(entityData) {
        this.create = (obj) => {
            const createdObj = Object.assign(Object.assign({}, obj), { id: "id-" + (0, userService_1.generateId)() });
            this.entityData[createdObj.id] = createdObj;
            return Object.assign({}, createdObj);
        };
        this.read = (id) => {
            return Object.assign({}, this.entityData[id]);
        };
        this.readAll = () => {
            return [...Object.values(this.entityData)];
        };
        this.update = (obj) => {
            this.entityData[obj.id] = obj;
            return Object.assign({}, obj);
        };
        this.delete = (id) => {
            delete this.entityData[id];
        };
        this.entityData = entityData;
    }
}
exports.BaseEntityORM = BaseEntityORM;
//Rooms CRUD
exports.RoomCRUD = new BaseEntityORM(data.rooms);
//Users CRUD
exports.UserCRUD = new BaseEntityORM(data.users);
