import { Server, Socket } from "socket.io";
import { UserCRUD } from "../persist";
import { createNewUser, createOrGetNewUser, deleteUser, getAllUsers, getUserBySessionId, pingUser } from "../userService";
import { notifyRoomUpdate, resetRoomForUser, setupUserRoomEvents } from "./roomEvents";
import { parseCookies } from "../cookies";
import { broadcastAllClients, broadcastAllRooms } from "../socket-io";
import { getRoomsOfUser, userChoosesACharacter, userLeaveAllRooms, userLeaveRoom } from "../roomService";
import { publicUser } from "../publicView";
import { log } from "../log";

export default async (userSocket: Socket, io: Server) => {
    const cookies = parseCookies(userSocket.handshake.headers.cookie);
    resetRoomForUser(userSocket)

    let currentUser: User | undefined = await getUserBySessionId(cookies.sessionId);

    //case user already has a session but hasn't logged in yet
    if (currentUser) {
        setupUserRoomEvents(currentUser, userSocket, io);
        userSocket.emit('you-are', currentUser);
        pingUser(currentUser.id);
    }else{
        userSocket.emit('you-are', null);
    }

    log.debug('socket_connect', 'client connected', { known_user: Boolean(currentUser), clients: io.engine.clientsCount });

    broadcastAllClients();
    broadcastAllRooms();
    getRoomsOfUser(currentUser?.id ?? "").then((rooms) => {
        rooms.forEach((room) => {
            userSocket.join(room.id);
            notifyRoomUpdate(io, room.id)
        });
    });

    // the event name only: payloads hold names, room passwords and game content
    userSocket.onAny((event) => {
        log.debug('socket_event', 'event received', { name: String(event).slice(0, 40) });
    });

    //case user session is linked ot nothing
    userSocket.on('login', (data: NewUser) => {
        if (currentUser) {
            userSocket.emit('you-are', currentUser);
            return;
        }

        if ((data?.name?.length ?? 0) < 3) {
            userSocket.emit('error', "Name must be at least 3 characters long");
            return;
        }

        createNewUser(data, cookies.sessionId).then(async (user: User) => {
            log.info('user_created', 'new player', { users: (await getAllUsers()).length });
            currentUser = user;
            setupUserRoomEvents(currentUser, userSocket, io);

            io.emit('new-user', publicUser(currentUser));
            userSocket.emit('you-are', currentUser);
            broadcastAllClients()
        });
    });

    userSocket.on('disconnect', () => {
        log.debug('socket_disconnect', 'client disconnected', { clients: io.engine.clientsCount });
        if (!currentUser) return;
        pingUser(currentUser.id, true);
        broadcastAllClients()
    })

    userSocket.on('logout', () => {
        if (!currentUser) return;
        deleteUser(currentUser.id);
        userLeaveAllRooms(currentUser.id);
        currentUser = undefined;
        log.info('user_deleted', 'player logged out', {});
        broadcastAllClients()
        broadcastAllRooms()
    });

    userSocket.on('choose-character', (data: { roomId: string, characterId: string }) => {
        if (!currentUser) return;

        userChoosesACharacter(currentUser.id, data.roomId, data.characterId).then(x => {
            userSocket.emit('you-are', currentUser);
            notifyRoomUpdate(io, data.roomId);

            broadcastAllClients()
        }).catch((err: Error) => {
            log.debug('action_refused', 'action refused', { action: 'choose-character', reason: err.message });
            userSocket.emit('error', err.message);
        });

    });

    userSocket.on('ping', () => {
        if (!currentUser) return;
        pingUser(currentUser.id);
    })
}