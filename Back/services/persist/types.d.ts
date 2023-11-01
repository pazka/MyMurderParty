interface AppDatabase {
    rooms: { [id: string]: Room }
    users: { [id: string]: User }
}

interface BaseEntityCRUD<AppDatabaseEntity> {
    create: (t: T) => void;
    read: (id: string) => T;
    readAll: () => T[];
    update: (t: T) => void;
    delete: (id: string) => void;
}

interface NewAppDatabaseEntity {
    id: string;
}

interface AppDatabaseEntity extends NewAppDatabaseEntity {
    id: string;
}

interface NewRoom extends NewAppDatabaseEntity {
    name: string;
    password: string;
    users: User[];
}

interface Room extends NewRoom, AppDatabaseEntity {
}

interface NewUser extends NewAppDatabaseEntity {
    name: string;
    password: string;
}

interface User extends NewUser, AppDatabaseEntity {
}
