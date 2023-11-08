import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import Markdown from 'react-markdown';

import { sendEvent, useEvent } from '../../services/eventsService';
import { AvailableEvents } from '../../services/eventsService/allAvailableEvents';
import { useGameEngine } from '../../services/gameService';
import { getFullyProcessedItem, getItemWithPossibleVariation, useInventory } from '../../services/inventoryService';
import { useCurrentRoom } from '../../services/roomService';
import { useGlobalStorage } from '../../services/storageService';


export default () => {
    const [storage, setStorage] = useGlobalStorage()
    const [objectToDisplay, setObjectToDisplay] = useState<InventoryItem | null>(null)
    const currentRoom = useCurrentRoom()
    const currentGameEngine = useGameEngine()
    const userInventory = useInventory()

    useEvent(AvailableEvents.displayObject, (objectId: string) => {
        handleDisplayObjectFromId(objectId)
    })

    const handleDisplayObjectFromId =(objectId : string)=>{
        if (!objectId) {
            return null
        }
    
        if (!storage.currentRoom) {
            enqueueSnackbar("No Room to display", { variant: "error" })
            return null
        }
    
        let object: InventoryItem | null = getFullyProcessedItem(objectId,true)

        setObjectToDisplay(object)
    }


    if (!objectToDisplay) {
        return null
    }

    return <div>
        <h1>{objectToDisplay.name}</h1>

        <Markdown>{objectToDisplay.description}</Markdown>

        {objectToDisplay.canBeTaken && <button onClick={() => {
            sendEvent(AvailableEvents.displayObject,null)
            currentGameEngine.takesAnObject(objectToDisplay.id)
        }}>Take Object</button>}

        {objectToDisplay.canBeShared && <button onClick={() => {
            sendEvent(AvailableEvents.displayObject,null)
            currentGameEngine.shareAnObject(objectToDisplay.id)
        }}>Share the Object</button>}

        {currentGameEngine.isObjectUsableAlone(objectToDisplay.id) && <button onClick={() => {
            sendEvent(AvailableEvents.displayObject,null)
            currentGameEngine.useObjects([objectToDisplay])
        }}>Use the Object</button>}

        {currentGameEngine.isObjectUsableWithAnotherObject(objectToDisplay.id)  && <button onClick={() => {
            sendEvent(AvailableEvents.displayObject,null)
            sendEvent(AvailableEvents.displayUsePanel, objectToDisplay.id)
        }}>Use with something else</button>}

        <button onClick={x => setObjectToDisplay(null)}>Close</button>
    </div>
}