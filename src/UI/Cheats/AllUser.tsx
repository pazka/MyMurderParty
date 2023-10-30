import { getFullCharacterList } from "../../services/characterService";

export const AllCharacters = () => {
    const allCharacters = getFullCharacterList();

    return (
        <div>
            <h1>Test inventory no keys</h1>
            <ul>
                {Object.values(allCharacters).map((character : Character) => (
                    <li >{character.name} </li>
                ))}
            </ul>
        </div>
    )
}