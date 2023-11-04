import { Server } from "socket.io";
import { getAllUsers } from "./userService";
import { getAllRooms } from "./roomService";

let _io: Server | null = null;

export const initIo = (server : any,option : any) : Server => {
    _io = new Server(server ,option);
    return _io;
}

export const broadcastAllClients = () => {
    getAllUsers().then((allUsers) => _io?.emit('all-users', allUsers));
}

export const broadcastAllRooms = () => {
    getAllRooms().then((allRooms) => _io?.emit('all-rooms', allRooms));
}