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

export const addItemToInventory = (item: InventoryItem) => {
    const state = getGlobalState();
    if (state.inventory.find((i) => i.id === item.id)) {
        return;
    }

    state.inventory.push(item);
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