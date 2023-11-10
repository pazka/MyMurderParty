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

                <h2>Your public scenario</h2>
                <p>You don't have a character</p>
            </>
        }
        return <>
            <h2>Your public scenario</h2>
            <div className="scenario section panel">
                <Markdown>{currentCharacter?.scenario.public}</Markdown>
            </div>
            <hr />
            <h2>Your private scenario</h2>
            {hasPrivateScenario && <>
                <button onClick={() => setDisplayPrivateScenario(!displayPrivateScenario)}>{displayPrivateScenario ? 'Hide' : 'Show'}</button>
                {
                    displayPrivateScenario && <div className="scenario section panel">
                        <Markdown>{currentCharacter?.scenario.private}</Markdown>
                    </div>
                }
            </>
            }{
                !hasPrivateScenario && <div className="scenario section panel secondary">
                    <p>You character doesn't have a private scenario</p>
                </div>
            }
        </>
    }

    return <>
        <h2>Main scenario</h2>
        <div className="scenario section panel ">
            <Markdown>{currentGameConfig?.GAME_DESCRIPTION}</Markdown>
        </div>
        <hr />
        {renderCharacterScenario()}
    </>
}