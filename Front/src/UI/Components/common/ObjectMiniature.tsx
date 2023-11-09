import { getCurrentGameEngine } from "../../../services/gameService"
import { getFullyProcessedItem, getItemWithPossibleVariation } from "../../../services/inventoryService";
import './Miniatures.scss';

export default ({
    objectId,
    onClick
}: {
    objectId: string,
    onClick: (item: InventoryItem) => void
}) => {
    const item = getFullyProcessedItem(objectId,true);
    if (!item) return null;

    return <div onClick={() => onClick(item)} >
        {item?.name}
        <img width={50} src={item.imageUrl} />
    </div>
}