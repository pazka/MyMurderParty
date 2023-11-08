import { useEffect, useState } from "react"
import { useGlobalStorage } from "../../services/storageService"
import { emitLogin } from "../../services/socketService/emits"
import { useStateWithDep } from "../../services/utils"
import { login, logout } from "../../services/userService"
import { getCurrentCharacter } from "../../services/characterService"
import Markdown from "react-markdown"


export default () => {
    const [storage, setStorage] = useGlobalStorage()
    const [currentUser, setUser] = useStateWithDep<User | null>(storage.currentUser)
    const [time, setTime] = useState(Date.now())
    const currentCharacter = getCurrentCharacter()

    useEffect(() => {
        const interval = setInterval(() => setTime(Date.now()), 1000);

        return () => {
            clearInterval(interval)
        }
    }, [])

    const handleLogin = async () => {
        if (!currentUser) return;
        login(currentUser)
    }

    const handleLogout = () => {
        logout()
    }

    const getLastActivityTimeString = (user: User) => {
        if (user.lastActivity < 0) return "Inactive"
        const lastActivityTime = new Date(user.lastActivity)
        const now = new Date()
        const delta = now.getTime() - lastActivityTime.getTime()

        //create seconds, minute hours and days ago string given the context
        const seconds = Math.floor(delta / 1000)
        const minutes = Math.floor(seconds / 60)
        const hours = Math.floor(minutes / 60)
        const days = Math.floor(hours / 24)

        if (days > 0) return `${days} days ago`
        if (hours > 0) return `${hours} hours ago`
        if (minutes > 0) return `${minutes} minutes ago`
        if (seconds > 20) return `${seconds} seconds ago`
        return "Active"
    }

    return (
        <div>
            <h2>All Users</h2>
            <div>
                {Object.values(storage.allUsers).map((user) => (
                    <span key={user.id}>{"//"} <b>{user.name}:</b>{user.id} ({getLastActivityTimeString(user)})</span>
                ))}
            </div>
            <h3>current user</h3>
            <div>
                <p>{currentUser?.name}</p>
                <p>{currentCharacter?.name ?? "<No character>"}</p>
                {currentCharacter && <Markdown>{currentCharacter.scenario.public}</Markdown>}
                private scenario : 
                {currentCharacter && <Markdown>{currentCharacter.scenario.private}</Markdown>}
            </div>
            <div>
                <input type="text" value={currentUser?.name ?? ""} onChange={e => setUser({ ...currentUser ?? {}, name: e.target.value })} />
                <button onClick={handleLogin}>Login</button>
                <button onClick={handleLogout}>Logout</button>
            </div>
        </div>
    )
}