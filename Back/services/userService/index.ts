import { UserCRUD } from "../persist";

export const createNewUser = async (newUser: NewUser,sessionId : string): Promise<User> => {
    const createdUser: User = UserCRUD.create(newUser);
    createdUser.lastActivity = Date.now();
    createdUser.sessionId = sessionId;
    UserCRUD.update(createdUser);

    return createdUser;
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

export const getUser = async (userId: string): Promise<User> => {
    const user: User = UserCRUD.read(userId);
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
    const user: User = UserCRUD.read(userId);
    user.lastActivity = Date.now();
    if (disconnected) user.lastActivity = -1;
    UserCRUD.update(user);
}

export const deleteUser = async (userId: string): Promise<void> => {
    UserCRUD.delete(userId);
}

export const generateId = (): string => {
    return Array(4).fill(0).map(x=>Math.random().toString(36).substring(2, 5)).join('-');
}
