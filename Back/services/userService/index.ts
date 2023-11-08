import { UserCRUD } from "../persist";

export const createNewUser = async (newUser: NewUser,sessionId : string): Promise<User> => {
    const createdUser: User = UserCRUD.create(newUser);
    createdUser.lastActivity = Date.now();
    createdUser.sessionId = sessionId;
    UserCRUD.update(createdUser);

    return createdUser;
}

export const getUserBySessionId = async (sessionId : string): Promise<User|undefined> => {
    const allUsers = UserCRUD.readAll();
    const user = allUsers.find((user) => user.sessionId === sessionId);
    return user;
}

export const createOrGetNewUser = async (newUser: NewUser,sessionId : string): Promise<User> => {
    const allUsers = UserCRUD.readAll();
    const user = allUsers.find((user) => user.sessionId === sessionId);
    
    if(user){
        return user;
    }
    else{
        return createNewUser(newUser,sessionId);
    }
}

export const getUser = async (userId: string): Promise<User|null> => {
    const user = UserCRUD.read(userId);
    return user;
}

export const getAllUsers = async (): Promise<User[]> => {
    const allUsers = UserCRUD.readAll();
    return allUsers;
}

export const updateUser = async (user: User): Promise<User> => {
    UserCRUD.update(user);
    return user;
}

export const pingUser = async (userId: string, disconnected: boolean = false): Promise<void> => {
    const user = UserCRUD.read(userId);
    if (!user) return;
    user.lastActivity = Date.now();
    if (disconnected) user.lastActivity = -1;
    UserCRUD.update(user);
}

export const deleteUser = async (userId: string): Promise<void> => {
    UserCRUD.delete(userId);
}

export const generateId = (): string => {
    //3 CAPS letters + 1 dash + 3 numbers
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    let id = "";
    for (let i = 0; i < 3; i++) {
        id += letters[Math.floor(Math.random() * letters.length)];
    }
    id += "-";
    for (let i = 0; i < 3; i++) {
        id += numbers[Math.floor(Math.random() * numbers.length)];
    }
    return id;
}
