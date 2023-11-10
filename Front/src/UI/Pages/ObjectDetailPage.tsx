import { useNavigate, useParams } from "react-router-dom";
import { sendEvent } from "../../services/eventsService";
import { AvailableEvents } from "../../services/eventsService/allAvailableEvents";
import { getCurrentGameEngine } from "../../services/gameService";
import { getFullyProcessedItem } from "../../services/inventoryService";
import { useGlobalStorage } from "../../services/storageService";

export default () => {
    const {objectId} = useParams();
    const [storage] = useGlobalStorage();

    if (!objectId) {
        return <p>"null"</p>
    }

    const currentGameEngine = getCurrentGameEngine();
    const item = getFullyProcessedItem(objectId, false);

    if (!item) {
        return <p>"null"</p>
    }

    return <div className="object-detail-wrapper">
        <div className="head">
            <h3>{item?.name}</h3>
            <img src={item?.imageUrl} alt={item?.name + " thumbnail"} />
        </div>
        <div className="description">
            {item?.description}
        </div>
        <div className="actions">
            {item.canBeTaken && <button onClick={() => {
                sendEvent(AvailableEvents.displayObject, null)
                currentGameEngine.takesAnObject(item.id)
            }}>Take Object</button>}

            {item.canBeShared && <button onClick={() => {
                sendEvent(AvailableEvents.displayObject, null)
                currentGameEngine.shareAnObject(item.id)
            }}>Share the Object</button>}

            {currentGameEngine.isObjectUsableAlone(item.id) && <button onClick={() => {
                sendEvent(AvailableEvents.displayObject, null)
                currentGameEngine.useObjects([item])
            }}>Use the Object</button>}

            {currentGameEngine.isObjectUsableWithAnotherObject(item.id) && <button onClick={() => {
                sendEvent(AvailableEvents.displayObject, null)
                sendEvent(AvailableEvents.displayUsePanel, item.id)
            }}>Use with something else</button>}

            <button onClick={x => sendEvent(AvailableEvents.displayObject, null)}>Close</button>
        </div>
    </div>
}