import { getCurrentGameConfig } from '../../../services/gameService';
import { useGlobalStorage } from '../../../services/storageService'
import './Headers.scss'

export default () => {
    const [storage] = useGlobalStorage();
    const gameName = getCurrentGameConfig()?.GAME_NAME ?? "Unknown Game"

    return <div className="header-small panel">
        <span className='small-text'>{storage.currentRoom?.name}</span>
        <span className='spacer'/> 
        <b><span className="clean-font">{'['}{storage.currentRoom?.id}{']'} </span></b>
        <span className='small-text'>{gameName}</span>
    </div>
}