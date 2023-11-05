import { enqueueSnackbar } from "notistack"
import { getCurrentCharacter } from "../../characterService"
import { getCurrentRoom } from "../../roomService"
import { getCurrentGameConfig } from ".."
import { getCurrentUser } from "../../userService"

const seeAnObject = (objectId: string): InventoryItem | null => {
    const currentRoom = getCurrentRoom()
    const currentUser = getCurrentUser()
    const currentCharacter = getCurrentCharacter()
    const currentGameConfig = getCurrentGameConfig()

    const baseInventoryObject = currentGameConfig.FULL_INVENTORY[objectId]
    const possibleObjectInRoom = currentRoom?.objects[objectId]

    const currentObject = possibleObjectInRoom ?? baseInventoryObject

    if (!currentObject) {
        enqueueSnackbar("No Object to diplay for you", {variant: "error"})
        return null
    }

    if (currentObject.ownerId && currentObject.ownerId !== currentUser?.id) {
        enqueueSnackbar("This object has already been taken, please throw away the paper tag from the room", {variant: "error"})
        return null
    }

    //allow sharing when user already has the object
    if (currentObject.ownerId === currentUser?.id) {
        currentObject.canBeTaken = false
        currentObject.canBeShared = true
    }

    //add lookAction analysis for this object

    return currentObject
}

const takesAnObject = (objectId: string): InventoryItem | null => {
    return null
}

const shareAnObject = (objectId: string): InventoryItem | null => {
    return null
}

const combineObjects = (objects: InventoryItem[]): InventoryItem[] | null => {
    return null
}

const ENGINE_NAME = "default"

const gameEngine: GameEngine = {
    seeAnObject,
    takesAnObject,
    shareAnObject,
    combineObjects,
    ENGINE_NAME
}

export default gameEngine