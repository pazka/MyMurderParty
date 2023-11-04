import config from "../config";
import restService from "../restService";
import { getGlobalState, setGlobaState } from "../storageService";

export const fetchAllRooms = async () => {
    const response = await restService(config.host + "/rooms");
    const allRooms = await response.json();

    let storage = getGlobalState();
    storage.allRooms = allRooms;
    setGlobaState(storage);
}

export const getDefaultRoom = (): Room => ({
    id: "",
    name: "",
    password: "",
    usersId: [],
    objects: {}
})

export const isUserInARoom = (): boolean => {
    const currentRoom = getGlobalState().currentRoom;
    if (!currentRoom) return false;

    return false;
}

export const getCurrentRoom = (): Room | null => {
    const currentRoom = getGlobalState().currentRoom;
    return currentRoom;
}