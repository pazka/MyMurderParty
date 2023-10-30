type QrCodeData = string;

interface InventoryItem {
    id: string;
    name?: string;
    items_allowed?: InventoryItem[];
    isImmovable?: boolean;
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
