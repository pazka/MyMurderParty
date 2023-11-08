import { sendEvent } from "../../services/eventsService";
import { AvailableEvents } from "../../services/eventsService/allAvailableEvents";
import { getCurrentGameEngine, useGameEngine } from "../../services/gameService";
import { getItemWithPossibleVariation, removeItemFromInventory, useInventory } from "../../services/inventoryService";
import ObjectMiniature from "./Common/ObjectMiniature";

export default ({ onObjectClick }: { onObjectClick: (object:InventoryItem)=>void }) => {
    const inventory = useInventory();
    const currentGameEngine = useGameEngine();

    return (
        <div className="section">
                {inventory.map((inventoryItem,i) => (
                    <ObjectMiniature key={i} objectId={inventoryItem.id} onClick={onObjectClick}/>
                ))}
        </div>
    )
}
