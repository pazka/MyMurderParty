import { getGlobalState, setGlobaState } from "../storageService";
import { enqueueSnackbar } from 'notistack'
import { Socket } from "socket.io-client"


export default (socket: Socket) => {
    //insert middleware between socket "on" function
    socket.onAny((event, ...args) => {
        console.log(`socket.io : Received ${event} with args : `, args);
    });

    socket.on("all-users", (allUsers: User[]) => {
        let storage = getGlobalState();
        storage.allUsers = allUsers;
        setGlobaState(storage);
    })

    socket.on("all-rooms", (allRooms: Room[]) => {
        let storage = getGlobalState();
        storage.allRooms = allRooms;
        setGlobaState(storage);
    })

    socket.on("update-room", (room: Room) => {
        let storage = getGlobalState();
        storage.currentRoom = room;
        setGlobaState(storage);
    })
    socket.on("update-room-users", (users: User[]) => {
        let storage = getGlobalState();
        storage.usersInRoom = users;
        setGlobaState(storage);
    })

    socket.on("error", (message: string) => {
        if (message) {
            enqueueSnackbar(message, { variant: "error" });
        }
    })

    socket.on("broadcast-from-room", ({ sender, data }: { sender: User, data: any }) => {
        if (data.message) {
            enqueueSnackbar(data.message, { variant: data.variant ?? "info" });
        }
    })
}