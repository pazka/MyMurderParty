import { Server, Socket } from "socket.io";
import { UserCRUD } from "../persist";
import { createNewUser, createOrGetNewUser, deleteUser, getAllUsers, getUserBySessionId, pingUser } from "../userService";
import { notifyRoomUpdate, resetRoomForUser, setupUserRoomEvents } from "./roomEvents";
import cookie from 'cookie';
import { broadcastAllClients, broadcastAllRooms } from "../socket-io";
import { getRoomsOfUser, userChoosesACharacter, userLeaveAllRooms, userLeaveRoom } from "../roomService";

export default async (userSocket: Socket, io: Server) => {
    const cookies = cookie.parse(userSocket.handshake.headers.cookie ?? "");
    console.log('New socket connection', userSocket.id, 'from', userSocket.handshake.address, 'with', userSocket.handshake.headers['user-agent'], "\n sessionId?", cookies.sessionId);
    resetRoomForUser(userSocket)

    let currentUser: User | undefined = await getUserBySessionId(cookies.sessionId);

    //case user already has a session but hasn't logged in yet
    if (currentUser) {
        console.log("user exist to us, and the already set session is valid, we will set its login and sroom events")
        setupUserRoomEvents(currentUser, userSocket, io);
        userSocket.emit('you-are', currentUser);
        pingUser(currentUser.id);
    }else{
        console.log("user does NOT exist to us, we setup it's socket connection but not login and room events")
        userSocket.emit('you-are', null);
    }

    broadcastAllClients();
    broadcastAllRooms();
    getRoomsOfUser(currentUser?.id ?? "").then((rooms) => {
        rooms.forEach((room) => {
            userSocket.join(room.id);
            notifyRoomUpdate(io, room.id)
        });
    });

    userSocket.onAny((event, ...args) => {
        console.log(`Received ${event} with args : `, args);
    });

    //case user session is linked ot nothing
    userSocket.on('login', (data: NewUser) => {
        if (currentUser) {
            userSocket.emit('you-are', currentUser);
            return;
        }

        if ((data?.name?.length ?? 0) < 3) {
            userSocket.emit('error', "Name must be at least 3 characters long");
            return;
        }

        console.log("Hello ! I'm", data);
        createNewUser(data, cookies.sessionId).then((user: User) => {
            console.log(user);
            currentUser = user;
            setupUserRoomEvents(currentUser, userSocket, io);

            io.emit('new-user', currentUser);
            userSocket.emit('you-are', currentUser);
            broadcastAllClients()
        });
    });

    userSocket.on('disconnect', () => {
        console.log('Socket disconnected', userSocket.id);
        if (!currentUser) return;
        pingUser(currentUser.id, true);
        broadcastAllClients()
    })

    userSocket.on('logout', () => {
        if (!currentUser) return;
        deleteUser(currentUser.id);
        userLeaveAllRooms(currentUser.id);
        currentUser = undefined;
        console.log('Socket deleted', userSocket.id);
        broadcastAllClients()
        broadcastAllRooms()
    });

    userSocket.on('choose-character', (data: { roomId: string, characterId: string }) => {
        if (!currentUser) return;

        userChoosesACharacter(currentUser.id, data.roomId, data.characterId).then(x => {
            userSocket.emit('you-are', currentUser);
            notifyRoomUpdate(io, data.roomId);

            broadcastAllClients()
        }).catch((err: Error) => {
            console.log(err.message);
            userSocket.emit('error', err.message);
        });

    });

    userSocket.on('ping', () => {
        if (!currentUser) return;
        pingUser(currentUser.id);
    })
}