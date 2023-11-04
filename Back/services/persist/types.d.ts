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
}

interface Room extends NewRoom, AppDatabaseEntity {
    usersId: string[];
    objects: any;
}

interface NewUser extends NewAppDatabaseEntity {
    name: string;
    sessionId: string;
    lastActivity: number;
    choosenCharacterId?: string;
}

interface User extends NewUser, AppDatabaseEntity {
}
