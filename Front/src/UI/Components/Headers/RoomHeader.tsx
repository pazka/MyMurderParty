import { useGlobalStorage } from '../../../services/storageService'
import './Headers.scss'

export default () => {
    const [storage] = useGlobalStorage();
    
    return <div className="header panel">
        <h2>{storage.currentRoom?.name}{'<'}{storage.currentRoom?.id}{'>'}</h2>
    </div>
}