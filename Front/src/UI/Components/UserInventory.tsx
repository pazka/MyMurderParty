import { sendEvent } from "../../services/eventsService";
import { AvailableEvents } from "../../services/eventsService/allAvailableEvents";
import { getCurrentGameEngine } from "../../services/gameService";
import { removeItemFromInventory, useInventory } from "../../services/inventoryService";

export default () => {
    const inventory = useInventory();
    const currentGameEngine = getCurrentGameEngine();

    return (
        <div>
            <h2>My Inventory</h2>
            <ul>
                {inventory.map((inventoryItem) => (
                    <li >
                        {inventoryItem.id}
                        {inventoryItem.isOpenForTaking && <button onClick={x => currentGameEngine.stopSharingAnObject(inventoryItem.id)}>Stop Sharing</button>}
                        {!inventoryItem.isOpenForTaking && <button onClick={x => currentGameEngine.shareAnObject(inventoryItem.id)}>Share</button>}
                        <button onClick={x => sendEvent(AvailableEvents.displayObject, inventoryItem.id)}>Look</button>
                    </li>
                ))}
            </ul>
        </div>
    )
}
