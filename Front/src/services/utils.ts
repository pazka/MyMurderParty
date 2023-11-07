import { useEffect, useState } from "react";
import { sendEvent } from "./eventsService";
import { AvailableEvents } from "./eventsService/allAvailableEvents";

export const useStateWithDep = <T>(initialValue: any): [T, Function] => {
    const [value, setValue] = useState<T>(initialValue);
    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    return [value, setValue];
}

export const openPopUp = (message: PopUpMessage) => {
    sendEvent(
        AvailableEvents.displayPopUp,
        message
    )
}