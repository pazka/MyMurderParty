import { UserCRUD } from "../persist";

export const createNewUser = async (newUser: NewUser, socketId: string): Promise<User> => {
    const createdUser: User = UserCRUD.create(newUser);
    createdUser.socketId = socketId;
    UserCRUD.update(createdUser);

    return createdUser;
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

export const deleteUser = async (userId: string): Promise<void> => {
    UserCRUD.delete(userId);
}