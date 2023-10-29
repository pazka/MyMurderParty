import { removeItemFromInventory, useInventory } from "../../services/inventoryService";

export const UserInventory = () => {
    const inventory = useInventory();

    return (
        <div>
            <h1>Test inventory no keys</h1>
            <ul>
                {inventory.map((inventoryItem) => (
                    <li >{inventoryItem.id} <button onClick={x=>removeItemFromInventory(inventoryItem)}>Remove</button></li>
                ))}
            </ul>
        </div>
    )
}
