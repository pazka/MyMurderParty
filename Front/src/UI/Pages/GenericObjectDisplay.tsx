import { enqueueSnackbar } from "notistack"
import { getCurrentGameConfig, getCurrentGameEngine } from "../../services/gameService"
import { useGlobalStorage } from "../../services/storageService"
import { getCurrentCharacter } from "../../services/characterService"
import Markdown from "react-markdown"
import { useState } from "react"
import { useEvent } from "../../services/eventsService"
import { AvailableEvents } from "../../services/eventsService/allAvailableEvents"
import { getItemWithPossibleVariation, getUserInventory, getUserInventoryFromRoom } from "../../services/inventoryService"
import { getCurrentRoom } from "../../services/roomService"

export default () => {
    const [storage, setStorage] = useGlobalStorage()
    const [objectToDisplay, setObjectToDisplay] = useState<InventoryItem | null>(null)
    const currentRoom = getCurrentRoom()
    const currentGameEngine = getCurrentGameEngine()
    const userInventory = getUserInventory()

    const handleDisplayObjectFromId =(objectId : string)=>{
        if (!objectId) {
            return null
        }
    
        if (!currentRoom) {
            enqueueSnackbar("No Room to display", { variant: "error" })
            return null
        }
    
        let object: InventoryItem | null = currentGameEngine.getObjectForCharacter(objectId)
        if(object)
            object = getItemWithPossibleVariation(object)

        setObjectToDisplay(object)
    }

    useEvent(AvailableEvents.displayObject, (objectId: string) => {
        handleDisplayObjectFromId(objectId)
    })

    if (!objectToDisplay) {
        return null
    }

    return <div>
        <h1>{objectToDisplay.name}</h1>

        <Markdown>{objectToDisplay.description}</Markdown>

        {objectToDisplay.canBeTaken && <button onClick={() => {
            currentGameEngine.takesAnObject(objectToDisplay.id)
        }}>Take Object</button>}

        {objectToDisplay.canBeShared && <button onClick={() => {
            currentGameEngine.shareAnObject(objectToDisplay.id)
        }}>Share the Object</button>}

        {objectToDisplay.canBeUsed && <button onClick={() => {
            currentGameEngine.useObjects([objectToDisplay])
        }}>Use the Object</button>}

        <div>
            {userInventory.map((inventoryItem) => {
                if (inventoryItem.id === objectToDisplay.id) {
                    return null
                }

                return <button onClick={() => {
                    currentGameEngine.useObjects([objectToDisplay, inventoryItem])
                }}>{inventoryItem.name}</button>
            
            })}
        </div>

        <button onClick={x => setObjectToDisplay(null)}>Close</button>
    </div>
}