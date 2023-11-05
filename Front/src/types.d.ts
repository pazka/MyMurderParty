type QrCodeData = string;

type GameConfig = {
    FULL_INVENTORY: Inventory;
    TROMBINOSCOPE: Trombinoscope;
    GAME_NAME: string;
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
    gameConfigName: string;
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
