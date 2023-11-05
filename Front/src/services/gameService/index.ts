import allGameConfigs from './gameConfigs/';

let _currentGameConfig : GameConfig = allGameConfigs['Tutorial Game'];

export function setCurrentGameConfig(gameConfig : GameConfig){
    _currentGameConfig = gameConfig;
}
export function selectCurrentGameConfigByName(gameConfigName : string){
    const newGameConfig = (allGameConfigs as any)[gameConfigName];

    if(!newGameConfig){
        throw new Error(`Game config ${gameConfigName} not found`);
    }

    _currentGameConfig = newGameConfig;
}

export function getCurrentGameConfig() : GameConfig{
    return _currentGameConfig;
}

export function getAllGamesNames() : string[]{
    return Object.keys(allGameConfigs);
}