import { addItemToInventory, getFullInventory } from "../../services/inventoryService"
import { resetStorage } from "../../services/storageService";
import ObjectQrCode from "../Components/ObjectQrCode";

export default () => {
    const allInventory = getFullInventory();

    return (
        <div>
            <h1>All objects</h1>
            <button onClick={x=> resetStorage()}>Reset storage</button>
            <div style={{display : "flex"}}>
                {Object.values(allInventory).map((inventoryItem : InventoryItem) => (
                    <div >
                        <button onClick={e => addItemToInventory(inventoryItem)}> Take item</button>
                        <ObjectQrCode objectId={inventoryItem.id}/>
                    </div>
                ))}
            </div>
        </div>
    )
}