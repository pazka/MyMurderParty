import { enqueueSnackbar } from "notistack"
import { getCurrentCharacter } from "../../characterService"
import { getCurrentRoom } from "../../roomService"
import { getCurrentGameConfig } from ".."
import { getCurrentUser } from "../../userService"
import { getFullInventory } from "../../inventoryService"
import { emitUpdateObjects } from "../../socketService/emits"

const validateALookAction = (action: LookAction): boolean => {
    const currentCharacter = getCurrentCharacter()

    if (action.conditions.needsOneOfCharacterId && !action.conditions.needsOneOfCharacterId.includes(currentCharacter?.id ?? "")) {
        return false
    }
    if (action.conditions.needsOneOfCharacterType && !action.conditions.needsOneOfCharacterType.includes(currentCharacter?.type ?? "")) {
        return false
    }

    return true
}

const validateAnUseAction = (action: UseAction,objectIds : string[]): boolean => {
    const currentCharacter = getCurrentCharacter()

    if (action.conditions.needsOneOfCharacterId && !action.conditions.needsOneOfCharacterId.includes(currentCharacter?.id ?? "")) {
        return false
    }
    if (action.conditions.needsOneOfCharacterType && !action.conditions.needsOneOfCharacterType.includes(currentCharacter?.type ?? "")) {
        return false
    }
    if(action.conditions.needsOneOfObjectsId && !action.conditions.needsOneOfObjectsId.some(id => objectIds.includes(id))) {
        return false
    }

    return true
}


const seeAnObject = (objectId: string): InventoryItem | null => {
    const currentRoom = getCurrentRoom()
    const currentUser = getCurrentUser()
    const currentCharacter = getCurrentCharacter()
    const currentGameConfig = getCurrentGameConfig()

    const baseInventoryObject = getFullInventory()[objectId]
    const possibleObjectInRoom = currentRoom?.objects[objectId]

    let currentObject = possibleObjectInRoom ?? baseInventoryObject

    if (!currentObject) {
        enqueueSnackbar("No Object to diplay for you", {variant: "error"})
        return null
    }

    if (currentObject.ownerId && currentObject.ownerId !== currentUser?.id && !currentObject.isOpenForTaking) {
        enqueueSnackbar("This object has already been taken, please throw away the paper tag from the room", {variant: "error"})
        return null
    }

    //allow sharing when user already has the object
    if (currentObject.ownerId === currentUser?.id) {
        currentObject.canBeTaken = false
        currentObject.canBeShared = true
    }

    //add lookAction analysis for this object
    const appliableLookActionResults = currentObject.lookActions.filter(validateALookAction).map(lookAction => lookAction.result)

    for (const lookActionResult of appliableLookActionResults) {
        if (lookActionResult.displayVariation) {
            currentObject.currentVariationKey = lookActionResult.displayVariation
        }

        if (lookActionResult.displayItem) {
            currentObject = getFullInventory()[lookActionResult.displayItem]
        }

        if (lookActionResult.popUpMessage) {
            enqueueSnackbar(lookActionResult.popUpMessage.message, {variant: lookActionResult.popUpMessage.variant})
        }
    }

    return currentObject
}


const takesAnObject = (objectId: string): InventoryItem | null => {
    const currentRoom = getCurrentRoom()
    if(!currentRoom) return null

    const currentUser = getCurrentUser()
    const currentCharacter = getCurrentCharacter()
    const currentGameConfig = getCurrentGameConfig()

    const baseInventoryObject = getFullInventory()[objectId]
    const possibleObjectInRoom = currentRoom?.objects[objectId]

    let currentObject = possibleObjectInRoom ?? baseInventoryObject

    if (!currentObject) {
        enqueueSnackbar("No Object to take", {variant: "error"})
        return null
    }

    if (currentObject.ownerId && currentObject.ownerId !== currentUser?.id) {
        enqueueSnackbar("This object has already been taken, please throw away the paper tag from the room", {variant: "error"})
        return null
    }

    if (!currentObject.canBeTaken) {
        enqueueSnackbar("This object cannot be taken", {variant: "error"})
        return null
    }

    currentObject.isOpenForTaking = false
    currentObject.ownerId = currentUser?.id
    currentRoom.objects[currentObject.id] = currentObject

    emitUpdateObjects(currentRoom.objects)

    return currentObject
}

const shareAnObject = (objectId: string): InventoryItem | null => {
    const currentRoom = getCurrentRoom()
    if(!currentRoom) return null

    const baseInventoryObject = getFullInventory()[objectId]
    const possibleObjectInRoom = currentRoom?.objects[objectId]

    let currentObject = possibleObjectInRoom ?? baseInventoryObject

    if (!currentObject) {
        enqueueSnackbar("No Object to share", {variant: "error"})
        return null
    }

    currentObject.isOpenForTaking = true
    currentRoom.objects[currentObject.id] = currentObject

    emitUpdateObjects(currentRoom.objects)

    return currentObject
}

const useObjects = (objects: InventoryItem[]): InventoryItem[] | null => {
    return null
}

const ENGINE_NAME = "default"

const gameEngine: GameEngine = {
    seeAnObject,
    takesAnObject,
    shareAnObject,
    useObjects,
    ENGINE_NAME
}

export default gameEngine