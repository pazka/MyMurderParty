import { getGlobalState, setGlobaState } from "../storageService";
import { enqueueSnackbar } from 'notistack'
import { Socket } from "socket.io-client"
import { updateCurrentRoom } from "../roomService";
import { sendEvent } from "../eventsService";
import { AvailableEvents } from "../eventsService/allAvailableEvents";


export default (socket: Socket) => {
    //insert middleware between socket "on" function
    socket.onAny((event, ...args) => {
        console.log(`socket.io : Received ${event} with args : `, args);
    });

    socket.on("you-are", (user: User) => {
        let storage = getGlobalState();
        storage.currentUser = user;
        setGlobaState(storage);
    })

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
        updateCurrentRoom(room);
    })

    socket.on("update-room-users", (users: User[]) => {
        let storage = getGlobalState();
        storage.usersInRoom = users;
        setGlobaState(storage);
    })

    socket.on("room-deleted", ({ by: User }: { by: User }) => {
        enqueueSnackbar("Room deleted by " + User.name, { variant: "info" });
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

        if(data.endOfGameResults){
            sendEvent(AvailableEvents.endOfGame, data.endOfGameResults)
        }
    })
}