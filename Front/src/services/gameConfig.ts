export const FULL_INVENTORY : Inventory = {
    "Silver Key": {
        "id" : "Silver Key",
    },
    "Gold Key": {
        "id" : "Gold Key",
    },
    "Chest": {
        "id" : "Chest",
        "name": "Chest",
        "isImmovable" : true
    },
    "Door": {
        "id" : "Door",
        "name": "Door",
        "isImmovable" : true
    },
    "Drawer": {
        "id" : "Drawer",
        "name": "Drawer",
        "isImmovable" : true
    }
}

FULL_INVENTORY["Chest"].items_allowed = [
    FULL_INVENTORY["Silver Key"],
    FULL_INVENTORY["Gold Key"],
]

FULL_INVENTORY["Door"].items_allowed = [
    FULL_INVENTORY["Gold Key"],
]

FULL_INVENTORY["Drawer"].items_allowed = [
    FULL_INVENTORY["Gold Key"],
]


export const TROMBINOSCOPE: Trombinoscope = {
    "SCIENTIST_ASSISTANT": {
        "id": "SCIENTIST_ASSISTANT",
        "name": "Assitant.e du scientifique",
        "items_allowed": [
            FULL_INVENTORY["Silver Key"],
            FULL_INVENTORY["Gold Key"],
        ]
    },
    "SCIENTIST_SECRETARY": {
        "id": "SCIENTIST_SECRETARY",
        "name": "Secrétaire du scientifique",
        "items_allowed": []
    }
}

