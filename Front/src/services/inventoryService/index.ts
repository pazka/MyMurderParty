import { enqueueSnackbar } from "notistack";
import { isUserInARoom } from "../roomService";
import { emitUpdateObjects } from "../socketService/emits";
import { setGlobaState, getGlobalState, useGlobalStorage } from "../storageService";
import { getCurrentGameConfig } from "../gameService";


export const getFullInventory = (): Inventory => {
    return {...getCurrentGameConfig().FULL_INVENTORY};
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
    if(!isUserInARoom()) return;

    const currentRoom = state.currentRoom as Room;
    currentRoom.objects[item.id] = item;
    emitUpdateObjects(currentRoom.objects);
}

export const addItemToInventory = (item: InventoryItem) => {
    const state = getGlobalState();
    const currentUser = state.currentUser as User;
    if(!isUserInARoom()) return;

    if (state.inventory.find((i) => i.id === item.id)) {
        enqueueSnackbar("You already have this object", { variant: "info" });
        return;
    }

    item.ownerId = currentUser.id;
    updateOneObjectInRoom(item);
}

export const getUserInventoryFromRoom = (room : Room | null): InventoryItem[] => {
    if(!room) return [];
    const storage = getGlobalState();
    const objects = Object.values(room.objects ?? {});
    return  objects.filter((o: InventoryItem) => o.ownerId === storage.currentUser?.id);
}

export const removeItemFromInventory = (item: InventoryItem) => {
    const state = getGlobalState();
    if(!isUserInARoom()) return;
    const currentUser = state.currentUser as User;
    const currentRoom = state.currentRoom as Room;

    if (!state.inventory.find((i) => i.id === item.id)) {
        enqueueSnackbar("You don't have this object", { variant: "info" });
        return;
    }

    currentRoom.objects[item.id].ownerId = undefined;
    updateOneObjectInRoom(currentRoom.objects[item.id]);
}

export const useInventory = (): InventoryItem[] => {
    const [storage] = useGlobalStorage();

    return storage.inventory;
}

export const getItemWithPossibleVariation = (item: InventoryItem): InventoryItem => {
    const state = getGlobalState();
    const currentUser = state.currentUser as User;
    const currentRoom = state.currentRoom as Room;

    const currentVariationKey = item.currentVariationKey 
    if (Object.values(item.variations).length == 0 || !currentVariationKey) {
        return item;
    }

    const currentVariation = item.variations[currentVariationKey];
    if (!currentVariation) {
        enqueueSnackbar("You should be able to see something but can't. This is a bug 🤬", { variant: "error" });
        return item;
    }

    //put all fields from variation to item
    console.log("variation",item, currentVariation);
    const newItemOverwritenByVariation = {...item, ...currentVariation};
    return newItemOverwritenByVariation;
}