import { useEffect } from "react"
import { useGlobalStorage } from "../../services/storageService"
import { useNavigate } from "react-router-dom"

export default () => {
    const navigate = useNavigate()
    const [storage] = useGlobalStorage()

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

    return <p>Redirecting to current party</p>
}