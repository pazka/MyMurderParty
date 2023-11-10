import {QRCodeSVG}  from 'qrcode.react';

export default ({ objectId,name }: { objectId: string,name?:string }) => {
    return <div className='qr-code'>
        <QRCodeSVG 
            value={objectId}
        />
        {name && <p>{name}</p>}
    </div>
}