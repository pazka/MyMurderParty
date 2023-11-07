import { chooseCharacter, getAllCharacters, useGameConfig } from "../../services/characterService";
import { useGlobalStorage } from "../../services/storageService";
import Button from "../Components/common/Button";

export default () => {
    const [storage, setStorage] = useGlobalStorage()
    const allCharacters = useGameConfig().TROMBINOSCOPE;

    return (
        <div>
            <h1>All characters</h1>
            <ul>
                {Object.values(allCharacters).map((character: Character) => (
                    <li >{character.name} <Button onClick={x => chooseCharacter(character.id)}>Choose</Button></li>
                ))}
            </ul>
        </div>
    )
}