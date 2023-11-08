import { getCurrentGameEngine } from "../../../services/gameService"
import { getItemWithPossibleVariation } from "../../../services/inventoryService";

export default ({
    objectId,
    onClick
}: {
    objectId: string,
    onClick: (item: InventoryItem) => void
}) => {
    const currentGameEngine = getCurrentGameEngine();
    const item = currentGameEngine.getObjectForCharacter(objectId,true);
    if (!item) return null;

    const variatedItem = getItemWithPossibleVariation(item);

    return <div>
        {variatedItem?.name}
    </div>
}