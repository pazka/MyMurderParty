import socket from "./index";

export const emitWhoAmI = (user : User) => {
    console.log("sendemit", user)
    socket.emit("who-am-i", user);
}

export const emitJoinRoom = (roomId: string, password: string) => {
    socket.emit("join-room", { roomId, password });
}

export const emitLeaveRoom = (roomId: string) => {
    socket.emit("leave-room", { roomId });
}

export const emitMakeObjectAvailable = (object: InventoryItem) => {
    socket.emit("offer-object", object);
}
export const emitTakeAvailableObject = (object: InventoryItem) => {
    socket.emit("take-object", object);
}