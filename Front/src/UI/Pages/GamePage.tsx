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
    const currentGameEngine = useGameEngine()

    useEvent(AvailableEvents.endQrScan, (objectId: string) => {
        sendEvent(AvailableEvents.displayObject, objectId)
    })

    useEvent(AvailableEvents.endOfGame, (endOfGameResults: EndOfGameResult[]) => {
        currentGameEngine.executeEndOfGame(endOfGameResults)
    })

    return (
        <div>
            <h1>Game Page</h1>
            <GenericObjectDisplay />
            <ObjectCombinator />

            <TestPage />
        </div>
    )
}