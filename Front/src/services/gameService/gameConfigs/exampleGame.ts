export const FULL_INVENTORY: Inventory = {
    "Silver Key": {
        description : "ok",
        "id": "Silver Key",
    },
    "Gold Key": {
        description : "ok",
        "id": "Gold Key",
    },
    "Chest": {
        description : "ok",
        "id": "Chest",
        "name": "Chest",
        "cantBeTaken": true,
        combineWith:  [
            "Silver Key",
            "Gold Key",
        ]
    },
    "Door": {
        description : "ok",
        "id": "Door",
        "name": "Door",
        "cantBeTaken": true,
        combineWith:  [
            "Gold Key",
        ]
    },
    "Drawer": {
        description : "ok",
        "id": "Drawer",
        "name": "Drawer",
        "cantBeTaken": true,
        "combineWith":  [
            "Gold Key",
        ]
    },
    "ExampleItem": {
        description : "ok",
        id: "ExampleItem",
        name: "Example",
        combineWith: ["ExampleItem"],
        cantBeTaken: true,
        isSharedToRoom: false,
        isUsed: true
    }
}

export const TROMBINOSCOPE: Trombinoscope = {
    "SCIENTIST_ASSISTANT": {
        "id": "SCIENTIST_ASSISTANT",
        "name": "Assitant.e du scientifique"
    },
    "SCIENTIST_SECRETARY": {
        "id": "SCIENTIST_SECRETARY",
        "name": "Secrétaire du scientifique"
    }
}

export const GAME_NAME = "Tutorial Game"

