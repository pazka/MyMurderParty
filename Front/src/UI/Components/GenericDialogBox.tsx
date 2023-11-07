import { useState } from "react"
import { useEvent } from "../../services/eventsService"
import { AvailableEvents } from "../../services/eventsService/allAvailableEvents"
import Markdown from "react-markdown"
import Button from "./common/Button"

export default () => {
    const [isOpen, setIsOpen] = useState(false)
    const [message, setMessage] = useState("")
    const [variant, setVariant] = useState<MessageVariant>()

    useEvent(AvailableEvents.displayPopUp, (message : PopUpMessage) => {
        setIsOpen(true)
        setMessage(message.message)
        setVariant(message.variant)
    })

    if (!isOpen) return null

    return <div className={"dialog-box-wrapper"}>
        <div className={"dialog-box-backdrop"}></div>
        <div className={`dialog-box-content background-${variant}`}>
            <Markdown>{message}</Markdown>
            <Button onClick={x => setIsOpen(false)}>Close</Button>
        </div>
    </div>
}