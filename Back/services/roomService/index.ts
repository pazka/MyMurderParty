import { RoomCRUD } from '../persist'
import { UserCRUD } from '../persist'
import { broadcastAllRooms, getIo } from '../socket-io';
import { notifyRoomUpdate } from '../socketService/roomEvents';

export const getAllRooms = async (): Promise<Room[]> => {
    const allRooms = RoomCRUD.readAll();
    return allRooms;
}

export const getRoomsOfUser = async (userId: string): Promise<Room[]> => {
    const allRooms = await getAllRooms();
    const roomsOfUser = allRooms.filter(r => r.users[userId]);
    return roomsOfUser;
}

export const createNewRoom = async (newRoom: NewRoom): Promise<Room> => {
    if (newRoom.name.length < 3) {
        throw new Error("Room name must be at least 3 characters long");
    }

    //check that room with same name dosen't already exist 
    const allRooms = await getAllRooms();
    if (allRooms.find(r => r.name === newRoom.name)) {
        throw new Error("Room with same name already exists");
    }

    let createdRoom: Room = RoomCRUD.create(newRoom);

    createdRoom = {
        ...createdRoom,
        users: {},
        objects: {},
        characters: {},
    }

    RoomCRUD.update(createdRoom);
    return createdRoom;
}

export const getUsersInRoom = async (roomId: string): Promise<User[]> => {
    const room = RoomCRUD.read(roomId);
    if (!room) {
        return [];
    }
    const allUsers = UserCRUD.readAll();
    const allUsersInRoom = allUsers.filter(u => room.users[u.id]);
    return allUsersInRoom;
}

export const createNewRoomWithOneUser = async (newRoom: NewRoom, userId: string): Promise<Room> => {
    const room: Room = await createNewRoom(newRoom);
    //check that user exists
    const user = UserCRUD.read(userId);

    if (!user) {
        throw new Error("User does not exist");
    }

    room.users[userId] = user;


    RoomCRUD.update(room);
    return room;
}

export const userJoinRoom = async (roomId: string, password: string, userId: string): Promise<Room> => {
    const room = RoomCRUD.read(roomId);
    const user = UserCRUD.read(userId);

    if(!room || !user){
        throw new Error("User or room does not exist");
    }

    if (room.users[userId]) { return room; }

    //check password 
    if (room.password !== password) {
        throw new Error("Wrong password");
    }

    //check if there is already a user with the same name in the party
    const allUsersInRoom = await getUsersInRoom(roomId)

    if (allUsersInRoom.find(u => u.name === user.name)) {
        throw new Error("User with same name already exists in the party");
    }

    room.users[userId] = user;
    room.roomHistory.push(`${user.name} joined the party`);

    RoomCRUD.update(room);
    return room;
}

export const userLeaveRoom = async (roomId: string, userId: string): Promise<void> => {
    const room = RoomCRUD.read(roomId);
    const user = UserCRUD.read(userId);

    if(!room || !user){
        return ;
    }

    if (!room.users[userId]) {
        throw new Error("User does not exist in the party");
    }
    room.roomHistory.push(`${user.name} left the party`);
    delete room.users[userId];

    RoomCRUD.update(room);
    UserCRUD.update(user);
}

export const userChoosesACharacter = async (userId: string, roomId: string, characterId: string): Promise<void> => {
    const room = RoomCRUD.read(roomId);
    const user = UserCRUD.read(userId);

    if(!room || !user){
        return ;
    }

    //check if user has another character in the party
    const possibleTakenCharId = Object.entries(room.characters).find(([charId, user]) => user.id === userId)?.[0];
    if (possibleTakenCharId) {
        delete room.characters[possibleTakenCharId];
    }

    if (room.characters[characterId]) {
        throw new Error("Character is already taken");
    }

    room.characters[characterId] = user;
    room.roomHistory.push(`${user.name} chose a character`);
    RoomCRUD.update(room);
}

export const updateRoomObjects = async (userId: string, roomId: string, objects: any[]): Promise<void> => {
    const room = RoomCRUD.read(roomId);

    if(!room){
        return ;
    }

    room.objects = objects;
    RoomCRUD.update(room);
}

export const userLeaveAllRooms = async (userId: string): Promise<void> => {
    const allRooms = await getAllRooms();
    allRooms.forEach(room => {
        //check if user has another character in the party
        const characterId = Object.entries(room.characters).find(([charId, userId]) => userId === userId)?.[0];
        if (characterId)
            delete room.characters[characterId];

        if (room.users[userId]) {
            delete room.users[userId];
            RoomCRUD.update(room);
        }
        notifyRoomUpdate(getIo(), room.id);
    });
}

export const deleteRoom = async (roomId: string): Promise<void> => {
    RoomCRUD.delete(roomId);
    broadcastAllRooms();
}
