import { removeItemFromInventory, useInventory } from "../../services/inventoryService";

export const TestKeys = () => {
    const inventory = useInventory();

    return (
        <div>
            <h1>Test inventory keys</h1>
            <ul>
                {inventory.filter(ii => ii.id.includes("Key")).map((inventoryItem) => (
                    <li >{inventoryItem.id}  </li>
                ))}
            </ul>
        </div>
    )
}