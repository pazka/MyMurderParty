import { useState } from "react"
import QrCodeReader from "../Components/QrCodeReader"
import { TestPage } from "./TestPage"
import { sendEvent, useEvent } from "../../services/eventsService"
import { getCurrentGameConfig, getCurrentGameEngine, useGameEngine } from "../../services/gameService"
import { AvailableEvents } from "../../services/eventsService/allAvailableEvents"
import GenericObjectDisplay from "./GenericObjectDisplay"
import { getCurrentCharacter } from "../../services/characterService"
import ObjectCombinator from "./ObjectCombinator"

export default () => {
    const [isQrOpen, setIsQrOpen] = useState(false)
    const currentGameEngine = useGameEngine()

    const handleObjectScanned = (objectId: string) => {
        setIsQrOpen(false)
        sendEvent(AvailableEvents.displayObject, objectId)
    }

    useEvent(AvailableEvents.endOfGame, (endOfGameResults: EndOfGameResult[]) => {
        currentGameEngine.executeEndOfGame(endOfGameResults)
    })

    return (
        <div>
            <h1>Game Page</h1>

            <button onClick={x => setIsQrOpen(true)}>Identify Objet</button>
            {isQrOpen && <QrCodeReader onTextRead={handleObjectScanned} onClose={() => {
                setIsQrOpen(false)
            }} />}
            <hr />
            <GenericObjectDisplay />
            <ObjectCombinator />

            <TestPage />
        </div>
    )
}