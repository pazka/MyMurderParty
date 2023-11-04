import {getSocket} from "./index";

export const emitWhoAmI = async (user : User) => {
    console.log("sendemit", user);
    (await getSocket()).emit("who-am-i", user);
}

export const emitJoinRoom = async (roomId: string, password: string) => {
    (await getSocket()).emit("join-room", { roomId, password });
}

export const emitLeaveRoom = async (roomId: string) => {
    (await getSocket()).emit("leave-room", { roomId });
}

export const emitMakeObjectAvailable = async (object: InventoryItem) => {
    (await getSocket()).emit("offer-object", object);
}

export const emitTakeAvailableObject = async (object: InventoryItem) => {
    (await getSocket()).emit("take-object", object);
}