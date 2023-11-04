import { useState } from "react"
import { useGlobalStorage } from "../../services/storageService"
import { getDefaultRoom } from "../../services/roomService"

export default () => {
    const [storage, setStorage] = useGlobalStorage()
    const users = Object.values(storage.allUsers)
    const [newRoom, setNewRoom] = useState<Room>(getDefaultRoom())

    const handleCreateRoom = () => {
    }

    const handleJoinRoom = (room: Room) => {
    }

    const handleLeaveRoom = () => {
    }

    return (
        <div>
            <h2>All Rooms</h2>
            <div>
                {Object.values(storage.allRooms).map((room) => (
                    <div key={room.id} style={{ border: "solid 1px black" }}>{"//"}
                        <p><b>{room.name}:</b>{room.id} <button></button></p>
                        <ul>
                            {Object.values(room.usersId).map((userId) => (
                                <li key={userId}>{userId}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
            <div>
                <h2>Current Room</h2>
                {storage.currentRoom && <div>
                    <p><b>{storage.currentRoom.name}:</b>{storage.currentRoom.id}</p>
                    <ul>
                        {Object.values(storage.currentRoom.usersId).map((userId) => (
                            <li key={userId}>{userId}</li>
                        ))}
                    </ul>
                    <ul>
                        {Object.values(storage.usersInRoom).map((user) => (
                            <li key={user.id}>{user.name}</li>
                        ))}
                    </ul>
                </div>
                }
            </div>
        </div>
    )
}