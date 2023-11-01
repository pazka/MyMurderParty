import { chooseCharacter, getAllCharacters } from "../../services/characterService";

export default () => {
    const allCharacters = getAllCharacters();

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