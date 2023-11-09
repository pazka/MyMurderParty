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
import { Route, Routes, useNavigate, useParams } from "react-router-dom"
import CharacterList from "./CharacterList"
import ObjectDetailPage from "./ObjectDetailPage"

export default () => {
    const [storage] = useGlobalStorage();
    const inventory = useInventory();
    const currentGameEngine = getCurrentGameEngine();
    const currentGameConfgi = getCurrentGameConfig();
    const currenRoom = useCurrentRoom();
    const navigate = useNavigate()

    useEvent(AvailableEvents.endQrScan, (objectId: string) => {
        console.log("endQrScan", objectId)
        sendEvent(AvailableEvents.displayObject, objectId)
    })

    useEvent(AvailableEvents.displayObject, (objectId: string | null) => {
        if (objectId != null) {
            navigate("object/" + objectId)
        } else {
            navigate(".")
        }
    })

    return <>
        <div className="head panel">
            <div className="character">
                <CharacterMiniature charId="1" onClick={() => navigate('characters')} />
            </div>
            <button className="qr-scan object" onClick={x => sendEvent(AvailableEvents.beginQrScan)}>
                🔎
            </button>
            <div className="head-actions">
                <button className="secondary">📜 Scenario</button>
                <button className="secondary">📩 Party events</button>
                <Routes>
                    <Route path="/:path/*" element={<button className="secondary" onClick={()=>navigate('.')}>💼 Inventory </button>} />
                </Routes>
            </div>
        </div>

        <Routes>
            <Route path="/*" element={<UserInventoryObjects onObjectClick={i => sendEvent(AvailableEvents.displayObject, i.id)} />} />
            <Route path="/object/:objectId" element={<ObjectDetailPage />} />
            <Route path="/characters" element={<CharacterList />} />
            <Route path="/characters/:characterId" element={<CharacterList />} />
        </Routes>
    </>
}
