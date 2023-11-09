import { useState } from "react";
import QrReader from 'react-qr-reader';
import { withErrorCaught } from "../../Utils/WithErrorCaught";
import { useStateWithDep } from "../../services/utils";
import { enqueueSnackbar } from "notistack";
import currentConfig from "../../services/config";
import magnifyingGlass from './../../images/magnifying-glass.png'

import './QrCode.scss';
import { sendEvent, useEvent } from "../../services/eventsService";
import { AvailableEvents } from "../../services/eventsService/allAvailableEvents";

export default () => {
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    useEvent(AvailableEvents.beginQrScan, x => {
        setLoading(true)
        setOpen(true)
    })

    const handleError = (err) => {
        enqueueSnackbar(err, { variant: "error" });
    }

    const handleScan = (data) => {
        if (!data)
            return;

        setLoading(false);
        setOpen(false);
        sendEvent(AvailableEvents.endQrScan, data)
    }

    if (!open)
        return null

    try {
        return (
            <>
                <div className="qrreader-wrapper" onClick={x => {
                    setOpen(false)
                }}>
                    <div className="qrreader-body">
                        <img src={magnifyingGlass} alt="" />
                        <div className="qrreader-camera">
                            <div className="qr-viewfinder-wrapper">
                                <div></div>
                            </div>
                            <QrReader
                                delay={300}
                                onError={handleError}
                                onScan={handleScan}
                                onLoad={x => setLoading(true)}
                                style={{ width: '100%' }}
                                showViewFinder={false}
                            />
                        </div>
                    </div>
                </div>
            </>
        )
    } catch (err) {
        return <p>An error occured</p>;
        handleError(err);
    }
}