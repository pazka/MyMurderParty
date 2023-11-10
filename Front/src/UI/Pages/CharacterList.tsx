import { useState } from "react"
import { getAllCharacters } from "../../services/characterService"
import CharacterMiniature from "../Components/Common/CharacterMiniature"
import './CharacterList.scss'
import { useNavigate } from "react-router-dom"

export default () => {
    const [currentCharacter, setCurrentCharacter] = useState<Character | undefined>(undefined)
    const allCharacters = getAllCharacters()
    const navigate = useNavigate()

    return <>
        <div className="character-list-wrapper ">
            <div className="frame">
                {Object.values(allCharacters).map((c: Character, i) => (
                    <CharacterMiniature charId={c.id} key={i} onClick={()=>navigate(c.id)} />
                ))}
                <CharacterMiniature charId={"SOMEONE"} key={"s"}onClick={()=>navigate("Nobody")} />
            </div>
        </div>
    </>
}