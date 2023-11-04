
interface AppStorage{
    inventory: InventoryItem[];
    allRooms: Room[];
    currentRoom: Room | null;
    usersInRoom: User[];
    allUsers: User[];
    currentUser: null | User;
}

