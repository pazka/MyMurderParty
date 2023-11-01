interface AppDatabase {
    rooms: { [id: string]: Room }
    users: { [id: string]: User }
}

interface NewAppDatabaseEntity {
}

interface AppDatabaseEntity extends NewAppDatabaseEntity {
    id: string;
}

interface NewRoom extends NewAppDatabaseEntity {
    name: string;
    password: string;
    usersId: string[];
    availableObjectsId: string[];
}

interface Room extends NewRoom,  AppDatabaseEntity {
}

interface NewUser extends NewAppDatabaseEntity {
    name: string;
    socketId: string;
    choosenCharacterId?: string;
}

interface User extends NewUser, AppDatabaseEntity {
}
