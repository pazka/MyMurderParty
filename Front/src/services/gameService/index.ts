import allGameConfigs from './gameConfigs/';
import allEngines from './gameEngines';

let _currentGameConfig: GameConfig = allGameConfigs['Tutorial Game'];
const _currentGameEngine: GameEngine = allEngines['default'];

export const setCurrentGameConfig = (gameConfig: GameConfig) => {
    _currentGameConfig = gameConfig;
}
export const selectCurrentGameConfigByName = (gameConfigName: string) => {
    const newGameConfig = (allGameConfigs as any)[gameConfigName];

    if (!newGameConfig) {
        throw new Error(`Game config ${gameConfigName} not found`);
    }

    _currentGameConfig = newGameConfig;
}

export const getCurrentGameConfig = (): GameConfig => {
    return _currentGameConfig;
}

export const getAllGamesNames = (): string[] => {
    return Object.keys(allGameConfigs);
}

export const getCurrentGameEngine = (): GameEngine => {
    return _currentGameEngine;
}