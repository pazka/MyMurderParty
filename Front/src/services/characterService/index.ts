import { getCurrentGameConfig } from '../gameService';
import { isUserInARoom } from '../roomService';
import { emitChooseCharacter } from '../socketService/emits';
import { getGlobalState, setGlobaState } from '../storageService';

export const getAllCharacters = (): Trombinoscope => {
    return getCurrentGameConfig().TROMBINOSCOPE;
}

export const getCharacterById = (id: string): Character | null => {
    return getAllCharacters()[id] ?? null;
}

export const chooseCharacter = (characterId: string) => {
    const storage = getGlobalState();
    if (!isUserInARoom()) return;

    let user = { ...storage.currentUser };
    if (!user) return;

    if (!getAllCharacters()[characterId]) {
        return;
    }

    storage.currentUser = user as User;
    emitChooseCharacter(storage.currentRoom?.id as string, characterId)

    setGlobaState(storage);
}