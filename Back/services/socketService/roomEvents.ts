import { Server, Socket } from "socket.io";
import { RoomCRUD } from "../persist";
import { createNewRoom, getRoomsOfUser, getUsersInRoom, updateRoomObjects, userJoinRoom, userLeaveRoom } from "../roomService";
import { ensureRoomExistOrError, ensureUserIsInARoom } from "../roomService/roomSocketService";
import { broadcastAllRooms } from "../socket-io";
import { pingUser } from "../userService";

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

    userSocket.on('update-room-objects', async (data: { objects: any, roomId: string }) => {
        pingUser(user.id);

        if (!await ensureUserIsInARoom(user.id, data.roomId, userSocket)) {
            console.log("User is not in the room");
            return};

        updateRoomObjects(user.id, data.roomId, data.objects).then(() => {
            io.to(data.roomId).emit('room-object-update', { user, objects : data.objects });
            notifyRoomUpdate(io, data.roomId);
        }).catch((err: Error) => {
            console.log(err.message);
            userSocket.emit('error', err.message);
        });
    });

    userSocket.on('broadcast-to-room', async (data: { message: string, roomId: string } | any) => {
        pingUser(user.id);
        if (!await ensureUserIsInARoom(user.id, data.roomId, userSocket)) return;

        const room: Room = RoomCRUD.read(data.roomId);
        room.roomHistory.push(`${user.name} : ${data.message}`);
        RoomCRUD.update(room);

        io.to(data.roomId).emit('broadcast-from-room', { sender: user, data });
        notifyRoomUpdate(io, data.roomId);
    })

    userSocket.on('delete-room', async (data: { roomId: string, password: string }) => {
        pingUser(user.id);
        if (!await ensureRoomExistOrError(data.roomId, userSocket)) return;

        const room: Room = RoomCRUD.read(data.roomId);
        if (room.password !== data.password) {
            userSocket.emit('error', "Wrong password");
            return;
        }

        io.to(data.roomId).emit('room-deleted', { by: user });
        
        //make all user who joined room leave 
        Object.keys(room.users).forEach(userId => {
            userLeaveRoom(data.roomId, userId);
        });

        RoomCRUD.delete(data.roomId);
        broadcastAllRooms();
    })
}

export const notifyRoomUpdate = async (io: Server, roomId: string) => {
    const room: Room = RoomCRUD.read(roomId);
    const users: User[] = await getUsersInRoom(roomId);

    io.to(roomId).emit('update-room', room);
    io.to(roomId).emit('update-room-users', users);
    broadcastAllRooms();
}

export const resetRoomForUser = async (userSocket: Socket) => {
    userSocket.emit('update-room', null);
    userSocket.emit('update-room-users', []);
}