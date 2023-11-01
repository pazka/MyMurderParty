import { Server, Socket } from "socket.io";
import { createNewRoom, getAllRooms, getUsersInRoom, userJoinRoom, userLeaveRoom, userShareAnObjectToRoom, userTakeAnObjectFromRoom } from "../roomService";
import { RoomCRUD } from "../persist";


export const setupUserRoomEvents = (user: User, userSocket: Socket, io: Server) => {
    let currentRoomId: string | null;

    userSocket.on('join-room', (data: { roomId: string, password: string }) => {
        userJoinRoom(data.roomId, data.password, userSocket.id).then((room: Room) => {

            userSocket.join(room.id);
            currentRoomId = room.id;

            io.to(room.id).emit('user-joined-room', user);
            notifyRoomUpdate(io, currentRoomId ?? "");
        }).catch((err: Error) => {
            console.log(err.message);
            userSocket.emit('error', err.message);
        });
    });

    userSocket.on('leave-room', (data: { roomId: string }) => {
        if (currentRoomId != data.roomId) {
            userSocket.emit('error', "You are not in this room");
            return;
        }

        userLeaveRoom(data.roomId, userSocket.id).then(() => {

            userSocket.leave(data.roomId);
            currentRoomId = null;

            io.to(data.roomId).emit('user-left-room', user);
            notifyRoomUpdate(io, currentRoomId ?? "");
        }).catch((err: Error) => {
            console.log(err.message);
            userSocket.emit('error', err.message);
        });
    });

    userSocket.on('offer-object', (data: { objectId: string }) => {
        if (!currentRoomId) {
            userSocket.emit('error', "You are not in a room");
            return;
        }
        const roomId: string = currentRoomId;

        userShareAnObjectToRoom(user.id, currentRoomId, data.objectId).then(() => {
            io.to(roomId ?? "").emit('object-available', { user, objectId: data.objectId });
            notifyRoomUpdate(io, currentRoomId ?? "");
        }).catch((err: Error) => {
            console.log(err.message);
            userSocket.emit('error', err.message);
        });
    });

    userSocket.on('take-object', (data: { objectId: string }) => {
        if (!currentRoomId) {
            userSocket.emit('error', "You are not in a room");
            return;
        }
        const roomId: string = currentRoomId;

        userTakeAnObjectFromRoom(user.id, currentRoomId, data.objectId).then(() => {
            io.to(roomId ?? "").emit('object-taken', { user, objectId: data.objectId });
            notifyRoomUpdate(io, currentRoomId ?? "");
        }).catch((err: Error) => {
            console.log(err.message);
            userSocket.emit('error', err.message);
        });
    });
}

const notifyRoomUpdate = async (io: Server, roomId: string) => {
    const room: Room = RoomCRUD.read(roomId);
    const users: User[] = await getUsersInRoom(roomId);

    io.to(roomId).emit('update-room', room);
    io.to(roomId).emit('update-room-users', users);
}