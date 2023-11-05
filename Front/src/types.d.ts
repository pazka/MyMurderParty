type QrCodeData = string;

type GameConfig = {
    FULL_INVENTORY: Inventory;
    TROMBINOSCOPE: Trombinoscope;
}

interface User {
    id: string;
    sessionId: string;
    name: string;
    lastActivity: number;
}

interface Room {
    id: string;
    name:string;
    password: string;
    users: { [id: string]: User };
    objects : ObjectsInRoom;
    characters: { [id: string]: User };
    roomHistory: string[];
}

type ObjectsInRoom = { [id: string]: InventoryItem };

interface InventoryItem {
    id: string;
    name?: string;
    description : string;
    combineWith?: string[];
    cantBeTaken?: boolean;
    isSharedToRoom?: boolean;
    isUsed?: boolean;
    ownerId?: string;
}

interface Inventory {
    [id: string]: InventoryItem
}

interface Character {
    id: string;
    name: string;
}

interface Trombinoscope {
    [id: string]: Character
}
