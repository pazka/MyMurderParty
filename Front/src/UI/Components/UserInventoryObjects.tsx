import { sendEvent } from "../../services/eventsService";
import { AvailableEvents } from "../../services/eventsService/allAvailableEvents";
import { getCurrentGameEngine, useGameEngine } from "../../services/gameService";
import { getItemWithPossibleVariation, removeItemFromInventory, useInventory } from "../../services/inventoryService";

export default ({ onObjectClick }: { onObjectClick: (object:InventoryItem)=>void }) => {
    const inventory = useInventory();
    const currentGameEngine = useGameEngine();

    return (
        <div>
            <h2>My Inventory</h2>
            <ul className="object-list">
                {inventory.map((inventoryItem,i) => (
                    <li key={i} onClick={x=>onObjectClick(inventoryItem)}>
                        {inventoryItem.id}
                    </li>
                ))}
            </ul>
        </div>
    )
}
