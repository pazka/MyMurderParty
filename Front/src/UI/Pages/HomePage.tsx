import { useGlobalStorage } from "../../services/storageService"

export default () => {
    const [storage] = useGlobalStorage()
    
    return <div>
        Hello I'm home page
    </div>
}