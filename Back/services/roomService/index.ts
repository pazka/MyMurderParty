import { RoomCRUD } from '../persist'
import { UserCRUD } from '../persist'

const createNewRoom = async (roomName: string): Promise<Room> => {
    const newRoom: NewRoom = {
        name: roomName,
        password: "",
        usersId: [],
        availableObjectsId: []
    }
    return RoomCRUD.create(newRoom);
}

const getUsersInRoom = async (roomId: string): Promise<User[]> => {
    const room: Room = RoomCRUD.read(roomId);
    const allUsers = UserCRUD.readAll();
    const allUsersInRoom = allUsers.filter(u => room.usersId.includes(u.id));
    return allUsersInRoom;
}

const createNewRoomWithOneUser = async (roomName: string, userId: string): Promise<Room> => {
    const room: Room = await createNewRoom(roomName);
    //check that user exists
    const user: User = UserCRUD.read(userId);
    if (!user) {
        throw new Error("User does not exist");
    }

    room.usersId.push(userId);


    RoomCRUD.update(room);
    return room;
}

const userJoinRoom = async (roomId: string, password: string, userId: string): Promise<void> => {
    const room: Room = RoomCRUD.read(roomId);
    const user: User = UserCRUD.read(userId);

    if (room.usersId.includes(userId)) { return }

    //check password 
    if (room.password !== password) {
        throw new Error("Wrong password");
    }

    //check if there is already a user with the same name in the room
    const allUsersInRoom = await getUsersInRoom(roomId)

    if (allUsersInRoom.find(u => u.name === user.name)) {
        throw new Error("User with same name already exists in the room");
    }

    room.usersId.push(userId);

    RoomCRUD.update(room);
}

const userLeaveRoom = async (roomId: string, userId: string): Promise<void> => {
    const room: Room = RoomCRUD.read(roomId);
    const user: User = UserCRUD.read(userId);

    const userIndex = room.usersId.indexOf(userId);
    if (userIndex < 0) {
        throw new Error("User does not exist in the room");
    }
    room.usersId.splice(userIndex, 1);

    RoomCRUD.update(room);
    UserCRUD.update(user);
}

const userChoosesACharacter = async (userId: string, roomId: string, characterId: string): Promise<void> => {
    const user: User = UserCRUD.read(userId);

    //check that room users dosent have the same character
    const allUsers = await getUsersInRoom(roomId);
    if (allUsers.find(u => u.choosenCharacterId === characterId)) {
        throw new Error("Character already chosen by another user");
    }

    UserCRUD.update(user);
}

const userShareAnObjectToRoom = async (userId: string, roomId: string, objectId: string): Promise<void> => {
    const user: User = UserCRUD.read(userId);
    const room: Room = RoomCRUD.read(roomId);

    if (!room.availableObjectsId.includes(objectId)) {
        room.availableObjectsId.push(objectId);
    }

    RoomCRUD.update(room);
    //user object inventory is managed on the front side
}

const userTakeAnObjectFromRoom = async (userId: string, roomId: string, objectId: string): Promise<void> => {
    const user: User = UserCRUD.read(userId);
    const room: Room = RoomCRUD.read(roomId);

    const objectIndex = room.availableObjectsId.indexOf(objectId);
    if (objectIndex < 0) {
        throw new Error("Object is not avaliable in the room");
    }
    room.availableObjectsId.splice(objectIndex, 1);

    RoomCRUD.update(room);
    //user object inventory is managed on the front side
}