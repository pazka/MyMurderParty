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
        return <p>Rien à afficher, l'objet a été pris par quelqu'un</p>
    }

    const handleCombine = (otherObject : InventoryItem) => {
        currentGameEngine.useObjects([itemToCombine, otherObject])
        navigate('..')
    }

    return <div className='combine-wrapper section panel'>
        <h2>Utiliser {itemToCombine.name} avec quoi ?</h2>
        <div className="all-objects">
            <UserInventoryObjects onObjectClick={otherObject => handleCombine(otherObject)} />
        </div>
    </div>
}