import { RoomCRUD } from '../persist'
import { UserCRUD } from '../persist'

const createNewRoom = (room: NewRoom) => {
    return RoomCRUD.create(room);
}

const getUsersInRoom = (roomId: string) => {
    const room: Room = RoomCRUD.read(roomId);
    const allUsers = UserCRUD.readAll();
    const allUsersInRoom = allUsers.filter(u => room.usersId.includes(u.id));
    return allUsersInRoom;
}

const createNewRoomWithOneUser = (newRoom: NewRoom, userId: string) => {
    const room: Room = createNewRoom(newRoom);
    //check that user exists
    const user: User = UserCRUD.read(userId);
    if (!user) {
        throw new Error("User does not exist");
    }

    room.usersId.push(userId);


    RoomCRUD.update(room);
    return room;
}

const userJoinRoom = (roomId: string, userId: string) => {
    const room: Room = RoomCRUD.read(roomId);
    const user: User = UserCRUD.read(userId);

    //check if there is already a user with the same name in the room
    const allUsersInRoom = getUsersInRoom(roomId)

    if (allUsersInRoom.find(u => u.name === user.name)) {
        throw new Error("User with same name already exists in the room");
    }

    if (!room.usersId.includes(userId)) {
        room.usersId.push(userId);
    }

    RoomCRUD.update(room);
    return room;
}

const userLeaveRoom = (roomId: string, userId: string) => {
    const room: Room = RoomCRUD.read(roomId);
    const user: User = UserCRUD.read(userId);

    const userIndex = room.usersId.indexOf(userId);
    if (userIndex < 0) {
        throw new Error("User does not exist in the room");
    }
    room.usersId.splice(userIndex, 1);

    RoomCRUD.update(room);
    return room;
}

const userChoosesACharacter = (userId: string, characterId: string) => {
    const user: User = UserCRUD.read(userId);
    user.choosenCharacterId = characterId;
    UserCRUD.update(user);
    return user;
}