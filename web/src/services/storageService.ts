export const STORAGE_KEYS = {
    token: 'sel.token',
    tokenExpiry: 'sel.tokenExpiry',
    username: 'sel.username',
    password: 'sel.password',
    theme: 'sel.theme',
    pollingInterval: 'sel.pollingInterval',
    autoStartPolling: 'sel.autoStartPolling',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

function safeGet(key: string): string | null {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
}

function safeSet(key: string, value: string): void {
    try {
        localStorage.setItem(key, value);
    } catch {
        return
    }
}

function safeRemove(key: string): void {
    try {
        localStorage.removeItem(key);
    } catch {
        return
    }
}

export const storageService = {
    get(key: StorageKey): string | null {
        return safeGet(key);
    },

    set(key: StorageKey, value: string): void {
        safeSet(key, value);
    },

    remove(key: StorageKey): void {
        safeRemove(key);
    },

    getNumber(key: StorageKey): number | null {
        const raw = safeGet(key);
        if (raw === null) return null;
        const n = Number(raw);
        return Number.isFinite(n) ? n : null;
    },

    setNumber(key: StorageKey, value: number): void {
        safeSet(key, String(value));
    },

    getBoolean(key: StorageKey): boolean {
        return safeGet(key) === 'true';
    },

    setBoolean(key: StorageKey, value: boolean): void {
        safeSet(key, String(value));
    },

    clearAll(): void {
        for (const key of Object.values(STORAGE_KEYS)) safeRemove(key);
    },
};
