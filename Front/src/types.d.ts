type QrCodeData = string;

interface User {
    id: string;
    sessionId: string;
    name: string;
    lastActivity: number;
    choosenCharacterId?: string;
}

interface Room {
    id: string;
    name:string;
    password: string;
    usersId: string[];
    objects : any;
}

interface InventoryItem {
    id: string;
    name?: string;
    items_allowed?: InventoryItem[];
    isImmovable?: boolean;
    isSharedToRoom?: boolean;
    isUsed?: boolean;
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
