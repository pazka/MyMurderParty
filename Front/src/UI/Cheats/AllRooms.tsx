import { useState } from "react"
import { useGlobalStorage } from "../../services/storageService"
import { getDefaultRoom } from "../../services/roomService"
import RoomBroadcast from "./RoomBroadcast"
import currentConfig from "../../services/config"
import { emitJoinRoom, emitLeaveRoom, emitNewRoom } from "../../services/socketService/emits"

export default () => {
    const [storage, setStorage] = useGlobalStorage()
    const users = Object.values(storage.allUsers)
    const [newRoom, setNewRoom] = useState<Room>(getDefaultRoom())

    const handleCreateRoom = () => {
        emitNewRoom(newRoom)
    }

    const handleJoinRoom = (room: Room) => (e:any)=> {
        emitJoinRoom(room.id,room.password)
    }

    const handleLeaveRoom = () => {
        if (!storage.currentRoom) return
        emitLeaveRoom(storage.currentRoom.id)
    }

    return (
        <div>
            <h2>All Rooms</h2>
            <div>
                <input type="text" value={newRoom.name} onChange={e => setNewRoom({ ...newRoom, name: e.target.value })} />
                <input type="text" value={newRoom.password} onChange={e => setNewRoom({ ...newRoom, password: e.target.value })} />

                <button onClick={handleCreateRoom}>Create Room</button>
            </div>
            <div>
                {Object.values(storage.allRooms).map((room) => (
                    <div key={room.id} style={{ border: "solid 1px black" }}>
                        <p><b>{room.name}:</b>{room.id} <button onClick={handleJoinRoom(room)}>Join</button></p>
                        <ul>
                            {Object.values(room.usersId).map((userId) => (
                                <li key={userId}>{userId}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
            <div>
                <h2>Current Room <button onClick={handleLeaveRoom}>Leave</button></h2>
                {storage.currentRoom && <div>
                    <p><b>{storage.currentRoom.name}:</b>{storage.currentRoom.id}</p>
                    <ul>
                        {Object.values(storage.usersInRoom).map((user) => (
                            <li key={user.id}>User : {user.name}</li>
                        ))}
                    </ul>
                    <RoomBroadcast />
                </div>
                }
            </div>
        </div>
    )
}