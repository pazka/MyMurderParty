import { Server, Socket } from "socket.io";
import { UserCRUD } from "../persist";
import { createNewUser, createOrGetNewUser, deleteUser, getAllUsers, getUserBySessionId, pingUser } from "../userService";
import { setupUserRoomEvents } from "./roomEvents";
import cookie from 'cookie';
import { broadcastAllClients, broadcastAllRooms } from "../socket-io";
import { userLeaveAllRooms, userLeaveRoom } from "../roomService";

export default async (userSocket: Socket, io: Server) => {
    const cookies = cookie.parse(userSocket.handshake.headers.cookie ?? "");
    console.log('New socket connection', userSocket.id, 'from', userSocket.handshake.address, 'with', userSocket.handshake.headers['user-agent'] , "sessionId?" , cookies.sessionId);
    
    let currentUser: User | undefined = await getUserBySessionId(cookies.sessionId);

    //case user already has a session but hasn't logged in yet
    if(currentUser){
        setupUserRoomEvents(currentUser, userSocket, io);
        pingUser(currentUser.id);
        userSocket.emit('you-are', currentUser);
    }
    
    broadcastAllRooms();
    broadcastAllClients();
    
    userSocket.onAny((event, ...args) => {
        console.log(`Received ${event} with args : `, args);
    });

    //case user session is linked ot nothing
    userSocket.on('login', (data: NewUser) => {
        if(currentUser){
            userSocket.emit('error', "You are already logged in");
            return;
        }

        if((data?.name?.length ?? 0) < 3){
            userSocket.emit('error', "Name must be at least 3 characters long");
            return;
        }

        console.log("Hello ! I'm", data);
        createNewUser(data,cookies.sessionId).then((user: User) => {
            console.log(user);
            currentUser = user;
            setupUserRoomEvents(currentUser, userSocket, io);
            
            io.emit('new-user', currentUser);
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
    });

    userSocket.on('ping', () => {
        if (!currentUser) return;
        pingUser(currentUser.id);
    })
}