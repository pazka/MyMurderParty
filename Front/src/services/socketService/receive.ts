import { getGlobalState, setGlobaState } from "../storageService";
import { enqueueSnackbar } from 'notistack'
import socket from "./index";

socket.on("all-users", (allUsers: User[]) => {
    let storage = getGlobalState();
    storage.allUsers = allUsers;
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