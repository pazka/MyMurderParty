import { sendEvent } from "../../services/eventsService";
import { AvailableEvents } from "../../services/eventsService/allAvailableEvents";
import { getCurrentGameEngine, useGameEngine } from "../../services/gameService";
import { addItemToInventory, getFullInventory } from "../../services/inventoryService"
import { resetStorage, useGlobalStorage } from "../../services/storageService";
import ObjectQrCode from "../Components/common/ObjectQrCode";
;

export default ({readonly}:{readonly : boolean}) => {
    const [storage, setStorage] = useGlobalStorage()
    const allInventory = getFullInventory();
    const currentGameEngine = useGameEngine();

    return (
        <div >
            <h1>All objects</h1>
            <button onClick={x => resetStorage()}>Reset storage</button>
            <div style={{
                width: "100%",
                display: "flex",
                flexWrap: "wrap"
            }}>
                {Object.values(allInventory).map((inventoryItem: InventoryItem) => (
                    <div >
                        {!readonly && <button onClick={e => currentGameEngine.takesAnObject(inventoryItem.id)}> Take item</button>}
                        {!readonly && <button onClick={e => sendEvent(AvailableEvents.displayObject,inventoryItem.id)}>Look at item</button>}
                        <ObjectQrCode objectId={inventoryItem.id} name={inventoryItem.name}/>
                    </div>
                ))}
            </div>
        </div>
    )
}