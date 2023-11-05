import { enqueueSnackbar } from "notistack"
import { getCurrentCharacter } from "../../characterService"
import { getCurrentRoom } from "../../roomService"
import { getCurrentGameConfig } from ".."
import { getCurrentUser } from "../../userService"
import { addItemToInventory, getFullInventory, updateOneObjectInRoom } from "../../inventoryService"
import { emitBroadcastTextToRoom, emitUpdateObjects } from "../../socketService/emits"
import { sendEvent } from "../../eventsService"
import { AvailableEvents } from "../../eventsService/allAvailableEvents"

const validateALookAction = (action: LookAction): boolean => {
    const currentCharacter = getCurrentCharacter()

    if (action.conditions.needsOneOfCharacterId.length > 0 && !action.conditions.needsOneOfCharacterId.includes(currentCharacter?.id ?? "")) {
        return false
    }

    if (action.conditions.needsOneOfCharacterType.length > 0 && !action.conditions.needsOneOfCharacterType.includes(currentCharacter?.type ?? "")) {
        return false
    }

    return true
}

const validateAnUseAction = (action: UseAction, objectIds: string[]): boolean => {
    const currentCharacter = getCurrentCharacter()

    if (!action.conditions.needsOneOfCharacterId.includes(currentCharacter?.id ?? "")) {
        return false
    }

    if (!action.conditions.needsOneOfCharacterType.includes(currentCharacter?.type ?? "")) {
        return false
    }

    if (!action.conditions.needsOneOfObjectsId.some(id => objectIds.includes(id))) {
        return false
    }

    return true
}


const getObjectForCharacter = (objectId: string): InventoryItem | null => {
    const currentRoom = getCurrentRoom()
    const currentUser = getCurrentUser()
    const currentCharacter = getCurrentCharacter()
    const currentGameConfig = getCurrentGameConfig()

    const baseInventoryObject = getFullInventory()[objectId]
    const possibleObjectInRoom = currentRoom?.objects[objectId]

    let currentObject = possibleObjectInRoom ?? baseInventoryObject

    if (!currentObject) {
        enqueueSnackbar("No Object to diplay for you", { variant: "error" })
        return null;
    }

    if (currentObject.ownerId && currentObject.ownerId !== currentUser?.id && !currentObject.isOpenForTaking) {
        enqueueSnackbar("You shouldn't be able to llok at this object. It has already been taken and is not shared by someone, please throw away the paper tag from the room", { variant: "error" })
        return null;
    }

    //allow sharing when user already has the object
    if (currentObject.ownerId === currentUser?.id) {
        currentObject.canBeTaken = false
        currentObject.canBeShared = true
    }

    //add lookAction analysis for this object
    const appliableLookActionResults = currentObject.lookActions.filter(validateALookAction).map(lookAction => lookAction.result)
    console.log("ENGINE : appliableLookActionResults", appliableLookActionResults)

    delete currentObject.currentVariationKey

    for (const lookActionResult of appliableLookActionResults) {
        if (lookActionResult.displayVariation) {
            currentObject.currentVariationKey = lookActionResult.displayVariation
        }

        if (lookActionResult.displayItem) {
            currentObject = getFullInventory()[lookActionResult.displayItem]
        }

        if (lookActionResult.popUpMessage) {
            sendEvent(AvailableEvents.displayPopUp, lookActionResult.popUpMessage)
        }

        if (lookActionResult.notifyMessage) {
            enqueueSnackbar(lookActionResult.notifyMessage.message, { variant: lookActionResult.notifyMessage.variant })
        }

        if (lookActionResult.broadcastMessage) {
            emitBroadcastTextToRoom(lookActionResult.broadcastMessage.message)
        }
    }

    return currentObject;
}


const takesAnObject = (objectId: string): void => {
    const currentRoom = getCurrentRoom()
    if (!currentRoom) return;

    const currentUser = getCurrentUser()
    const currentCharacter = getCurrentCharacter()
    const currentGameConfig = getCurrentGameConfig()

    const baseInventoryObject = getFullInventory()[objectId]
    const possibleObjectInRoom = currentRoom?.objects[objectId]

    let currentObject = possibleObjectInRoom ?? baseInventoryObject

    if (!currentObject) {
        enqueueSnackbar("No Object to take", { variant: "error" })
        return;
    }

    if (currentObject.ownerId && !currentObject.isOpenForTaking) {
        enqueueSnackbar("This object cannot be taken", { variant: "error" })
        return;
    }

    currentObject.isOpenForTaking = false
    addItemToInventory(currentObject)

    return;
}

const shareAnObject = (objectId: string): void => {
    const currentRoom = getCurrentRoom()
    if (!currentRoom) return;

    const baseInventoryObject = getFullInventory()[objectId]
    const possibleObjectInRoom = currentRoom?.objects[objectId]

    let currentObject = possibleObjectInRoom ?? baseInventoryObject

    if (!currentObject) {
        enqueueSnackbar("No Object to share", { variant: "error" })
        return;
    }

    currentObject.isOpenForTaking = true;

    updateOneObjectInRoom(currentObject)
}

const stopSharingAnObject = (objectId: string): void => {
    const currentRoom = getCurrentRoom()
    if (!currentRoom) return;

    const baseInventoryObject = getFullInventory()[objectId]
    const possibleObjectInRoom = currentRoom?.objects[objectId]

    let currentObject = possibleObjectInRoom ?? baseInventoryObject

    if (!currentObject) {
        enqueueSnackbar("No Object to stop sharing", { variant: "error" })
        return;
    }

    currentObject.isOpenForTaking = false;

    updateOneObjectInRoom(currentObject)
}

const useObjects = (objects: InventoryItem[]): void => {

}

const ENGINE_NAME = "default"

const gameEngine: GameEngine = {
    getObjectForCharacter,
    takesAnObject,
    shareAnObject,
    stopSharingAnObject,
    useObjects,
    ENGINE_NAME
}

export default gameEngine