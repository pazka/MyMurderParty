import { enqueueSnackbar } from "notistack";
import config from "../config";
import { setCurrentGameConfig, selectCurrentGameConfigByName, getCurrentGameConfig } from "../gameService";
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
    const oldRoom : Room = JSON.parse(JSON.stringify(storage.currentRoom));
    storage.currentRoom = room;

    if (room) {
        const objects = Object.values(room.objects ?? {});
        const userInventory = objects.filter((o: InventoryItem) => o.ownerId === storage.currentUser?.id);
        storage.inventory = userInventory;

        if(oldRoom?.gameConfigName !== room.gameConfigName){
            try {
                selectCurrentGameConfigByName(room.gameConfigName);
            }catch(e){
                enqueueSnackbar("Fatal Error while loading game config. Try refreshing the app.", { variant: "error" });
            }
        }
    }else{
        storage.inventory = [];
    }

    setGlobaState(storage);
}