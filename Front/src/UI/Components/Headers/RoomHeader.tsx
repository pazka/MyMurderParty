import { getCurrentGameConfig } from '../../../services/gameService';
import { useGlobalStorage } from '../../../services/storageService'
import './Headers.scss'

export default () => {
    const [storage] = useGlobalStorage();
    const gameName = getCurrentGameConfig()?.GAME_NAME ?? "Unknown Game"

    return <div className="header panel">
        <span className='small-text'><span className='spacer'/> {storage.currentRoom?.name}</span><b>{'['}{storage.currentRoom?.id}{']'} </b><span className='small-text'>{gameName}</span>
    </div>
}