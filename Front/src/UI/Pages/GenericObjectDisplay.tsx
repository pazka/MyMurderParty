import { enqueueSnackbar } from "notistack"
import { getCurrentGameConfig, getCurrentGameEngine } from "../../services/gameService"
import { useGlobalStorage } from "../../services/storageService"
import { getCurrentCharacter } from "../../services/characterService"
import Markdown from "react-markdown"
import { useState } from "react"
import { useEvent } from "../../services/eventsService"
import { AvailableEvents } from "../../services/eventsService/allAvailableEvents"
import { getItemWithPossibleVariation } from "../../services/inventoryService"

export default () => {
    const [storage, setStorage] = useGlobalStorage()
    const [objectId, setObjectId] = useState<string | null>()
    const currentRoom = storage.currentRoom as Room
    const currentGameEngine = getCurrentGameEngine()

    useEvent(AvailableEvents.displayObject, (objectId: string) => {
        setObjectId(objectId)
    })

    if (!objectId) {
        return null
    }

    if (!currentRoom) {
        enqueueSnackbar("No Room to display", { variant: "error" })
        return null
    }

    let object: InventoryItem | null = currentGameEngine.getObjectForCharacter(objectId)

    if (!object) {
        return <p>Nothing</p>
    }

    object = getItemWithPossibleVariation(object)

    return <div>
        <h1>{object.name}</h1>

        <Markdown>{object.description}</Markdown>

        {object.canBeTaken && <button onClick={() => {
            currentGameEngine.takesAnObject(objectId)
        }}>Take Object</button>}

        {object.canBeShared && <button onClick={() => {
            currentGameEngine.shareAnObject(objectId)
        }}>Share the Object</button>}

        <button onClick={x => setObjectId(null)}>Close</button>
    </div>
}