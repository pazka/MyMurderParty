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
    getAllRooms().then((allUsers) => _io?.emit('all-rooms', allUsers));
}

export const getIo = () : Server => {
    if(!_io){
        throw new Error("Socket io has not been initialized");
    }
    return _io;
}