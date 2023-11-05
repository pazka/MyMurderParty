import allGameConfigs from './gameConfigs/';

let _currentGameConfig : GameConfig = allGameConfigs.exampleGame;

export function selectAnotherGameConfig(gameConfig : GameConfig){
    _currentGameConfig = gameConfig;
}

export function getCurrentGameConfig() : GameConfig{
    return _currentGameConfig;
}