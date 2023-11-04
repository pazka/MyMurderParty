import { getCurrentRoom, isUserInARoom } from "../roomService";
import { getGlobalState } from "../storageService";
import { getSocket } from "./index";

export const emitLogin = async (user: User) => {
    (await getSocket()).emit("login", user);
}
export const emitLogout = async () => {
    (await getSocket()).emit("logout");
}
export const emitPing = async (user: User) => {
    (await getSocket()).emit("ping");
}

export const emitNewRoom = async (room: Room) => {
    (await getSocket()).emit("new-room", room);
}

export const emitJoinRoom = async (roomId: string, password: string) => {
    (await getSocket()).emit("join-room", { roomId, password });
}

export const emitLeaveRoom = async (roomId: string) => {
    (await getSocket()).emit("leave-room", { roomId });
}

export const emitMakeObjectAvailable = async (object: InventoryItem) => {
    if(!isUserInARoom()) return;
    const roomId = getCurrentRoom()?.id;
    (await getSocket()).emit("offer-object", { object, roomId });
}

export const emitTakeAvailableObject = async (object: InventoryItem) => {
    if(!isUserInARoom()) return;
    const roomId = getCurrentRoom()?.id;
    (await getSocket()).emit("take-object", { object, roomId });
}

export const emitBroadcastTextToRoom = async (text: string) => {
    if(!isUserInARoom()) return;
    const roomId = getCurrentRoom()?.id;
    (await getSocket()).emit("broadcast-to-room", { message: text, roomId });
}