import config from "../config";
import restService from "../restService";
import { getGlobalState, setGlobaState } from "../storageService";

export const fetchAllRooms = async () => {
    const response = await restService(config.host + "/rooms");
    const allRooms = await response.json();

    let storage = getGlobalState();
    storage.allRooms = allRooms;
    setGlobaState(storage);
}