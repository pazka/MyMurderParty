import { addItemToInventory, getFullInventory, useInventory } from "../../services/inventoryService"
import { resetStorage } from "../../services/storageService";

export const AllObjects = () => {
    const allInventory = getFullInventory();

    return (
        <div>
            <h1>All objects</h1>
            <button onClick={x=> resetStorage()}>Reset storage</button>
            <ul>
                {allInventory.map((inventoryItem) => (
                    <li >{inventoryItem.id} <button onClick={e => addItemToInventory(inventoryItem)}> Take item</button></li>
                ))}
            </ul>
        </div>
    )
}