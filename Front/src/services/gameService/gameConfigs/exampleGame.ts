export enum CharactersTypes {
    "NORMAL" = "NORMAL",
    "SCIENTIST" = "SCIENTIST",
}

export const TROMBINOSCOPE: Trombinoscope = {
    "SCIENTIST_ASSISTANT": {
        "id": "SCIENTIST_ASSISTANT",
        "name": "Assitant.e du scientifique",
        "scenario": {
            public: "Vous êtes l'assistant.e du scientifique. Vous avez des compétence en science et en informatique.",
            private: "Vous chercher le secret du scientifique."
        },
        "type": CharactersTypes.SCIENTIST
    },
    "SCIENTIST_SECRETARY": {
        "id": "SCIENTIST_SECRETARY",
        "name": "Secrétaire du scientifique",
        "scenario": {
            public: "Vous êtes la secrétaire du scientifique. Vous le connaisiez mieux que personne.",
        },
        "type": CharactersTypes.NORMAL
    }
}

export const GAME_NAME = "Tutorial Game"

export const GAME_DESCRIPTION = "This is a tutorial game. It's purpose is to show you how to create a game."


export const FULL_INVENTORY: Inventory = {
    "Silver Key": {
        id: "Silver Key",
        name: "Silver Key",
        description: "It can open stuff.",
        canBeTaken: true,
        canBeUsed: true,
        variations: {
            "SILVER_KEY.ASSITANT": {
                description: "It's bad and can only open one object"
            }
        },
        lookActions: [{
            conditions: {
                needsOneOfCharacterId: ["SCIENTIST_ASSISTANT"],
                needsOneOfCharacterType: [],
                needsOneOfObjectsId: []
            },
            results: [{
                displayVariationId: "SILVER_KEY.ASSITANT"
            }]
        }],
        useActions: [
            {
                conditions: {
                    needsOneOfCharacterId: [],
                    needsOneOfCharacterType: [],
                    needsOneOfObjectsId: []
                },
                results: [{
                    notifyMessage: { message: "The key scream ??!?", variant: "magic" }
                }]
            }
        ],
    },
    "Gold Key": {
        id: "Gold Key",
        name: "Gold Key",
        description: "It can open stuff.",
        canBeTaken: true,
        canBeUsed: true,
        variations: {
            "GOLDKEY_KEY.ASSITANT": {
                description: "It's very good and can only probably open anything"
            }
        },
        lookActions: [{
            conditions: {
                needsOneOfCharacterId: ["SCIENTIST_ASSISTANT"],
                needsOneOfCharacterType: [],
                needsOneOfObjectsId: []
            },
            results: [{
                displayVariationId: "GOLDKEY_KEY.ASSITANT",
                notifyMessage: { message: "Your talents reveal something to the object", variant: "info" }
            }]
        }],
        useActions: [],
    },
    "Chest": {
        description: "ok",
        id: "Chest",
        name: "Chest",
        canBeTaken: false,
        canBeUsed: true,
        variations: {},
        lookActions: [],
        useActions: [{
            conditions: {
                needsOneOfCharacterId: [],
                needsOneOfCharacterType: [],
                needsOneOfObjectsId: ["Silver Key", "Gold Key"]
            },
            results: [{
                replaceByItemId: "ChestOpen",
                giveItemIds: ["Gold Key"]
            }]
        }],
    },
    "ChestOpen": {
        description: "This chest has been opened, it's empty.",
        id: "ChestOpen",
        name: "Opened Chest",
        canBeTaken: false,
        canBeUsed: false,
        variations: {},
        lookActions: [],
        useActions: [],

    },
    "Door": {
        description: "This door is locked",
        id: "Door",
        name: "Door",
        canBeTaken: false,
        canBeUsed: true,
        variations: {},
        lookActions: [],
        useActions: [{
            conditions: {
                needsOneOfCharacterId: [],
                needsOneOfCharacterType: [],
                needsOneOfObjectsId: ["Gold Key"]
            },
            results: [{
                replaceByItemId: "DoorOpen",
            }]
        }],
    },
    "DoorOpen": {
        description: "This door is unlocked",
        id: "DoorOpen",
        name: "Opened Door",
        canBeTaken: false,
        canBeUsed: true,
        variations: {},
        lookActions: [],
        useActions: [{
            conditions: {
                needsOneOfCharacterId: [],
                needsOneOfCharacterType: [CharactersTypes.NORMAL],
                needsOneOfObjectsId: []
            },
            results: [{
                triggerEndOfGame: [
                    {
                        caractersTypeId: [CharactersTypes.SCIENTIST],
                        hasWon: false,
                        popUpMessage: { message: "You lost, Normal have won !", variant: "error" }
                    },
                    {
                        caractersTypeId: [CharactersTypes.NORMAL],
                        hasWon: true,
                        popUpMessage: { message: "Normal have won !", variant: "success" }
                    }
                ],
            }]
        }, {
            conditions: {
                needsOneOfCharacterId: [],
                needsOneOfCharacterType: [CharactersTypes.SCIENTIST],
                needsOneOfObjectsId: []
            },
            results: [{
                triggerEndOfGame: [
                    {
                        caractersTypeId: [CharactersTypes.SCIENTIST],
                        hasWon: true,
                        popUpMessage: { message: "Sicentist have won !", variant: "success" }
                    },
                    {
                        caractersTypeId: [CharactersTypes.NORMAL],
                        hasWon: false,
                        popUpMessage: { message: "You lost, scientist did !", variant: "error" }
                    }
                ],
            }]
        }],
    },
    "Drawer": {
        description: "ok",
        id: "Drawer",
        name: "Drawer",
        canBeTaken: false,
        canBeUsed: true,
        variations: {},
        lookActions: [],
        useActions: [],
    },
    "ExampleItem": {
        description: "ok",
        id: "ExampleItem",
        name: "Example",
        canBeTaken: false,
        canBeUsed: true,
        variations: {},
        lookActions: [],
        useActions: [],
    }
}

