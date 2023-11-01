import { useEffect, useState } from "react";

export const useStateWithDep = <T>(initialValue: any) : [T,Function] => {
    const [value, setValue] = useState<T>(initialValue);
    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    return [value, setValue];
}