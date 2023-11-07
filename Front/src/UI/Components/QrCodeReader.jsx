import { useState } from "react";
import QrReader from 'react-qr-reader';
import { withErrorCaught } from "../../Utils/WithErrorCaught";
import { useStateWithDep } from "../../services/utils";
import { enqueueSnackbar } from "notistack";
import currentConfig from "../../services/config";
import Button from "../Components/common/Button"

export default ({ onTextRead, onClose }) => {
    const [loading, setLoading] = useState(false);

    const handleError = (err) => {
        enqueueSnackbar(err, { variant: "error" });
    }

    const handleScan = (data) => {
        if(!data)
            return ;

        setLoading(false);
        onTextRead && onTextRead(data)
    }

    try {
        return (
            <>
                <div className="qrreader-wrapper">
                    <Button className="qrreader-close" onClick={x => {
                        console.log("putain");
                        onClose && onClose()
                    }}>X</Button>
                    {loading && <div>Loading...</div>}
                    <div className="qrreader-body">
                        <div className="qrreader-camera">
                            <QrReader
                                delay={300}
                                onError={handleError}
                                onScan={handleScan}
                                onLoad={x => setLoading(true)}
                                style={{ width: '100%' }}
                                showViewFinder={true}
                            />
                            <div className="qr-viewfinder"></div>
                        </div>
                    </div>
                    <div>
                    </div>
                </div>
            </>
        )
    } catch (err) {
        return <p>An error occured</p>;
        handleError(err);
    }
}