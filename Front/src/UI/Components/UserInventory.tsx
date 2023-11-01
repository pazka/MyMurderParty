import { removeItemFromInventory, useInventory } from "../../services/inventoryService";

export default () => {
    const inventory = useInventory();

    return (
        <div>
            <h2>Test inventory no keys</h2>
            <ul>
                {inventory.map((inventoryItem) => (
                    <li >{inventoryItem.id} <button onClick={x=>removeItemFromInventory(inventoryItem)}>Remove</button></li>
                ))}
            </ul>
        </div>
    )
}
