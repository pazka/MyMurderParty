import * as exampleGame from './exampleGame';
import * as exampleGame2 from './exampleGame2';

const allConfigs : { [id: string]: GameConfig } = {
    [exampleGame.GAME_NAME] : exampleGame,
    [exampleGame2.GAME_NAME] : exampleGame2
}

export default allConfigs;