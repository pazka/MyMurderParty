import { useEffect, useId, useState } from "react";

let subscriptions: { [subscriptionkey: string]: Function } = {};

export const getDefaultStorage = (): AppStorage => {
    return {
        inventory: [],
        allRooms: [],
        currentRoom: null,
        allUsers: [],
        currentUser: null,
    };
};


const persistStorage = (storage: AppStorage) => {
    localStorage.setItem("persist", JSON.stringify(storage));
};

export const getGlobalState = (): AppStorage => {
    const storageString = localStorage.getItem("persist");

    if (!storageString) {
        let defaultStorage = getDefaultStorage();
        persistStorage(defaultStorage);
        return defaultStorage;
    }

    return JSON.parse(storageString);
};

export const setGlobaState = (newStorage: AppStorage) => {
    persistStorage(newStorage);

    for (const [id, setStorage] of Object.entries(subscriptions)) {
        console.debug("Setting new storage to", id);
        setStorage(newStorage);
        console.debug("New Storage", getGlobalState());
    }
};

export const useGlobalStorage = (): [AppStorage, Function] => {
    const [storage, setStorage] = useState<AppStorage>(getGlobalState());
    const id = useId();

    useEffect(() => {
        subscriptions[id] = setStorage;
    }, [id]);

    return [storage, setGlobaState];
};

export const resetStorage = () => {
    setGlobaState(getDefaultStorage());
};
