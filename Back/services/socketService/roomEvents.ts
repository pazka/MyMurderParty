import { Server, Socket } from "socket.io";
import { createNewRoom, getAllRooms, getRoomsOfUser, getUsersInRoom, userJoinRoom, userLeaveRoom, userShareAnObjectToRoom, userTakeAnObjectFromRoom } from "../roomService";
import { RoomCRUD } from "../persist";
import { pingUser } from "../userService";
import { broadcastAllRooms } from "../socket-io";
import { ensureRoomExistOrError, ensureUserIsInARoom } from "../roomService/roomSocketService";

export const setupUserRoomEvents = (user: User, userSocket: Socket, io: Server) => {
    //check if user is in a room

    userSocket.on('new-room', (newRoom: NewRoom) => {
        console.log("New room creation : ", newRoom);

        createNewRoom(newRoom).then(async (createdRoom: Room) => {
            broadcastAllRooms();
        }).catch((err: Error) => {
            console.log(err.message);
            userSocket.emit('error', err.message);
        });
    })

    userSocket.on('join-room', async (data: { roomId: string, password: string }) => {
        pingUser(user.id);

        if (!await ensureRoomExistOrError(data.roomId, userSocket)) return;

        userJoinRoom(data.roomId, data.password, user.id).then((room: Room) => {

            userSocket.join(room.id);

            io.to(room.id).emit('user-joined-room', user);
            notifyRoomUpdate(io, room.id);
        }).catch((err: Error) => {
            console.log(err.message);
            userSocket.emit('error', err.message);
        });
    });

    userSocket.on('leave-room', async (data: { roomId: string }) => {
        pingUser(user.id);

        if (!await ensureUserIsInARoom(user.id, data.roomId, userSocket)) return;

        const rooms = await getRoomsOfUser(user.id);

        //check if user is in this room
        const currentRoomId = rooms.find(r => r.id === data.roomId)?.id;
        if (!currentRoomId) {
            userSocket.emit('error', "You are not in this room");
            return;
        }

        userLeaveRoom(data.roomId, user.id).then(() => {

            userSocket.leave(data.roomId);
            userSocket.emit('update-room', null);
            io.to(data.roomId).emit('user-left-room', user);
            notifyRoomUpdate(io, data.roomId ?? "");
        }).catch((err: Error) => {
            console.log(err.message);
            userSocket.emit('error', err.message);
        });
    });

    userSocket.on('offer-object', async (data: { objectId: string, roomId: string }) => {
        pingUser(user.id);

        if (!await ensureUserIsInARoom(user.id, data.roomId, userSocket)) return;

        userShareAnObjectToRoom(user.id, data.roomId, data.objectId).then(() => {
            io.to(data.roomId).emit('object-available', { user, objectId: data.objectId });
            notifyRoomUpdate(io, data.roomId);
        }).catch((err: Error) => {
            console.log(err.message);
            userSocket.emit('error', err.message);
        });
    });

    userSocket.on('take-object', async (data: { objectId: string, roomId: string }) => {
        pingUser(user.id);

        if (!await ensureUserIsInARoom(user.id, data.roomId, userSocket)) return;

        userTakeAnObjectFromRoom(user.id, data.roomId, data.objectId).then(() => {
            io.to(data.roomId ?? "").emit('object-taken', { user, objectId: data.objectId });
            notifyRoomUpdate(io, data.roomId ?? "");
        }).catch((err: Error) => {
            console.log(err.message);
            userSocket.emit('error', err.message);
        });
    });

    userSocket.on('broadcast-to-room', async (data: { message: string, roomId: string } | any) => {
        pingUser(user.id);
        if (!await ensureUserIsInARoom(user.id, data.roomId, userSocket)) return;

        io.to(data.roomId).emit('broadcast-from-room', { sender: user, data });
    })
}

const notifyRoomUpdate = async (io: Server, roomId: string) => {
    const room: Room = RoomCRUD.read(roomId);
    const users: User[] = await getUsersInRoom(roomId);

    io.to(roomId).emit('update-room', room);
    io.to(roomId).emit('update-room-users', users);
    broadcastAllRooms();
}