import fullInventory from "../inventoryService/fullInventory"

const TROMBINOSCOPE: Trombinoscope = {
    "SCIENTIST_ASSISTANT": {
        "id": "SCIENTIST_ASSISTANT",
        "name": "Assitant.e du scientifique",
        "items_allowed": [
            fullInventory["Silver Key"],
            fullInventory["Gold Key"],
        ]
    },
    "SCIENTIST_SECRETARY": {
        "id": "SCIENTIST_SECRETARY",
        "name": "Secrétaire du scientifique",
        "items_allowed": []
    }
}

export default TROMBINOSCOPE;