export const CHAR_TYPES= {
    "LAWFUL" : "LAWFUL",
    "BAD" : "BAD",
    "NORMAL" : "NORMAL",
}

export const TROMBINOSCOPE: Trombinoscope = {
    "SCIENTIST_ASSISTANT": {
        "id": "SCIENTIST_ASSISTANT",
        "name": "Assitant.e du scientifique",
        imageUrl: "https://sharing.hosh.it/images/map1.jpg",
        "scenario": {
            public: "Vous êtes l'assistant.e du scientifique. Vous avez des compétence en science et en informatique.",
            private: "Vous cherchez le secret du scientifique."
        },
        "types": [CHAR_TYPES.NORMAL]
    },
}

export const GAME_NAME = "La mort du mysterieux Dr Vaticant"

export const GAME_DESCRIPTION = `Vous vous retrouvez réuni.e.s dans le bureau du scientifique \`Dr Vaticant\` dont vous n'avez jamais bien compris le travail. 

Sa mort a été déclarée mais aucun supect n'est encore connu. Tout le monde accours pour y voir plus clair, seules les personnes présente dans la pièce ont pu se procurer un accès.

**Suivez les indices, utilisez votre esprit de déduction pour découvrir comment le scientifique est mort et peut-être enfin comprendre l'ampleur de son travail !**`


export const FULL_INVENTORY: Inventory = {
    "Silver Key": {
        id: "Silver Key",
        name: "Silver Key",
        description: "It can open stuff.",
        imageUrl: "https://sharing.hosh.it/images/lap2.jpg",
        canBeTaken: true,
        canBeUsed: true,
        toPrintIrl: true,
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
        imageUrl: "https://sharing.hosh.it/images/lap2.jpg",
        description: "It can open stuff.",
        canBeTaken: true,
        canBeUsed: true,
        toPrintIrl: true,
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
        imageUrl: "https://sharing.hosh.it/images/lap5.png",
        canBeTaken: false,
        canBeUsed: true,
        toPrintIrl: true,
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
        imageUrl: "https://sharing.hosh.it/images/lap4.png",
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
        imageUrl: "https://sharing.hosh.it/images/lap5.png",
        id: "Door",
        name: "Door",
        canBeTaken: false,
        canBeUsed: true,
        variations: {},
        lookActions: [],
        toPrintIrl: true,
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
        imageUrl: "https://sharing.hosh.it/images/lap4.png",
        canBeTaken: false,
        canBeUsed: true,
        variations: {},
        lookActions: [],
        useActions: [{
            conditions: {
                needsOneOfCharacterId: [],
                needsOneOfCharacterType: [CHAR_TYPES.NORMAL],
                needsOneOfObjectsId: []
            },
            results: [{
                triggerEndOfGame: [
                    {
                        caractersTypeId: [],
                        hasWon: false,
                        popUpMessage: { message: "You lost, Normal have won !", variant: "error" }
                    },
                    {
                        caractersTypeId: [CHAR_TYPES.NORMAL],
                        hasWon: true,
                        popUpMessage: { message: "Normal have won !", variant: "success" }
                    }
                ],
            }]
        }, {
            conditions: {
                needsOneOfCharacterId: [],
                needsOneOfCharacterType: [],
                needsOneOfObjectsId: []
            },
            results: [{
                triggerEndOfGame: [
                    {
                        caractersTypeId: [],
                        hasWon: true,
                        popUpMessage: { message: "Sicentist have won !", variant: "success" }
                    },
                    {
                        caractersTypeId: [CHAR_TYPES.NORMAL],
                        hasWon: false,
                        popUpMessage: { message: "You lost, scientist did !", variant: "error" }
                    }
                ],
            }]
        }],
    },
    "Drawer": {
        description: "ok",
        imageUrl: "https://sharing.hosh.it/images/lap3.jpg",
        id: "Drawer",
        name: "Drawer",
        canBeTaken: false,
        canBeUsed: true,
        toPrintIrl: true,
        variations: {},
        lookActions: [],
        useActions: [],
    },
    "ExampleItem": {
        description: "ok",
        imageUrl: "https://sharing.hosh.it/images/lap2.jpg",
        id: "ExampleItem",
        name: "Example",
        canBeTaken: false,
        canBeUsed: true,
        toPrintIrl: true,
        variations: {},
        lookActions: [],
        useActions: [],
    }
}

