import config from "../config"
import restService from "../restService";
import { emitLogin, emitLogout } from "../socketService/emits";
import { getGlobalState, setGlobaState } from "../storageService"

export const fetchAllUsers = async () => {
    const response = await restService(config.host + "/users");
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

export const getAllUsers = (): User[] => {
    return Object.values(getGlobalState().allUsers);
}
export const login = async  (user : User) => {
    const storage = getGlobalState();
    setGlobaState({ ...storage, currentUser: user })
    emitLogin(user)
}

export const logout = async () => {
    const storage = getGlobalState();
    setGlobaState({ ...storage, currentUser: null })
    emitLogout();
}