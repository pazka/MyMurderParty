
let fullInventory : Inventory = {
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

fullInventory["Chest"].items_allowed = [
    fullInventory["Silver Key"],
    fullInventory["Gold Key"],
]

fullInventory["Door"].items_allowed = [
    fullInventory["Gold Key"],
]

fullInventory["Drawer"].items_allowed = [
    fullInventory["Gold Key"],
]

export default fullInventory;