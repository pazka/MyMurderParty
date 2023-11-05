import { useState } from "react";
import QrReader from 'react-qr-reader';
import { withErrorCaught } from "../../Utils/WithErrorCaught";
import { useStateWithDep } from "../../services/utils";

export default withErrorCaught(({ open = false }) => {

    const [result, setResult] = useState("");
    const [error, setError] = useState("");
    const [openQr, setOpenQr] = useStateWithDep(open);

    const handleError = (err) => {
        setError(err);
    }
    const handleScan = (data) => {
        if (data) {
            setResult(data);
        }
    }

    try {
        return (
            <>
                <button onClick={x=>setOpenQr(!openQr)}>{openQr ? "close" : "open"} QrCodeReader</button>
                {openQr && <div>
                    <QrReader
                        delay={300}
                        onError={handleError}
                        onScan={handleScan}
                        style={{ width: '20%' }}
                        showViewFinder={false}
                    />
                    <p>{result}</p>
                    <p>{error}</p>
                </div>}
            </>
        )
    } catch (err) {
        setError(err);
    }
})