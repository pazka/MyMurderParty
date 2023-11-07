import { useState } from "react"
import { emitBroadcastTextToRoom } from "../../services/socketService/emits"
import Button from "../Components/common/Button"

export default ()=>{
    const [text, setText] = useState("")

    const handleBroadaCast = ()=>{
        emitBroadcastTextToRoom(text)
    }
    
    return <div>
        <input type="text" value={text} onChange={e=>setText(e.target.value)}/>
        <Button onClick={handleBroadaCast}>Broadcast</Button>
    </div>
}