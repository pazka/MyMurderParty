import AllUsers from "../../UI/Cheats/AllUsers";
import { getGlobalState, setGlobaState } from "../storageService";
import { getAllUsers } from "../userService";
import { TROMBINOSCOPE } from "../gameConfig";
import { isUserInARoom } from "../roomService";
import { emitChooseCharacter } from "../socketService/emits";
import { enqueueSnackbar } from "notistack";

export const getAllCharacters = (): Trombinoscope => {
    return TROMBINOSCOPE;
}

export const getCharacterById = (id: string): Character | null => {
    return TROMBINOSCOPE[id] ?? null;
}

export const chooseCharacter = (characterId: string) => {
    const storage = getGlobalState();
    if (!isUserInARoom()) return;

    let user = { ...storage.currentUser };
    if (!user) return;

    if (!TROMBINOSCOPE[characterId]) {
        return;
    }

    storage.currentUser = user as User;
    emitChooseCharacter(storage.currentRoom?.id as string, characterId)

    setGlobaState(storage);
}