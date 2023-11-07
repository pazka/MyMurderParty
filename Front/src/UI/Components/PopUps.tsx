
import { useEvent } from "../../services/eventsService"
import { AvailableEvents } from "../../services/eventsService/allAvailableEvents"
import Markdown from "react-markdown"
import Button from "./common/Button"
import '../Components/PopUps.scss'
import { useState } from "react"

export default () => {
    const [openedPopUps, setOpenedPopUps] = useState<{ [id: string]: PopUpMessage }>({})

    useEvent(AvailableEvents.displayPopUp, (popUpMessage: PopUpMessage) => {
        setOpenedPopUps((x: any) => ({ ...x, [Math.ceil(Math.random() * 999999999)]: popUpMessage }))
    })

    const handleClosePopUp = (id: string) => {
        setOpenedPopUps(x => {
            const newState = { ...x }
            delete newState[id]
            return newState
        })
    }

    if (Object.keys(openedPopUps).length == 0) return null

    return <>
        {
            Object.entries(openedPopUps).map(([id, popUpMessage]) => (
                <div className={"dialog-box-wrapper"}>
                    <div className={"dialog-box-backdrop"}></div>
                    <div className={`dialog-box-body ${popUpMessage.variant}`}>
                        <div className={`dialog-box-content`}>
                            <Markdown>{popUpMessage.message}</Markdown>
                        </div>
                        <div className={`dialog-box-actions`}>
                            {!popUpMessage.cancelCallback && <Button variant="primary" onClick={x => handleClosePopUp(id)}>Close</Button>}
                            {popUpMessage.cancelCallback && <Button variant="secondary" onClick={x => { handleClosePopUp(id); popUpMessage.cancelCallback?.() }}>Cancel</Button>}
                            {popUpMessage.confirmCallback && <Button variant="primary" onClick={x => { handleClosePopUp(id); popUpMessage.confirmCallback?.() }}>Confirm</Button>}
                        </div>
                    </div>
                </div>))
        }
    </>
}