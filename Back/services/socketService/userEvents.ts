import { Server, Socket } from "socket.io";
import { UserCRUD } from "../persist";
import { createNewUser, createOrGetNewUser, deleteUser, getAllUsers, pingUser } from "../userService";
import { setupUserRoomEvents } from "./roomEvents";
import cookie from 'cookie';

export default (userSocket: Socket, io: Server) => {
    let currentUser: User
    const cookies = cookie.parse(userSocket.handshake.headers.cookie ?? "");
    console.log('New socket connection', userSocket.id, 'from', userSocket.handshake.address, 'with', userSocket.handshake.headers['user-agent'] , "sessionId?" , cookies.sessionId);

    userSocket.on('who-am-i', (data: NewUser) => {
        console.log("Hello ! I'm", data);
        createOrGetNewUser(data,cookies.sessionId).then((user: User) => {
            console.log(user);
            currentUser = user;
            
            setupUserRoomEvents(user, userSocket, io);
            io.emit('new-user', currentUser);
            getAllUsers().then((allUsers) => io.emit('all-users', allUsers));
        });
    });

    userSocket.on('disconnect', () => {
        if (!currentUser) return;
        pingUser(currentUser.id, true);
        getAllUsers().then((allUsers) => io.emit('all-users', allUsers));
    })

    userSocket.on('delete', () => {
        if (!currentUser) return;
        deleteUser(currentUser.id);
        console.log('Socket disconnected', userSocket.id);
        getAllUsers().then((allUsers) => io.emit('all-users', allUsers));
    });

    userSocket.on('ping', (err: Error) => {
        pingUser(currentUser.id);
    })
}