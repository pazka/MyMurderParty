import { useState } from "react"
import { useGlobalStorage } from "../../services/storageService"
import { emitBroadcastTextToRoom } from "../../services/socketService/emits"

export default () => {
    const [storage] = useGlobalStorage()
    const [message, setMessages] = useState<string>("")

    const handleSend = (e: any) => {
        emitBroadcastTextToRoom(message)
        setMessages("")
    }

    return <>
        <div className="log-display">
            <div className="actions panel section">
                <form onSubmit={e => e.preventDefault()}>
                    <textarea placeholder="Communicate..."  value={message} onChange={e => setMessages(e.target.value)} />
                    <button type="submit" onClick={handleSend}>Send</button>
                </form>
            </div>
            <div className="logs">
                {storage.currentRoom?.roomHistory.map((log, i) => <p key={i}>{log}</p>)}
            </div>
        </div>

    </>
}