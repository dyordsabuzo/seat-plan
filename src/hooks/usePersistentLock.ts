import { useCallback, useEffect, useState } from "react";

type UsePersistentLockResult = {
    locked: boolean;
    setLocked: (value: boolean) => void;
    toggleLocked: () => void;
};

export function usePersistentLock(storageKey: string, defaultLocked = false): UsePersistentLockResult {
    const [locked, setLocked] = useState<boolean>(() => {
        try {
            const raw = window.localStorage.getItem(storageKey);
            if (raw === null) return defaultLocked;
            return raw === "true";
        } catch {
            return defaultLocked;
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(storageKey, String(locked));
        } catch {
            return;
        }
    }, [storageKey, locked]);

    const toggleLocked = useCallback(() => {
        setLocked((previous) => !previous);
    }, []);

    return { locked, setLocked, toggleLocked };
}
