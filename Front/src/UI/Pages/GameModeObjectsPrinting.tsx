import { get } from "http";
import { useRef, useState } from "react";
import allConfigs from "../../services/gameService/gameConfigs";
import ObjectQrCode from "../Components/Common/ObjectQrCode";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import ts from "typescript";

export default () => {
    let params = useParams();
    const navigate = useNavigate();
    const [cheatMode, setCheatMode] = useState(false);
    const gameconfig = allConfigs[params.gamemodeName || "default"];
    const ref = useRef<HTMLDivElement>();
    const handlePrint = useReactToPrint({
        //@ts-ignore
        content: () => ref.current,
    });

    if (!gameconfig) return <div className="full-page-debug">
        <p>Pick a gamemode : </p>
        <ul>
            {Object.keys(allConfigs).map((gamemodeName, i) => (
                <li key={i}><Link to={`/objects/${gamemodeName}`}>{gamemodeName}</Link></li>
            ))}
        </ul>


    </div>

    //@ts-ignore
    return <div ref={ref} className="full-page-debug" >
        <p>PLease print out those QrCode because you will need to place them in your play space to start the game.</p>
        <p>The rest of the object will be obtain from playing, the game, no need to print execpt for test purposes</p>
        <button onClick={x => setCheatMode(!cheatMode)}>Add the non-necessary item to the page</button>
        <button onClick={handlePrint}>PRINT THE QR CODES</button>
        <button onClick={x=> navigate('/')} >Return to the game</button>
        <h2>Mandatory to print items</h2>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
            {
                Object.values(gameconfig.FULL_INVENTORY).filter(o => o.toPrintIrl).map((item: InventoryItem, i: number) => (
                    <ObjectQrCode key={i} objectId={item.id} name={item.name} />
                ))
            }
        </div>
        <hr />
        <h2>Not-mandatory to print items</h2>
        {
            cheatMode && <div style={{ display: "flex", maxWidth: "100vw" }}>
                {Object.values(gameconfig.FULL_INVENTORY).filter(o => !o.toPrintIrl).map((item: InventoryItem, i: number) => (
                    <ObjectQrCode key={i} objectId={item.id} name={item.name} />
                ))}
            </div>
        }
    </div>
}