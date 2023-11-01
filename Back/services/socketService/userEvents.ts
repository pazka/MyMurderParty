import { Server, Socket } from "socket.io";
import { UserCRUD } from "../persist";
import { createNewUser, deleteUser } from "../userService";
import { setupUserRoomEvents } from "./roomEvents";

export default (userSocket: Socket, io: Server) => {
    let currentUser: User
    console.log('New socket connection', userSocket.id, 'from', userSocket.handshake.address, 'with', userSocket.handshake.headers['user-agent']);

    userSocket.on('WHOAMI', (data: NewUser) => {
        console.log("Hello ! I'm", data);
        createNewUser(data, userSocket.id).then((user: User) => {
            console.log(user);
            currentUser = user;
            
            setupUserRoomEvents(user, userSocket, io);
            io.emit('new-user', currentUser);
        });
    });

    userSocket.on('disconnect', () => {
        deleteUser(currentUser.id);
        console.log('Socket disconnected', userSocket.id);
    });
}