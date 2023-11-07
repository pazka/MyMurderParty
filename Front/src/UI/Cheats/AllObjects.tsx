import { sendEvent } from "../../services/eventsService";
import { AvailableEvents } from "../../services/eventsService/allAvailableEvents";
import { getCurrentGameEngine, useGameEngine } from "../../services/gameService";
import { addItemToInventory, getFullInventory } from "../../services/inventoryService"
import { resetStorage, useGlobalStorage } from "../../services/storageService";
import ObjectQrCode from "../Components/common/ObjectQrCode";
import Button from "../Components/common/Button";

export default ({readonly}:{readonly : boolean}) => {
    const [storage, setStorage] = useGlobalStorage()
    const allInventory = getFullInventory();
    const currentGameEngine = useGameEngine();

    return (
        <div >
            <h1>All objects</h1>
            <Button onClick={x => resetStorage()}>Reset storage</Button>
            <div style={{
                width: "100%",
                display: "flex",
                flexWrap: "wrap"
            }}>
                {Object.values(allInventory).map((inventoryItem: InventoryItem) => (
                    <div >
                        {!readonly && <Button onClick={e => currentGameEngine.takesAnObject(inventoryItem.id)}> Take item</Button>}
                        {!readonly && <Button onClick={e => sendEvent(AvailableEvents.displayObject,inventoryItem.id)}>Look at item</Button>}
                        <ObjectQrCode objectId={inventoryItem.id} name={inventoryItem.name}/>
                    </div>
                ))}
            </div>
        </div>
    )
}