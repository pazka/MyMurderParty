import {RoomCRUD} from '../persist'

const createNewRoom = (room: NewRoom) => {
    return RoomCRUD.create(room);
}

const createNewRoomWithOneUser = (newRoom: NewRoom, user : User) => {
    const room : Room = RoomCRUD.create(newRoom);
    room.users.push(user);
    RoomCRUD.update(room);
    return room;
}