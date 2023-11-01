import config from "../config"
import { getGlobalState, setGlobaState } from "../storageService"

export const fetchAllUsers = async () => {
    const response = await fetch(config.host + "/users");
    const allUsers = await response.json();

    let storage = getGlobalState();
    storage.allUsers = allUsers;
    setGlobaState(storage);
}

const getAllUserInRoom = (roomId: string) => {
    const allUsers: User[] = getGlobalState().allUsers
}

const getCurrentUser = (): User | null => {
    return getGlobalState().currentUser;
}