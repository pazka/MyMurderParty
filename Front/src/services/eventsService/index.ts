//simple event subsicption system for anu functino 

import { useEffect, useId } from "react";
import { AvailableEvents } from "./allAvailableEvents";

const allSubscriptions: { [eventKey: string]: {[subscriberId : string] : Function} } = {};

export const subscribe = (event: AvailableEvents, subscriptionId: string, callback: Function) => {
    if (!allSubscriptions[event]) {
        allSubscriptions[event] = {};
    }

    allSubscriptions[event][subscriptionId] = callback;
};

export const unsubscribe = (event: AvailableEvents, subscriptionId: string, callback: Function) => {
    if (!allSubscriptions[event]) {
        return;
    }

    delete allSubscriptions[event][subscriptionId];
};

export const sendEvent = (event: AvailableEvents, ...args: any[]) => {
    if (!allSubscriptions[event]) {
        return;
    }

    console.log("EVENT", event, args);

    for (const [id, callback] of Object.entries(allSubscriptions[event])) {
        callback(...args);
    }
};

export const useEvent = (event: AvailableEvents, callback: Function) => {
    const id = useId();

    useEffect(() => {
        subscribe(event, id, callback);

        return () => {
            unsubscribe(event, id, callback);
        };
    }, [id]);
};