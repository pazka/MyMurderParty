import { useNavigate, useParams } from "react-router-dom"
import './CharacterList.scss'
import { getCurrentGameConfig, getCurrentGameEngine, useGameEngine } from "../../services/gameService";
import Markdown from "react-markdown";
import { useGlobalStorage } from "../../services/storageService";
import { sendEvent } from "../../services/eventsService";
import { AvailableEvents } from "../../services/eventsService/allAvailableEvents";
import { emit } from "process";
import { emitChooseCharacter } from "../../services/socketService/emits";
import { useCurrentRoom } from "../../services/roomService";
import { chooseCharacter } from "../../services/characterService";

export default () => {
    const { characterId } = useParams();
    const [storage] = useGlobalStorage();
    const usedCharacters = storage.currentRoom?.characters ?? {};
    const character = getCurrentGameConfig().TROMBINOSCOPE[characterId ?? ""];
    const currentGameEngine = useGameEngine();
    const currenRoom = useCurrentRoom()
    const navigate = useNavigate()
    
    if (!currenRoom) return (<div>Room not found</div>)

    const handleChoose = () => {
        chooseCharacter(character?.id )
        navigate('../scenario')
    }

    if (!character) return (<div>Anonyme <button onClick={handleChoose}>Choisir l'anonymat</button></div>)

    return <div className="">
        <div className="character-page">
            <div className="character-head">
                <div className="char-img-wrapper">
                    <img className="" src={character.imageUrl} />
                </div>
                <h3>{character.name}</h3>
                {usedCharacters[characterId ?? ""] && <h4>Incarné.e par {usedCharacters[characterId ?? ""].name}</h4>}
            </div>
            <div>
                <h3>Scenario</h3>
                <div className="presentation">
                    <Markdown>{character.scenario.public}</Markdown>
                </div>
            </div>

            {!usedCharacters[characterId ?? ""] && <div className="actions">
                <button onClick={handleChoose}>Incarner</button>
            </div>}
        </div>
    </div>
}