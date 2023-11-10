import './PartyRoom.scss';

import { useEffect, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';

import { useCurrentCharacter } from '../../services/characterService';
import { sendEvent, useEvent } from '../../services/eventsService';
import { AvailableEvents } from '../../services/eventsService/allAvailableEvents';
import { getCurrentGameConfig, getCurrentGameEngine } from '../../services/gameService';
import { useInventory } from '../../services/inventoryService';
import { useCurrentRoom } from '../../services/roomService';
import { useGlobalStorage } from '../../services/storageService';
import CharacterMiniature from '../Components/Common/CharacterMiniature';
import UserInventoryObjects from '../Components/UserInventoryObjects';
import CharacterList from './CharacterList';
import CharacterPage from './CharacterPage';
import ObjectDetailPage from './ObjectDetailPage';
import PartyEvents from './PartyEvents';
import GameScenario from './GameScenario';
import CombineObject from './CombineObject';

export default () => {
    const [storage] = useGlobalStorage();
    const inventory = useInventory();
    const currentGameEngine = getCurrentGameEngine();
    const currentGameConfig = getCurrentGameConfig();
    const currenRoom = useCurrentRoom();
    const usedCharacter = useCurrentCharacter()
    const navigate = useNavigate()

    useEffect(() => {
        if(!storage.currentRoom){
            navigate('/')
        }
    }, [storage.currentRoom])


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

    useEvent(AvailableEvents.endOfGame, (endOfGameResults: EndOfGameResult[]) => {
        currentGameEngine.executeEndOfGame(endOfGameResults)
    })

    return <>
        <div className="head panel">
            <div className="character">
                <CharacterMiniature isUser charId={usedCharacter?.id ?? ""} onClick={() => navigate('characters')} />
            </div>
            <button className="qr-scan object" onClick={x => sendEvent(AvailableEvents.beginQrScan)}>
                🔎
            </button>
            <div className="head-actions">
                <button className="secondary" onClick={()=>navigate('./scenario')}>📜 Scenario</button>
                <button className="secondary" onClick={()=>navigate('./events')}>📩 Messagerie</button>
                <Routes>
                    <Route path="/:path/*" element={<button className="secondary" onClick={()=>navigate('.')}>💼 Inventaire </button>} />
                </Routes>
            </div>
        </div>

        <Routes>
            <Route path="/*" element={<UserInventoryObjects onObjectClick={i => sendEvent(AvailableEvents.displayObject, i.id)} />} />
            <Route path="/object/:objectId" element={<ObjectDetailPage />} />
            <Route path="/object/:objectId/combine" element={<CombineObject />} />
            <Route path="/characters" element={<CharacterList />} />
            <Route path="/characters/:characterId" element={<CharacterPage />} />
            <Route path="/events" element={<PartyEvents />} />
            <Route path="/scenario" element={<GameScenario />} />
        </Routes>
    </>
}
