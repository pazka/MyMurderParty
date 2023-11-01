import { useState } from "react"
import { useGlobalStorage } from "../../services/storageService"
import { emitWhoAmI } from "../../services/socketService/emits"
import { useStateWithDep } from "../../services/utils"

export default () => {
    const [storage, setStorage] = useGlobalStorage()
    const [user, setUser] = useStateWithDep<User>(storage.currentUser)

    const sendLogin = async () => {
        emitWhoAmI(user)
    }
    
    return (
        <div>
            <h2>All Users</h2>
            <div>
                {storage.allUsers.map((user) => (
                    <span key={user.id}>{user.id}:{user.name}</span>
                ))}
            </div>
            <h3>current user</h3>
            <div>
                {JSON.stringify(storage.currentUser)}
            </div>
            <div>
                <input type="text" value={user?.name ?? ""} onChange={e => setUser({ ...user ?? {}, name: e.target.value })} />
                <button onClick={sendLogin}>Login</button>
            </div>
        </div>
    )
}