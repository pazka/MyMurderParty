let data: AppDatabase = {
    rooms: {},
    users: {}
}

export class BaseEntityORM<T extends AppDatabaseEntity & NewT, NewT extends NewAppDatabaseEntity>{
    private entityData: { [id: string]: T };
    constructor(entityData: { [id: string]: T }) {
        this.entityData = entityData;
    }

    create = (obj: NewT): T => {
        const createdObj: T = { ...obj, id: Math.random().toString()} as unknown as T;
        this.entityData[createdObj.id] = createdObj;

        return { ...createdObj };
    }

    read = (id: string): T => {
        return { ...this.entityData[id] }
    }

    readAll = (): T[] => {
        return { ...Object.values(this.entityData) }
    }

    update = (obj: T & AppDatabaseEntity): T => {
        this.entityData[obj.id] = obj;
        return { ...obj };
    }

    delete = (id: string) => {
        delete this.entityData[id];
    }
}

//Rooms CRUD
export const RoomCRUD: BaseEntityORM<Room,NewRoom> = new BaseEntityORM<Room,NewRoom>(data.rooms);

//Users CRUD
export const UserCRUD: BaseEntityORM<User,NewUser> = new BaseEntityORM<User,NewUser>(data.users);