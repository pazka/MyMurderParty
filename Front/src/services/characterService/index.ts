import { getGlobalState, setGlobaState } from "../storageService";
import allCharacters from "./allCharacters";

export const getAllCharacters = (): Trombinoscope => {
    return allCharacters;
}

export const getAllCharactersWithUser = (): { [charId: string]: { character: Character, user: User } } => {
    const allUsers = Object.values(allCharacters);
    const allCharactersWithUser: { [charId: string]: { character: Character, user: User } } = {};

    return allUsers.reduce((acc, user) => {
        acc[user.id] = { character: user, user };
        return acc;
    }, allCharactersWithUser);
}

export const getCharacterById = (id: string): Character | null => {
    return allCharacters[id] ?? null;
}

export const chooseCharacter = (characterId: string) => {
    const storage = getGlobalState();
    let user = {...storage.currentUser};
    if(!user) return;

    user.choosenCharacterId = characterId;
    storage.currentUser = user as User;
    
    setGlobaState(storage);
}