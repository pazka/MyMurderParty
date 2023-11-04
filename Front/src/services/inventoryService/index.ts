import { isUserInARoom } from "../roomService";
import { emitUpdateObjects } from "../socketService/emits";
import { setGlobaState, getGlobalState, useGlobalStorage } from "../storageService";
import fullInventory from "./fullInventory";


export const getFullInventory = (): Inventory => {
    return fullInventory;
};

export const identifyItem = (itemQrCode: QrCodeData): InventoryItem | null => {
    return getFullInventory()[itemQrCode] ?? null;
};

export const getUserInventory = (): InventoryItem[] => {
    // get invntory object from localstorage

    const state = getGlobalState();
    return state.inventory;
}

export const updateOneObjectInRoom = (item: InventoryItem) => {
    const state = getGlobalState();
    if(isUserInARoom()) return;

    const currentRoom = state.currentRoom as Room;
    currentRoom.objects[item.id] = item;
    emitUpdateObjects(currentRoom.objects);
}

export const addItemToInventory = (item: InventoryItem) => {
    const state = getGlobalState();
    const currentUser = state.currentUser as User;
    if(isUserInARoom()) return;

    if (state.inventory.find((i) => i.id === item.id)) {
        return;
    }

    item.ownerId = currentUser.id;
    updateOneObjectInRoom(item);

    // set inventory object to localstorage
    setGlobaState(state);
}

export const removeItemFromInventory = (item: InventoryItem) => {
    const state = getGlobalState();
    state.inventory = state.inventory.filter((i) => i.id !== item.id);
    // set inventory object to localstorage
    setGlobaState(state);
}

export const useInventory = (): InventoryItem[] => {
    const [storage] = useGlobalStorage();

    return storage.inventory;
}