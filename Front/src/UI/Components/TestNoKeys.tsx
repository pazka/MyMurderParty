import { removeItemFromInventory, useInventory } from "../../services/inventoryService";

export const TestNoKeys = () => {
    const inventory = useInventory();

    return (
        <div>
            <h1>Test inventory no keys</h1>
            <ul>
                {inventory.filter(ii => !ii.id.includes("Key")).map((inventoryItem) => (
                    <li >{inventoryItem.id} </li>
                ))}
            </ul>
        </div>
    )
}