import { useEffect, useId, useState } from "react";

let subscriptions: { [subscriptionkey: string]: Function } = {};

export const getDefaultStorage = (): AppStorage => {
    return {
        inventory: [],
        allRooms: [],
        currentRoom: null,
        allUsers: [],
        usersInRoom: [],
        currentUser: {
            id: "",
            name: "",
            sessionId: "",
            lastActivity: 0,
        },
        roomHistory: [],
    };
};


const persistStorage = (storage: AppStorage) => {
    localStorage.setItem("persist", JSON.stringify(storage));
};

export const getGlobalState = (): AppStorage => {
    const storageString = localStorage.getItem("persist");

    if (!storageString || storageString.trim() === "") {
        let defaultStorage = getDefaultStorage();
        persistStorage(defaultStorage);
        return defaultStorage;
    }

    return JSON.parse(storageString);
};

export const setGlobaState = (newStorage: AppStorage) => {
    persistStorage(newStorage);

    for (const [id, setStorage] of Object.entries(subscriptions)) {
        setStorage(newStorage);
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
