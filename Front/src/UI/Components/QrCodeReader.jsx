import { useState } from "react";
import QrReader from 'react-qr-reader';
import { withErrorCaught } from "../../Utils/WithErrorCaught";
import { useStateWithDep } from "../../services/utils";

export default withErrorCaught(({ open = false }) => {

    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [openQr, setOpenQr] = useStateWithDep(open);

    const handleError = (err) => {
        setError(err);
    }
    const handleScan = (data) => {
        setLoading(false);
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
                        onLoad={x=>setLoading(true)}
                        style={{ width: '100%' }}
                        showViewFinder={false}
                    />
                    {loading && <p>loading...</p>}
                    <p>{result}</p>
                    <p>{error}</p>
                </div>}
            </>
        )
    } catch (err) {
        setError(err);
    }
})