import {getSocket} from "./index";

export const emitLogin = async (user : User) => {
    (await getSocket()).emit("login", user);
}
export const emitLogout = async (user : User) => {
    (await getSocket()).emit("logout", user);
}
export const emitPing = async (user : User) => {
    (await getSocket()).emit("ping");
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