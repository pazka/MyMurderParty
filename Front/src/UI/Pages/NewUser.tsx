import './NewUser.scss';

import { useState } from 'react';

import { useGlobalStorage } from '../../services/storageService';
import { login, logout } from '../../services/userService';
import { useStateWithDep } from '../../services/utils';

export default () => {
    const [storage, setStorage] = useGlobalStorage()
    const [currentUser, setUser] = useStateWithDep<User | null>(storage.currentUser)

    const handleLogin = (e: any) => {
        e.preventDefault()

        if (!currentUser) return;
        login(currentUser)
        return;
    }

    const handleLogout = () => {
        logout()
    }

    return <div className="section panel" id="new-user-from">
        <p className="clean-font">Welcome ! Who are you ?</p>

        <form onSubmit={handleLogin}>
            <input id="username" type="text" placeholder='Your Name' value={currentUser?.name ?? ""} onChange={e => setUser({ ...currentUser ?? {}, name: e.target.value })} />
            <button type='submit'>That's me !</button>
        </form>


    </div>
}