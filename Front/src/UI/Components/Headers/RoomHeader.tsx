import { useNavigate } from 'react-router-dom';
import { getCurrentGameConfig } from '../../../services/gameService';
import { emitLogout } from '../../../services/socketService/emits';
import { useGlobalStorage } from '../../../services/storageService'
import { logout } from '../../../services/userService';
import './Headers.scss'

export default () => {
    const [storage] = useGlobalStorage();
    const gameName = getCurrentGameConfig()?.GAME_NAME ?? "Unknown Game"
    const navigate = useNavigate()

    const handleLogout = () => {
        navigate('/new-user')
        logout()
    }

    return <div className="header-small panel">
        <span className='small-text'>{storage.currentRoom?.name}</span>
        <button className='logout' onClick={handleLogout}>Logout</button>
        <span className='spacer' />
        <b><span className="clean-font">{'['}{storage.currentRoom?.id}{']'} </span></b>
        <span className='small-text'>{gameName}</span>
    </div>
}