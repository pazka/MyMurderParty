import './ChooseRoom.scss';

import { enqueueSnackbar } from 'notistack';
import { useEffect, useState } from 'react';

import { getAllGamesNames } from '../../services/gameService';
import { getDefaultRoom } from '../../services/roomService';
import { emitDeleteRoom, emitJoinRoom, emitLeaveRoom, emitNewRoomAndJoin } from '../../services/socketService/emits';
import { useGlobalStorage } from '../../services/storageService';
import Select from '../Components/Common/Select';
import { logout } from '../../services/userService';
import { useNavigate } from 'react-router-dom';

export default () => {
    const [storage, setStorage] = useGlobalStorage()
    const [newRoom, setNewRoom] = useState<Room>(getDefaultRoom())
    const [roomId, setRoomId] = useState<string>("")
    const navigate = useNavigate()

    useEffect(() => {

        if (!storage.currentUser) {
            navigate('/new-user')
        }

        if (storage.currentUser && !storage.currentRoom) {
            navigate('/choose-party')
        }

        if (storage.currentUser && storage.currentRoom) {
            navigate('/party/' + storage.currentRoom.id)
        }

    }, [storage.currentUser, storage.currentRoom?.id])
    
    const handleCreateRoom = (e: any) => {
        emitNewRoomAndJoin(newRoom)
        return;
    }

    const handleJoinRoom = (e: any) => {

        if (!isRoomIdValid()) {
            console.log("invalid room id")
            return;
        }

        console.log("letsgo")

        emitJoinRoom(roomId, "")
        return;
    }

    const handleLeaveRoom = () => {
        if (!storage.currentRoom) return;
        emitLeaveRoom(storage.currentRoom.id)
    }

    const handleDeleteRoom = (room: Room) => {
        emitDeleteRoom(room.id, room.password)
    }

    const isRoomIdValid = () => {
        //3Maj 1 dash 3 digits
        return roomId.match(/^[A-Z]{3}-[0-9]{3}$/)
    }

    const handleSetRoomId = (value: string) => {
        //preserve the format which is XXX-DDD
        if (value.length > 3) {
            if (!value.includes("-"))
                value = value.slice(0, 3) + "-" + value.slice(3)
        }

        //remove spaces
        value = value.replace(/\s/g, '')

        //max length is 7
        value = value.slice(0, 7)

        setRoomId(value.toUpperCase())
    }

    const handleLogout = () => {
        logout()
    }

    return <>
        <div className="section panel" >
            <p className="clean-font">Hello {storage.currentUser?.name} !</p>
            <button onClick={handleLogout}>Logout</button>
        </div>

        <form onSubmit={e => e.preventDefault()} className="section panel" id='joinroom'>
            <span style={{ display: "inherit" }}>
                <label id="roomidlabel" htmlFor="roomID" >Room ID</label>
                <input id="roomID" type="text" placeholder='ABC-123' value={roomId} onChange={(e: any) => handleSetRoomId(e.target.value)} />
            </span>
            <button type='submit' disabled={!isRoomIdValid()} onClick={handleJoinRoom}>Join a party</button>
        </form>

        <div className="section panel" >
            <form onSubmit={e => e.preventDefault()} id="createroom" >
                <input form="createroom" id="roomName" type="text" placeholder='Room Name' value={newRoom.name} onChange={(e: any) => setNewRoom({ ...newRoom, name: e.target.value })} />

                <Select value={newRoom.gameConfigName} name="roomGameType" id="gameType" onChange={(e: any) => setNewRoom({ ...newRoom, gameConfigName: e.target.value })}>
                    {getAllGamesNames().map((gameName) => (
                        <option key={gameName} value={gameName}>{gameName}</option>
                    ))}
                </Select>

                <button type='submit' onClick={handleCreateRoom}>Create a party</button>
            </form>

        </div >

    </>
}