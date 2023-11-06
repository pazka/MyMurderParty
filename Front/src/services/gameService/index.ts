import { enqueueSnackbar } from 'notistack';
import { getGlobalState, useGlobalStorage } from '../storageService';
import allGameConfigs from './gameConfigs/';
import allEngines from './gameEngines';
import { useEffect, useState } from 'react';

let _currentGameConfig: GameConfig = allGameConfigs['Tutorial Game'];
const _currentGameEngine: GameEngine = allEngines['default'];

export const updateCurrentGameConfigFromRoom = (room: Room | null): void => {
    let storage = getGlobalState();
    const oldRoom: Room | null = storage.currentRoom;

    if (!room) {
        if (oldRoom) { selectCurrentGameConfigByName('Tutorial Game') }
    }

    if (oldRoom?.gameConfigName !== room?.gameConfigName) {
        try {
            selectCurrentGameConfigByName(room?.gameConfigName || 'Tutorial Game');
        } catch (e) {
            enqueueSnackbar("Fatal Error while loading game config. Try refreshing the app.", { variant: "error" });
        }
    }
}

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

export const useGameEngine = (): GameEngine => {
    const [storage] = useGlobalStorage();
    const [engine,setEngine] = useState<GameEngine>(getCurrentGameEngine());

    useEffect(() => {
        setEngine(getCurrentGameEngine());

    }, [storage.currentRoom?.gameConfigName])

    return engine;
}