import { useState } from "react"
import { sendEvent, useEvent } from "../../services/eventsService"
import { AvailableEvents } from "../../services/eventsService/allAvailableEvents"
import { getCurrentGameConfig, getCurrentGameEngine } from "../../services/gameService"
import { useInventory } from "../../services/inventoryService"
import { useCurrentRoom } from "../../services/roomService"
import { useGlobalStorage } from "../../services/storageService"
import CharacterMiniature from "../Components/Common/CharacterMiniature"
import UserInventoryObjects from "../Components/UserInventoryObjects"
import './PartyRoom.scss'
import ObjectDetails from "../Components/ObjectDetails"

export default () => {
    const [storage] = useGlobalStorage();
    const inventory = useInventory();
    const currentGameEngine = getCurrentGameEngine();
    const currentGameConfgi = getCurrentGameConfig();
    const currenRoom = useCurrentRoom();
    const [currentObjectIdDisplayed, setCurrentObjectIdDisplayed] = useState<string | undefined>(undefined);

    useEvent(AvailableEvents.endQrScan, (objectId: string) => {
        sendEvent(AvailableEvents.displayObject, objectId)
    })

    return <>
        <div className="head panel">
            <div>
                <CharacterMiniature charId="1" />
            </div>
            <div >
                <button className="qr-scan object" onClick={x => sendEvent(AvailableEvents.beginQrScan)}>
                    🔎
                </button>
            </div>
            <div>
                <button className="secondary">📜 Scenario</button>
                <button className="secondary">📩 Party events</button>
            </div>
        </div>
        <div className="party-active-content">
            {!currentObjectIdDisplayed && <UserInventoryObjects onObjectClick={i => sendEvent(AvailableEvents.displayObject, i.id)} />}
            {currentObjectIdDisplayed && <ObjectDetails objectId={currentObjectIdDisplayed} />}
        </div>
    </>
}
