import { io, Socket } from "socket.io-client";
import config from "../../services/config";
import initReceiveSocketListeners from "./receive";
import restService from "../restService";

let _socket: Socket | null = null;

export const initSocketConnection = async (): Promise<Socket> => {
    const res = await restService(config.host + "/session");

    _socket = io(config.host, {
        withCredentials: true
    });

    _socket.on("connect", () => {
        console.log("SOCKET : Connected");
    });

    _socket.on("disconnect", () => {
        console.log("SOCKET : Disconnected");
    });
    initReceiveSocketListeners(_socket);

    return _socket;
}

export const getSocket = async () : Promise<Socket> => {
    if (_socket !== null) {
        return _socket;
    }

    //setSession
    _socket = await initSocketConnection();
    return _socket;
}