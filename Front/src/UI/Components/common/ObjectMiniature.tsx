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
    const item = getFullyProcessedItem(objectId, true);
    if (!item) return null;

    return <div className='miniature-wrapper object-item' onClick={() => onClick(item)} >
        <div className='img-wrapper'>
            <img src={item.imageUrl} />
            <div className="shadow"></div>
        </div>
        <span className="secondary">{item.name}</span>
    </div>
}