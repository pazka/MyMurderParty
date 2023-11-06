import { enqueueSnackbar } from "notistack"
import { getCurrentCharacter } from "../../characterService"
import { getCurrentRoom } from "../../roomService"
import { getCurrentGameConfig } from ".."
import { getCurrentUser } from "../../userService"
import { addItemToInventory, addItemsToInventory, getFullInventory, getFullyProcessedItem, getRoomObjectOrInventoryObject, getUserInventory, updateObjectsInRoom, updateOneObjectInRoom } from "../../inventoryService"
import { emitBroadcastEndOfGameToRoom, emitBroadcastTextToRoom, emitUpdateObjects } from "../../socketService/emits"
import { sendEvent } from "../../eventsService"
import { AvailableEvents } from "../../eventsService/allAvailableEvents"
import { subscribe } from "diagnostics_channel"
import { CharactersTypes } from "../gameConfigs/exampleGame"

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

    if (action.conditions.needsOneOfCharacterId.length > 0 && !action.conditions.needsOneOfCharacterId.includes(currentCharacter?.id ?? "")) {
        return false
    }

    if (action.conditions.needsOneOfCharacterType.length > 0 && !action.conditions.needsOneOfCharacterType.includes(currentCharacter?.type ?? "")) {
        return false
    }

    if (action.conditions.needsOneOfObjectsId.length > 0 && !action.conditions.needsOneOfObjectsId.some(id => objectIds.includes(id))) {
        return false
    }

    return true
}

const executeAnAction = (action: ActionResult, currentObject: InventoryItem, noMessage: boolean): InventoryItem => {
    if (!currentObject) {
        enqueueSnackbar("Can't execute an object action on no object, this is a bug 😖", { variant: "error" })
        return currentObject;
    }

    if (action.displayVariationId) {
        currentObject.currentVariationKey = action.displayVariationId
    }

    if (action.displayItemId) {
        currentObject = getFullInventory()[action.displayItemId]
    }

    if (action.deleteItemIds) {
        let currentObjects = getCurrentRoom()?.objects ?? {}
        const deletedObjects = action.deleteItemIds.map(id => currentObjects[id])
        for (const objectId of action.deleteItemIds) {
            currentObjects[objectId].isDeleted = true
        }
        !noMessage && enqueueSnackbar(`${deletedObjects.map(o => o.name).join(', ')} were deleted, please remove the tags`, { variant: "info" })
        updateObjectsInRoom(currentObjects)
    }

    if (action.replaceByItemId) {
        if (!getFullInventory()[action.replaceByItemId]) {
            !noMessage && enqueueSnackbar("The new object dosen't exist, probably a bad Id, this is a bug 😖", { variant: "error" })
            return currentObject;
        }
        const newObject = getFullInventory()[action.replaceByItemId]
        !noMessage && enqueueSnackbar(`${currentObject.name} has been replaced by ${newObject.name}`, { variant: "info" })
        currentObject.replacedById = action.replaceByItemId
        updateOneObjectInRoom(currentObject)
    }

    if (action.giveItemIds) {
        const objectsToAdd: InventoryItem[] = []
        for (const objectId of action.giveItemIds) {
            !noMessage && enqueueSnackbar(`You received ${getFullInventory()[objectId].name}`, { variant: "success" })
            objectsToAdd.push(getRoomObjectOrInventoryObject(objectId))
        }
        addItemsToInventory(objectsToAdd)
    }

    if (action.popUpMessage) {
        sendEvent(AvailableEvents.displayPopUp, action.popUpMessage)
    }

    if (action.notifyMessage) {
        !noMessage && enqueueSnackbar(action.notifyMessage.message, { variant: action.notifyMessage.variant })
    }

    if (action.broadcastMessage) {
        emitBroadcastTextToRoom(action.broadcastMessage.message)
    }

    if (action.triggerEndOfGame) {
        emitBroadcastEndOfGameToRoom(action.triggerEndOfGame)
    }

    return currentObject
}

