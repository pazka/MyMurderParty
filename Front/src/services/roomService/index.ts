import { enqueueSnackbar } from "notistack";
import config from "../config";
import { setCurrentGameConfig, selectCurrentGameConfigByName, getCurrentGameConfig, updateCurrentGameConfigFromRoom } from "../gameService";
import restService from "../restService";
import { getGlobalState, setGlobaState } from "../storageService";
import { getUserInventoryFromRoom } from "../inventoryService";

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
    users: {},
    objects: {},
    characters: {},
    roomHistory: [],
    gameConfigName: getCurrentGameConfig().GAME_NAME,
})

export const isUserInARoom = (): boolean => {
    const currentUser = getGlobalState().currentUser;
    const currentRoom = getGlobalState().currentRoom;

    if (!currentRoom) return false;
    if (!currentUser) return false;

    return true;
}

export const getCurrentRoom = (): Room | null => {
    const currentRoom = getGlobalState().currentRoom;
    return currentRoom;
}

export const updateCurrentRoom = (room: Room | null) => {
    let storage = getGlobalState();

    updateCurrentGameConfigFromRoom(room);
    storage.inventory = getUserInventoryFromRoom(room);
    storage.currentRoom = room;

    setGlobaState(storage);
}