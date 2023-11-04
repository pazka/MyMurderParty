import { Server, Socket } from "socket.io";
import { UserCRUD } from "../persist";
import { createNewUser, createOrGetNewUser, deleteUser, getAllUsers, pingUser } from "../userService";
import { setupUserRoomEvents } from "./roomEvents";
import cookie from 'cookie';
import { broadcastAllClients, broadcastAllRooms } from "../socket-io";
import { userLeaveAllRooms, userLeaveRoom } from "../roomService";

export default (userSocket: Socket, io: Server) => {
    let currentUser: User
    const cookies = cookie.parse(userSocket.handshake.headers.cookie ?? "");
    console.log('New socket connection', userSocket.id, 'from', userSocket.handshake.address, 'with', userSocket.handshake.headers['user-agent'] , "sessionId?" , cookies.sessionId);
    
    broadcastAllRooms();
    broadcastAllClients();
    
    userSocket.onAny((event, ...args) => {
        console.log(`Received ${event} with args : `, args);
    });

    userSocket.on('login', (data: NewUser) => {
        if(data.name.length < 3){
            throw new Error("Name must be at least 3 characters long");
        }
        console.log("Hello ! I'm", data);
        createOrGetNewUser(data,cookies.sessionId).then((user: User) => {
            console.log(user);
            currentUser = user;
            
            setupUserRoomEvents(user, userSocket, io);
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
        console.log('Socket deleted', userSocket.id);
        broadcastAllClients()
    });

    userSocket.on('ping', () => {
        pingUser(currentUser.id);
    })
}