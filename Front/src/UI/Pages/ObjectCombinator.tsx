import { useState } from "react"
import { AvailableEvents } from "../../services/eventsService/allAvailableEvents"
import { useGlobalStorage } from "../../services/storageService"
import { useEvent } from "../../services/eventsService"
import { getCurrentGameEngine, useGameEngine } from "../../services/gameService"
import { getUserInventory, useInventory } from "../../services/inventoryService"


export default () => {
    const [storage, setStorage] = useGlobalStorage()
    const [isOpen, setIsOpen] = useState(false)
    const [objectId, setObjectId] = useState<string | null>(null)
    const userInventory = useInventory()
    const currentGameEngine = useGameEngine()

    const handleOpenPanel = (objectId: string) => {
        setIsOpen(true)
        setObjectId(objectId)
    }

    const handleClosePanel = () => {
        setIsOpen(false)
        setObjectId(null)
    }

    useEvent(AvailableEvents.displayUsePanel, handleOpenPanel)

    if (!isOpen) {
        return null
    }

    if (!objectId) {
        return null
    }

    const objectToDisplay = currentGameEngine.getObjectForCharacter(objectId,true)
    
    if (!objectToDisplay) {
        return <p>Rien à afficher</p>
    }

    return <div className="object-combine-panel">
        {userInventory.map((inventoryItem) => {
            if (inventoryItem.id === objectToDisplay.id) {
                return null
            }

            const inventoryItemToCombine = currentGameEngine.getObjectForCharacter(inventoryItem.id,true)
            if (!inventoryItemToCombine) {
                return null
            }

            return <button onClick={() => {
                currentGameEngine.useObjects([objectToDisplay, inventoryItemToCombine])
            }}>{inventoryItem.name}</button>
        })}
        <button onClick={handleClosePanel}>Fermer</button>
    </div>
}