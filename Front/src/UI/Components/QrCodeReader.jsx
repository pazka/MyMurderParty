import { useState } from "react";
import QrReader from 'react-qr-reader';
import { withErrorCaught } from "../../Utils/WithErrorCaught";

export default withErrorCaught(() => {

    const [result, setResult] = useState("");
    const [error, setError] = useState("");

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
                <QrReader
                    delay={300}
                    onError={handleError}
                    onScan={handleScan}
                    style={{ width: '20%' }}
                    showViewFinder={false}
                />
                <p>{result}</p>
                <p>{error}</p>
            </>
        )
    } catch (err) {
        setError(err);
    }
})