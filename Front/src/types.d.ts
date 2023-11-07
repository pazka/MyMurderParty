type QrCodeData = string;

type GameConfig = {
    FULL_INVENTORY: Inventory;
    TROMBINOSCOPE: Trombinoscope;
    GAME_NAME: string;
    GAME_DESCRIPTION: string;
}

interface GameEngine {
    getObjectForCharacter: (objectId: string,noMessage : boolean) => InventoryItem | null;
    takesAnObject: (objectId: string) => void;
    shareAnObject: (objectId: string) => void;
    stopSharingAnObject: (objectId: string) => void;
    useObjects: (objects: InventoryItem[]) => void;
    isObjectUsableAlone: (objectId: string) => boolean;
    isObjectUsableWithAnotherObject: (objectId: string) => boolean;
    executeEndOfGame: (endOfGameResults : EndOfGameResult[]) => void;
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
    isDeleted?: boolean;
    canBeShared?: boolean;
    isOpenForTaking?: boolean;
    hasAlreadyBeenUsed?: boolean;
    ownerId?: string;
    currentVariationKey?: string;
    variations: {
        [variation: string]: InventoryItem & any
    }
    replacedById?: string;
    lookActions: LookAction[];
    useActions: UseAction[];
}

interface LookAction {
    conditions: {
        needsOneOfCharacterId: string[],
        needsOneOfCharacterType: string[],
        needsOneOfObjectsId: string[]
    },
    results: ActionResult[]
}

interface UseAction {
    conditions: {
        needsOneOfCharacterId: string[],
        needsOneOfCharacterType: string[],
        needsOneOfObjectsId: string[]
    },
    results: ActionResult[]
}

interface ActionResult {
    giveItemIds?: string[];
    replaceByItemId?: string;
    displayVariationId?: string;
    displayItemId?: string;
    deleteItemIds?: string[];
    popUpMessage?: PopUpMessage;
    notifyMessage?: PopUpMessage;
    broadcastMessage?: PopUpMessage;
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
    confirmCallback?: (arg? : any) => void;
    cancelCallback?: (arg? : any) => void;
};

type MessageVariant = "success" | "error" | "warning" | "info" | "magic"
