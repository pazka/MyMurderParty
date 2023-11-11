import { useState } from "react"
import { emitBroadcastTextToRoom } from "../../services/socketService/emits"


export default ()=>{
    const [text, setText] = useState("")

    const handleBroadaCast = ()=>{
        emitBroadcastTextToRoom({message : text})
    }
    
    return <div>
        <input type="text" value={text} onChange={e=>setText(e.target.value)}/>
        <button onClick={handleBroadaCast}>Broadcast</button>
    </div>
}