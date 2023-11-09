import { sendEvent } from "../../services/eventsService";
import { AvailableEvents } from "../../services/eventsService/allAvailableEvents";
import { getCurrentGameConfig, getCurrentGameEngine, useGameEngine } from "../../services/gameService";
import { getItemWithPossibleVariation, removeItemFromInventory, useInventory } from "../../services/inventoryService";
import ObjectMiniature from "./Common/ObjectMiniature";

export default ({ onObjectClick }: { onObjectClick: (object:InventoryItem)=>void }) => {
    const inventory = useInventory();
    const allItems = Object.values(getCurrentGameConfig().FULL_INVENTORY);
    const currentGameEngine = useGameEngine();

    return (
        <div className="section">
                {allItems.map((inventoryItem,i) => (
                    <ObjectMiniature key={i} objectId={inventoryItem.id} onClick={onObjectClick}/>
                ))}
        </div>
    )
}
