import '../Components/PopUps.scss';

import { useState } from 'react';
import Markdown from 'react-markdown';

import { useEvent } from '../../services/eventsService';
import { AvailableEvents } from '../../services/eventsService/allAvailableEvents';


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

    const icons: { [variant: string]: string } = {
        "success": "✅",
        "error": "❌",
        "info": "🔎",
        "warning": "⚠️",
        "magic": "✨",
        "primary": "",
        "secondary": "",
    }

    if (Object.keys(openedPopUps).length == 0) return null

    return <>
        {
            Object.entries(openedPopUps).map(([id, popUpMessage]) => (
                <div className={"dialog-box-wrapper"}>
                    <div className={"dialog-box-backdrop"}></div>
                    <div className={`dialog-box-body ${popUpMessage.variant}`}>
                    <div className="dialog-box-icon-wrapper">
                        <div className="dialog-box-icon-content">
                            <span>{icons[popUpMessage.variant] ?? ""}</span>
                        </div>
                    </div>
                        <div className={`dialog-box-content`}>
                            <Markdown>{popUpMessage.message}</Markdown>
                        </div>
                        <div className={`dialog-box-actions`}>
                            {!popUpMessage.cancelCallback && <button  onClick={x => handleClosePopUp(id)}>Close</button>}
                            {popUpMessage.cancelCallback && <button className="secondary" onClick={x => { handleClosePopUp(id); popUpMessage.cancelCallback?.() }}>Cancel</button>}
                            {popUpMessage.confirmCallback && <button  onClick={x => { handleClosePopUp(id); popUpMessage.confirmCallback?.() }}>Confirm</button>}
                        </div>
                    </div>
                </div >
            ))
        }
    </>
}