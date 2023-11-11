import * as exampleGame from './exampleGame';
import * as VaticantGame from './VaticantGame';

const allConfigs : { [id: string]: GameConfig } = {
    [VaticantGame.GAME_NAME] : VaticantGame,
    [exampleGame.GAME_NAME] : exampleGame
}

export default allConfigs;