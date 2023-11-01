import config from "../config";
import { getGlobalState, setGlobaState } from "../storageService";

export const fetchAllRooms = async () => {
    const response = await fetch(config.host + "/rooms");
    const allRooms = await response.json();

    let storage = getGlobalState();
    storage.allRooms = allRooms;
    setGlobaState(storage);
}