const getObjectForCharacter = (objectId: string, noMessage: boolean = false): InventoryItem | null => {
    const currentRoom = getCurrentRoom()
    const currentUser = getCurrentUser()
    const currentCharacter = getCurrentCharacter()
    const currentGameConfig = getCurrentGameConfig()

    let currentObject = getRoomObjectOrInventoryObject(objectId);

    if (!currentObject) {
        if (!noMessage) {
            enqueueSnackbar("No Object to diplay for you", { variant: "error" })
        }
        return null;
    }

    if (currentObject.isDeleted) {
        if (!noMessage) {
            enqueueSnackbar("This object has been deleted, you shouldn't be able to look at it, please throw away the paper tag", { variant: "error" })
        }
        return null;
    }

    if (currentObject.ownerId && currentObject.ownerId !== currentUser?.id && !currentObject.isOpenForTaking) {
        if (!noMessage) {
            enqueueSnackbar("You shouldn't be able to look at this object. It has already been taken and is not shared by someone, please throw away the paper tag from the room", { variant: "error" })
        }
        return null;
    }

    //allow sharing when user already has the object
    if (currentObject.ownerId === currentUser?.id) {
        currentObject.canBeTaken = false
        currentObject.canBeShared = true
    }

    //add lookAction analysis for this object
    const appliableLookActionResults = currentObject.lookActions.filter(validateALookAction).map(lookAction => lookAction.results).flat()
    console.log("ENGINE : appliableLookActionResults", appliableLookActionResults)

    delete currentObject.currentVariationKey

    for (const lookActionResult of appliableLookActionResults) {
        currentObject = executeAnAction(lookActionResult, currentObject, noMessage)
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

    if (currentObject.isDeleted) {
        enqueueSnackbar("This object has been deleted, you shouldn't be able to look at it, please throw away the paper tag", { variant: "error" })
        return;
    }

    if (!currentObject.canBeTaken) {
        enqueueSnackbar("This object can't be taken", { variant: "error" })
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

    if (currentObject.isDeleted) {
        enqueueSnackbar("This object has been deleted, you shouldn't be able to look at it, please throw away the paper tag", { variant: "error" })
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

    if (currentObject.isDeleted) {
        enqueueSnackbar("This object has been deleted, you shouldn't be able to look at it, please throw away the paper tag", { variant: "error" })
        return;
    }

    currentObject.isOpenForTaking = false;

    updateOneObjectInRoom(currentObject)
}

export const isObjectUsableAlone = (objectId: string): boolean => {
    const object = getFullyProcessedItem(objectId, true);
    if (!object) return false;

    //check if an action is possible without any other object and if the current caracter can do it
    if (!object.useActions) return false;

    const useActions = object.useActions.filter((useAction) => validateAnUseAction(useAction, []))

    if (useActions.length === 0) return false;

    const useActionWithNoObjectNeeded = useActions.find((useAction) => {
        return useAction.conditions.needsOneOfObjectsId.length === 0
    })

    return useActionWithNoObjectNeeded ? true : false;
}


export const isObjectUsableWithAnotherObject = (objectId: string): boolean => {
    const object = getObjectForCharacter(objectId, true);
    if (!object) return false;

    //check if an action is possible with another object and if the current caracter can do it
    if (!object.useActions) return false;

    const useActionsWithObjects = object.useActions.filter((useAction) => useAction.conditions.needsOneOfObjectsId.length > 0)
    if (useActionsWithObjects.length === 0) return false;

    return true;
}

const useObjects = (objects: InventoryItem[]): void => {
    const currentRoom = getCurrentRoom()
    if (!currentRoom) return;

    const currentUser = getCurrentUser()
    const currentCharacter = getCurrentCharacter()
    const currentGameConfig = getCurrentGameConfig()

    if (objects.some(o => o.isDeleted)) {
        const deletedObjects = objects.filter(o => o.isDeleted).map(o => o.name).join(", ")
        enqueueSnackbar(`Those objects [${deletedObjects}] has been deleted, you shouldn't be able to look at them, please throw away the paper tag`, { variant: "error" })
        return;
    }

    const objectsWithResults: ({
        object: InventoryItem;
        results: ActionResult[];
    })[] = objects.map(o => {
        const applicableUseActions = o
            .useActions
            .filter(a => validateAnUseAction(a, objects.map(o => o.id)))
            .map(a => a.results).flat()

        if (applicableUseActions.length === 0) {
            return null;
        }

        return { object: o, results: applicableUseActions }
    }).filter(x => x != null) as ({
        object: InventoryItem;
        results: ActionResult[];
    })[]

    if (objectsWithResults.length === 0) {
        enqueueSnackbar("Nothing happens...", { variant: "info" })
        return;
    }

    console.log(`ENGINE : Found ${objectsWithResults.length} object who have match actions to execute`, objectsWithResults)

    for (const objectWithResults of objectsWithResults) {
        for (const useActionResult of objectWithResults.results) {
            executeAnAction(useActionResult, objectWithResults.object, false)
        }
    }

    return;
}

const executeEndOfGame = (endOfGameResults: EndOfGameResult[]): void => {
    const currentRoom = getCurrentRoom()
    if (!currentRoom) return;

    const currentUser = getCurrentUser()
    const currentCharacter = getCurrentCharacter()
    const currentGameConfig = getCurrentGameConfig()
    const currentType = currentCharacter?.type ?? CharactersTypes.NORMAL

    for (const endOfGameResult of endOfGameResults) {
        if (endOfGameResult.caractersTypeId.includes(currentType)) {
            sendEvent(AvailableEvents.displayPopUp, endOfGameResult.popUpMessage)
        }
    }
}


const ENGINE_NAME = "default"

const gameEngine: GameEngine = {
    getObjectForCharacter,
    takesAnObject,
    shareAnObject,
    stopSharingAnObject,
    useObjects,
    isObjectUsableAlone,
    isObjectUsableWithAnotherObject,
    executeEndOfGame,
    ENGINE_NAME
}

export default gameEngine