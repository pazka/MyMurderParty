import { useState } from "react"
import { useGlobalStorage } from "../../services/storageService"
import { getDefaultRoom, updateCurrentRoom } from "../../services/roomService"
import RoomBroadcast from "./RoomBroadcast"
import currentConfig from "../../services/config"
import { emitDeleteRoom, emitJoinRoom, emitLeaveRoom, emitNewRoom } from "../../services/socketService/emits"
import { spawn } from "child_process"
import { getAllGamesNames } from "../../services/gameService"

export default () => {
    const [storage, setStorage] = useGlobalStorage()
    const users = Object.values(storage.allUsers)
    const [newRoom, setNewRoom] = useState<Room>(getDefaultRoom())

    const userWithCaracters: { [userId: string]: Character } = Object.entries(storage.currentRoom?.characters || {}).reduce((acc, [char, user]) => {
        if (!user) return acc;
        return { ...acc, [user.id]: char }
    }, {})

    const handleCreateRoom = () => {
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

    return (
        <div>
            <h2>All Rooms</h2>
            <div>
                <input type="text" value={newRoom.name} onChange={e => setNewRoom({ ...newRoom, name: e.target.value })} />
                <input type="text" value={newRoom.password} onChange={e => setNewRoom({ ...newRoom, password: e.target.value })} />
                <select value={newRoom.gameConfigName} name="roomGameType" id="gameType" onChange={e => setNewRoom({ ...newRoom, gameConfigName: e.target.value })}>
                    {getAllGamesNames().map((gameName) => (
                        <option key={gameName} value={gameName}>{gameName}</option>
                    ))}
                </select>

                <button onClick={handleCreateRoom}>Create Room</button>
            </div>
            <div>
                {Object.values(storage.allRooms).map((room) => (
                    <div key={room.id} style={{ border: "solid 1px black" }}>
                        <p><b>{room.name}:</b>{room.id} <button onClick={handleJoinRoom(room)}>Join</button> <button onClick={x=>handleDeleteRoom(room)}> delete</button></p>
            <p>currentGame : {room.gameConfigName}</p>
            <ul>
                {Object.values(room.users).map((user) => (
                    <li key={user.id}>{user.id}  </li>
                ))}
            </ul>
        </div>
    ))
}
            </div >
    <div>
        <h2>Current Room <button onClick={handleLeaveRoom}>Leave</button></h2>
        {storage.currentRoom && <div>
            <p><b>{storage.currentRoom.name}:</b>{storage.currentRoom.id}</p>
            <ul>
                {Object.values(storage.usersInRoom).map((user) => (
                    <li key={user.id}>User : {user.name},{userWithCaracters[user.id]?.name ?? ""} </li>
                ))}
            </ul>
            <p>found objects</p>
            <ul>
                {Object.values(storage.currentRoom.objects).map((item) => (
                    <li key={item.id}>{item.name}{JSON.stringify(item)}</li>
                ))}
            </ul>
            <p>characters</p>
            <ul>
                {Object.entries(storage.currentRoom.characters).map(([characterId, user]) => (
                    <li key={user.id}>{characterId} : {JSON.stringify(user)}</li>
                ))}
            </ul>
            <p>history</p>
            <ul>
                {storage.currentRoom.roomHistory.map((item, i) => <span key={i}>{item}</span>)}
            </ul>


            <RoomBroadcast />
        </div>
        }
    </div>
        </div >
    )
}