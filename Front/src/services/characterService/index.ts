import AllUsers from "../../UI/Cheats/AllUsers";
import { getGlobalState, setGlobaState } from "../storageService";
import { getAllUsers } from "../userService";
import allCharacters from "./allCharacters";

export const getAllCharacters = (): Trombinoscope => {
    return allCharacters;
}

export const getAllCharactersWithUser = (): { [characterId: string]: { character: Character, user: User } } => {
    const allUsers = getAllUsers();
    const allCharacters = getAllCharacters();
    const allCharactersWithUser: { [charId: string]: { character: Character, user: User } } = {};
    
    allUsers.forEach((user) => {
        if(!user.choosenCharacterId){
            return;
        }
        const character = allCharacters[user.choosenCharacterId];
        allCharactersWithUser[user.choosenCharacterId] = { character, user };
    });

    return allCharactersWithUser;
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