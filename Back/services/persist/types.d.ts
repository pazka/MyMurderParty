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
    gameConfigName: string;
}

interface Room extends NewRoom, AppDatabaseEntity {
    users: { [id: string]: User };
    objects: { [id: string]: any };
    characters: { [id: string]: any };
    roomHistory: string[];
}

interface NewUser extends NewAppDatabaseEntity {
    name: string;
    sessionId: string;
    lastActivity: number;
}

interface User extends NewUser, AppDatabaseEntity {
}
