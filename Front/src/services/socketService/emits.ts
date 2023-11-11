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

export const emitNewRoomAndJoin = async (room: Room) => {
    (await getSocket()).emit("new-room-and-join", room);
}

export const emitJoinRoom = async (roomId: string, password: string) => {
    (await getSocket()).emit("join-room", { roomId, password });
}

export const emitChooseCharacter = async (roomId: string, characterId: string) => {
    (await getSocket()).emit("choose-character", { roomId, characterId });
}

export const emitDeleteRoom = async (roomId: string, password: string) => {
    (await getSocket()).emit("delete-room", { roomId, password });
}

export const emitLeaveRoom = async (roomId: string) => {
    (await getSocket()).emit("leave-room", { roomId });
}

export const emitUpdateObjects = async (objects: ObjectsInRoom) => {
    if (!isUserInARoom()) return;
    const roomId = getCurrentRoom()?.id;
    (await getSocket()).emit("update-room-objects", { objects, roomId });
}

export const emitBroadcastTextToRoom = async (popUpMessage: PopUpMessage) => {
    if (!isUserInARoom()) return;
    const roomId = getCurrentRoom()?.id;
    (await getSocket()).emit("broadcast-to-room", { popUpMessage: popUpMessage, roomId });
}

export const emitBroadcastEndOfGameToRoom = async (endOfGameResults: EndOfGameResult[]) => {
    if (!isUserInARoom()) return;
    const roomId = getCurrentRoom()?.id;
    (await getSocket()).emit("broadcast-to-room", {endOfGameResults,roomId});
}