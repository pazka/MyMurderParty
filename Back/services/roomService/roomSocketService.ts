import { Socket } from "socket.io";
import { getRoomsOfUser } from ".";
import { RoomCRUD } from "../persist";

export const ensureUserIsInARoom = async (userId: string,roomId : string, userSocket: Socket) : Promise<boolean> => {
    const room = RoomCRUD.read(roomId);

    if (!room) {
        userSocket.emit('error', "Room does not exist");
        return false;
    }

    const rooms = await getRoomsOfUser(userId);
    if (rooms.length === 0) {
        userSocket.emit('error', "You are not in a room");
        return false;
    }

    if (!rooms.find(r => r.id === roomId)) {
        userSocket.emit('error', "You are not in this room");
        return false;
    }
    
    return true;
}

export const ensureRoomExistOrError = async (roomId : string, userSocket: Socket) : Promise<boolean> => {
    const room = RoomCRUD.read(roomId);

    if (!room) {
        userSocket.emit('error', "Room does not exist");
        return false;
    }
    
    return true;
}