import { enqueueSnackbar } from "notistack"
import { getCurrentGameConfig, getCurrentGameEngine } from "../../services/gameService"
import { useGlobalStorage } from "../../services/storageService"
import { getCurrentCharacter } from "../../services/characterService"
import Markdown from "react-markdown"

export default ({ objectId }: { objectId: string }) => {
    const [storage, setStorage] = useGlobalStorage()
    const currentRoom = storage.currentRoom as Room
    const currentGameEngine = getCurrentGameEngine()
    if (!currentRoom) {
        enqueueSnackbar("No Room to display", { variant: "error" })
        return null
    }

    const object : InventoryItem|null= currentGameEngine.seeAnObject(objectId)

    if (!object) {
        return <p>Nothing</p>
    }

    return <div>
        <h1>{object.name}</h1>
        <Markdown>{object.description}</Markdown>
        {object.canBeTaken && <button onClick={() => {
            currentGameEngine.takesAnObject(objectId)
        }}>Take Object</button>}
        {object.canBeShared && <button onClick={() => {
            currentGameEngine.shareAnObject(objectId)
        }}>Share the Object</button>}
    </div>
}