import { addItemToInventory, getFullInventory } from "../../services/inventoryService"
import { resetStorage } from "../../services/storageService";

export default () => {
    const allInventory = getFullInventory();

    return (
        <div>
            <h1>All objects</h1>
            <button onClick={x=> resetStorage()}>Reset storage</button>
            <ul>
                {Object.values(allInventory).map((inventoryItem : InventoryItem) => (
                    <li >{inventoryItem.id} <button onClick={e => addItemToInventory(inventoryItem)}> Take item</button></li>
                ))}
            </ul>
        </div>
    )
}