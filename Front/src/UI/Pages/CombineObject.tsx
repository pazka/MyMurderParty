import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom"
import { sendEvent } from "../../services/eventsService";
import { AvailableEvents } from "../../services/eventsService/allAvailableEvents";
import { getCurrentGameEngine } from "../../services/gameService";
import { getFullyProcessedItem } from "../../services/inventoryService";
import { useGlobalStorage } from "../../services/storageService";
import UserInventoryObjects from "../Components/UserInventoryObjects";
import './ObjectDetailPage.scss'

export default () => {
    const {objectId} = useParams()
    const [storage] = useGlobalStorage();
    const currentGameEngine = getCurrentGameEngine();
    const navigate = useNavigate()

    if (!objectId) {
        return <p>Object Id not found</p>
    }
    const itemToCombine = getFullyProcessedItem(objectId ?? "", true);

    useEffect(() => {

        if (!itemToCombine) {
            sendEvent(AvailableEvents.displayObject, null)
        }

    }, [objectId])

    if (!itemToCombine) {
        return <p>No item to display, it has already been taken by someone else</p>
    }

    const handleCombine = (otherObject : InventoryItem) => {
        currentGameEngine.useObjects([itemToCombine, otherObject])
        navigate('..')
    }

    return <div className='combine-wrapper section panel'>
        <h2>Combine {itemToCombine.name} with what ?</h2>
        <div className="all-objects">
            <UserInventoryObjects onObjectClick={otherObject => handleCombine(otherObject)} />
        </div>
    </div>
}