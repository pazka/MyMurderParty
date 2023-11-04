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
    const currentUser = getGlobalState().currentUser;
    const currentRoom = getGlobalState().currentRoom;
    
    if (!currentRoom) return false;
    if (!currentUser) return false;

    return false;
}

export const getCurrentRoom = (): Room | null => {
    const currentRoom = getGlobalState().currentRoom;
    return currentRoom;
}

export const updateCurrentRoom = (room: Room |null) => {
    let storage = getGlobalState();
    storage.currentRoom = room;
    if(!room) return;

    const userInventory = storage.currentRoom?.objects.filter((o : ObjectsInRoom) => o.ownerId === storage.currentUser?.id);
    storage.inventory = userInventory ?? [];
    setGlobaState(storage);
}