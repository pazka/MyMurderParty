type QrCodeData = string;

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
}

type ObjectsInRoom = { [id: string]: InventoryItem };

interface InventoryItem {
    id: string;
    name?: string;
    items_allowed?: InventoryItem[];
    isImmovable?: boolean;
    isSharedToRoom?: boolean;
    isUsed?: boolean;
    ownerId?: string;
}

interface Inventory {
    [id: string]: InventoryItem
}

interface Character {
    items_allowed: InventoryItem[];
    id: string;
    name: string;
}

interface Trombinoscope {
    [id: string]: Character
}
