import { chooseCharacter, getAllCharacters, useGameConfig } from "../../services/characterService";
import { useGlobalStorage } from "../../services/storageService";
;

export default () => {
    const [storage, setStorage] = useGlobalStorage()
    const allCharacters = useGameConfig().TROMBINOSCOPE;

    return (
        <div>
            <h1>All characters</h1>
            <ul>
                {Object.values(allCharacters).map((character: Character) => (
                    <li >{character.name} <button onClick={x => chooseCharacter(character.id)}>Choose</button></li>
                ))}
            </ul>
        </div>
    )
}