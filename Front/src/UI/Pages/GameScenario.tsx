import { useState } from "react"
import { useCurrentCharacter, useGameConfig } from "../../services/characterService"
import Markdown from "react-markdown"

export default () => {
    const [displayPrivateScenario, setDisplayPrivateScenario] = useState<boolean>(false)
    const currentGameConfig = useGameConfig()
    const currentCharacter = useCurrentCharacter()
    const hasPrivateScenario = currentCharacter?.scenario.private !== undefined && currentCharacter?.scenario.private !== null && currentCharacter?.scenario.private.trim() !== ""

    const renderCharacterScenario = () => {
        if (!currentCharacter) {
            return <>
                <h2>Votre scenario officiel</h2>
                <p>Vous n'avez pas de scenario</p>
            </>
        }
        return <>
            <h2>Votre scenario officiel</h2>
            <div className="section panel">
                <Markdown>{currentCharacter?.scenario.public}</Markdown>
            </div>
            <hr />
            <h2>Votre scenario caché</h2>
            {hasPrivateScenario && <>
                <button onClick={() => setDisplayPrivateScenario(!displayPrivateScenario)}>{displayPrivateScenario ? 'Hide' : 'Show'}</button>
                {
                    displayPrivateScenario && <div className="section panel secondary">
                        <Markdown>{currentCharacter?.scenario.private}</Markdown>
                    </div>
                }
            </>
            }{
                !hasPrivateScenario && <div className=" section  panel secondary">
                    <p>Votre personnage n'a pas de scenario privé</p>
                </div>
            }
        </>
    }

    return <>
        <div className="scenarios">
            <h2>Scenario du jeu</h2>
            <div className="scenario section panel ">
                <Markdown>{currentGameConfig?.GAME_DESCRIPTION}</Markdown>
            </div>
            <hr />
            {renderCharacterScenario()}
        </div>
    </>
}