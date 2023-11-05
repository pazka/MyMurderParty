type QrCodeData = string;

type GameConfig = {
    FULL_INVENTORY: Inventory;
    TROMBINOSCOPE: Trombinoscope;
    GAME_NAME: string;
    GAME_DESCRIPTION: string;
}

interface GameEngine {
    seeAnObject: (objectId: string) => InventoryItem | null;
    takesAnObject: (objectId: string) => InventoryItem | null;
    shareAnObject: (objectId: string) => InventoryItem | null;
    combineObjects: (objects: InventoryItem[]) => InventoryItem[] | null;
    ENGINE_NAME: string;
}

interface User {
    id: string;
    sessionId: string;
    name: string;
    lastActivity: number;
}

interface Room {
    id: string;
    name: string;
    password: string;
    users: { [id: string]: User };
    objects: ObjectsInRoom;
    characters: { [id: string]: User };
    roomHistory: string[];
    gameConfigName: string;
}

type ObjectsInRoom = { [id: string]: InventoryItem };


interface Inventory {
    [id: string]: InventoryItem
}

interface Trombinoscope {
    [id: string]: Character
}


interface Character {
    id: string;
    name: string;
    type: string;
    scenario: {
        public: string,
        private?: string
    }
}

interface InventoryItem {
    id: string;
    name: string;
    description: string;
    canBeTaken: boolean;
    canBeUsed: boolean;
    canBeShared?: boolean;
    hasAlreadyBeenUsed?: boolean;
    ownerId?: string;
    currentVariationKey?: string;
    variations: {
        [variation: string]: InventoryItem & any
    }
    lookActions: LookAction[];
    useActions: UseAction[];
}

interface LookAction {
    conditions: {
        needsOneOfCharacterId: string[],
        needsOneOfCharacterType: string[],
        needsOneOfObjectsId: string[]
    },
    result: ActionResult
}

interface UseAction {
    conditions: {
        needsOneOfCharacterId: string[],
        needsOneOfCharacterType: string[],
        needsOneOfObjectsId: string[]
    },
    result: ActionResult
}

interface ActionResult {
    giveItems?: string[];
    replaceByItem?: string;
    displayVariation?: string;
    displayItem?: string;
    deleteItems?: string[];
    popUpMessage?: PopUpMessage;
    triggerEndOfGame?: EndOfGameResult[];
}

interface EndOfGameResult {
    caractersTypeId: string[];
    hasWon: boolean;
    popUpMessage: PopUpMessage;
}

interface PopUpMessage {
    message: text,
    variant?: MessageVariants
};

type MessageVariant = "success" | "error" | "warning" | "info"
