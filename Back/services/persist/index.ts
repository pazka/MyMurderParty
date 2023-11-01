let data: AppDatabase = {
    rooms: {},
    users: {}
}

export class BaseEntityORM<T extends AppDatabaseEntity>{
    entityData: { [id: string]: T };
    constructor(entityData: { [id: string]: T }) {
        this.entityData = entityData;
    }

    create = (obj: (T & NewAppDatabaseEntity)): (T & AppDatabaseEntity) => {
        if (obj.id === undefined) {
            const createdObj = obj as T;
            obj.id = Math.random().toString(36).substring(7);
            this.entityData[obj.id] = createdObj;
        }

        return obj;
    }

    read = (id: string) : T => {
        return this.entityData[id]
    }

    readAll = () : T[] => {
        return Object.values(this.entityData);
    }

    update = (obj: T) : T => {
        this.entityData[obj.id] = obj;
        return obj;
    }

    delete = (id: string) => {
        delete this.entityData[id];
    }
}

//Rooms CRUD
export const RoomCRUD = new BaseEntityORM<Room>(data.rooms);

//Users CRUD
export const UserCRUD = new BaseEntityORM<User>(data.users);