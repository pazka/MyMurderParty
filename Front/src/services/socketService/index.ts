import { io, Socket } from "socket.io-client";
import config from "../../services/config";

const socket: Socket = io(config.host);

socket.on("connect", () => {
    console.log("SOCKET : Connected");
});

socket.on("disconnect", () => {
    console.log("SOCKET : Disconnected");
});

export default socket;