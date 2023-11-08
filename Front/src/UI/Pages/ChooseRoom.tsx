import { useState } from "react"
import { useGlobalStorage } from "../../services/storageService"
import { getDefaultRoom } from "../../services/roomService"
import { emitDeleteRoom, emitJoinRoom, emitLeaveRoom, emitNewRoom } from "../../services/socketService/emits"
import { getAllGamesNames } from "../../services/gameService"

export default () => {
    const [storage, setStorage] = useGlobalStorage()
    const [newRoom, setNewRoom] = useState<Room>(getDefaultRoom())
    const [roomId, setRoomId] = useState<string>("")

    const handleCreateRoom = (e: any) => {
        e.preventDefault()
        emitNewRoom(newRoom)
    }

    const handleJoinRoom = (room: Room) => (e: any) => {
        emitJoinRoom(room.id, room.password)
    }

    const handleLeaveRoom = () => {
        if (!storage.currentRoom) return;
        emitLeaveRoom(storage.currentRoom.id)
    }

    const handleDeleteRoom = (room: Room) => {
        emitDeleteRoom(room.id, room.password)
    }

    const isRoomIdValid = ()=>{
        //3Maj 1 dash 3 digits
        return roomId.match(/^[A-Z]{3}-[0-9]{3}$/)
    }

    return <>
        <div className="section panel" >
            <p className="clean-font">Hello {storage.currentUser?.name} !</p>

        </div>

        <div className="section panel" >
            <span style={{ display: "inherit" }}>
                <label htmlFor="roomID" >Room ID</label>
                <input id="roomID" type="text" placeholder='XXX-DDD' value={roomId} onChange={e => setRoomId(e.target.value)} />
            </span>
            <button type='submit' disabled={!isRoomIdValid()}>Join a party</button>
        </div>

        <div className="section panel" >
            <form onSubmit={handleCreateRoom}>
                <input id="roomName" type="text" placeholder='Room Name' value={newRoom.name} onChange={e => setNewRoom({ ...newRoom, name: e.target.value })} />
                <select value={newRoom.gameConfigName} name="roomGameType" id="gameType" onChange={e => setNewRoom({ ...newRoom, gameConfigName: e.target.value })}>
                    {getAllGamesNames().map((gameName) => (
                        <option key={gameName} value={gameName}>{gameName}</option>
                    ))}
                </select>
                <button type='submit'>Create a party</button>
            </form>

        </div>

    </>
}