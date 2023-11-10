import './ObjectDetailPage.scss';

import { useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import { useNavigate, useParams } from 'react-router-dom';

import { sendEvent } from '../../services/eventsService';
import { AvailableEvents } from '../../services/eventsService/allAvailableEvents';
import { getCurrentGameEngine } from '../../services/gameService';
import { getFullyProcessedItem } from '../../services/inventoryService';
import { useGlobalStorage } from '../../services/storageService';
import ObjectQrCode from '../Components/Common/ObjectQrCode';

export default () => {
    const { objectId } = useParams();
    const [storage] = useGlobalStorage();
    const currentGameEngine = getCurrentGameEngine();
    const navigate = useNavigate()

    if (!objectId) {
        return <p>Object Id not found</p>
    }
    
    const item = getFullyProcessedItem(objectId ?? "", true);

    useEffect(() => {

        if (!item) {
            sendEvent(AvailableEvents.displayObject, null)
        }

        getFullyProcessedItem(objectId, !(item?.canBeTaken || !item?.isOpenForTaking));
    }, [objectId])

    if (!item) {
        return <p>Rien à afficher, l'object a été pris par quelqu'un d'autre</p>
    }

    //for the message if there is any

    return <div className="object-detail-wrapper">
        <div className="object-detail-head section panel ">
            <h3>{item?.name}</h3>
            {item.isOpenForTaking && !item.canBeTaken && <ObjectQrCode objectId={item.id} name="" />}
            {(item.canBeTaken || !item.isOpenForTaking) && <img src={item?.imageUrl} alt={item?.name + " thumbnail"} />}
        </div>
        <div className="section panel scenario">
            <Markdown>{item?.description}</Markdown>
        </div>
        <div className="actions">
            {item.canBeTaken && <button className={"object"} onClick={() => {
                sendEvent(AvailableEvents.displayObject, null)
                currentGameEngine.takesAnObject(item.id)
            }}>Prendre</button>}

            {item.canBeShared && !item.isOpenForTaking && <button className={"object"} onClick={() => {
                currentGameEngine.shareAnObject(item.id)
            }}>Partager</button>}

            {item.canBeShared && item.isOpenForTaking && <button className={"object-dark"} onClick={() => {
                currentGameEngine.stopSharingAnObject(item.id)
            }}>Garder</button>}

            {currentGameEngine.isObjectUsableAlone(item.id) && <button className={"object"} onClick={() => {
                sendEvent(AvailableEvents.displayObject, null)
                currentGameEngine.useObjects([item])
            }}>Activer</button>}

            {currentGameEngine.isObjectUsableWithAnotherObject(item.id) && <button className={"object secondary"} onClick={() => {
                navigate('./combine')
            }}>Utiliser sur un autre object</button>}

            <button onClick={x => sendEvent(AvailableEvents.displayObject, null)}>Close</button>
        </div>
    </div>
}