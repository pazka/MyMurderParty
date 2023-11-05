import { useState } from "react"
import QrCodeReader from "../Components/QrCodeReader"
import { TestPage } from "./TestPage"
import { sendEvent } from "../../services/eventsService"
import { getCurrentGameConfig } from "../../services/gameService"
import { AvailableEvents } from "../../services/eventsService/allAvailableEvents"
import GenericObjectDisplay from "./GenericObjectDisplay"

export default () => {
    const [isQrOpen, setIsQrOpen] = useState(false)

    const handleObjectScanned = (objectId: string) => {
        setIsQrOpen(false)
        sendEvent(AvailableEvents.displayObject, objectId)
    }

    return (
        <div>
            <h1>Game Page</h1>

            <button onClick={x => setIsQrOpen(true)}>Identify Objet</button>
            {isQrOpen && <QrCodeReader onTextRead={handleObjectScanned} onClose={() => {
                setIsQrOpen(false)
            }} />}
            <hr />
            <GenericObjectDisplay />

            <TestPage />
        </div>
    )
}