import {QRCodeSVG}  from 'qrcode.react';



export default ({ objectId }: { objectId: string }) => {
    return <div style={{ background: 'white', padding: '16px' }}>
        <QRCodeSVG 
            value={objectId}
        />
        <p>{objectId}</p>
    </div>
}