import './NewUser.scss';

import { useEffect, useState } from 'react';

import { useGlobalStorage } from '../../services/storageService';
import { login, logout } from '../../services/userService';
import { useStateWithDep } from '../../services/utils';
import { useNavigate } from 'react-router-dom';

export default () => {
    const [storage, setStorage] = useGlobalStorage()
    const [currentUser, setUser] = useStateWithDep<User | null>(storage.currentUser)
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

    const handleLogin = (e: any) => {
        e.preventDefault()

        if (!currentUser) return false;

        login(currentUser)
        return;
    }

    return <div className="section panel" id="new-user-from">
        <p className="clean-font">Welcome ! Who are you ?</p>

        <form onSubmit={(e: any) => e.preventDefault()} id="createuser">
            <input id="username" type="text" placeholder='Your Name' value={currentUser?.name ?? ""} onChange={e => setUser({ ...currentUser ?? {}, name: e.target.value })} />
            <button type='submit' onClick={handleLogin}>That's me !</button>
        </form>


    </div>
}