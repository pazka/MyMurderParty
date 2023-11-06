import {QRCodeSVG}  from 'qrcode.react';



export default ({ objectId,name }: { objectId: string,name:string }) => {
    return <div style={{ background: 'white', padding: '16px' }}>
        <QRCodeSVG 
            value={objectId}
        />
        <p>{name}</p>
    </div>
}