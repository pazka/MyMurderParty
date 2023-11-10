import { useEffect, useState } from 'react';
import { getCurrentGameConfig } from '../gameService';
import { isUserInARoom } from '../roomService';
import { emitChooseCharacter } from '../socketService/emits';
import { getGlobalState, setGlobaState, useGlobalStorage } from '../storageService';

export const getAllCharacters = (): Trombinoscope => {
    return getCurrentGameConfig().TROMBINOSCOPE;
}

export const useGameConfig = () :GameConfig=> {
    const [storage] = useGlobalStorage();
    const [gameConfig,setGameConfig] = useState<GameConfig>(getCurrentGameConfig());

    useEffect(() => {
        setGameConfig(getCurrentGameConfig());
    }, [storage.currentRoom?.gameConfigName])

    return gameConfig;
}

export const getCharacterById = (id: string): Character | null => {
    return getAllCharacters()[id] ?? null;
}

export const chooseCharacter = (characterId: string) => {
    const storage = getGlobalState();
    if (!isUserInARoom()) return;

    let user = { ...storage.currentUser };
    if (!user) {
        console.error("No user found");
        return;
    }

    storage.currentUser = user as User;
    emitChooseCharacter(storage.currentRoom?.id as string, characterId)

    setGlobaState(storage);
}

export const usersIdWithCharacterInRoom = (): { [userId: string]: Character } => {
    const storage = getGlobalState();
    const allCharacters = getAllCharacters();

    const usersWithCharacter = Object.entries(storage.currentRoom?.characters ?? {}).reduce((acc: { [userId: string]: Character }, [characterId, user]) => {
        const character = allCharacters[characterId];
        if (character) {
            acc[user.id] = character;
        }
        return acc;
    }, {});

    return usersWithCharacter;
}

export const getCurrentCharacter = (): Character | null => {
    const storage = getGlobalState();
    if (!storage.currentUser) return null;

    const usersWithCharacter = usersIdWithCharacterInRoom();
    return usersWithCharacter[storage.currentUser.id] ?? null;
}

export const useCurrentCharacter = (): Character | null => {
    const [storage] = useGlobalStorage();
    const [currentCharacter, setCurrentCharacter] = useState<Character | null>(getCurrentCharacter());

    useEffect(() => {
        setCurrentCharacter(getCurrentCharacter());
    }, [storage.currentRoom?.characters])

    return currentCharacter;
}