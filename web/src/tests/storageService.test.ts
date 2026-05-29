import { describe, it, expect, beforeEach } from 'vitest';
import { storageService, STORAGE_KEYS } from '@/services/storageService';

beforeEach(() => {
    localStorage.clear();
});

describe('storageService', () => {
    it('sets and gets string values', () => {
        storageService.set(STORAGE_KEYS.username, 'alice');
        expect(storageService.get(STORAGE_KEYS.username)).toBe('alice');
    });

    it('returns null for a missing key', () => {
        expect(storageService.get(STORAGE_KEYS.token)).toBeNull();
    });

    it('removes a stored value', () => {
        storageService.set(STORAGE_KEYS.token, 'x');
        storageService.remove(STORAGE_KEYS.token);
        expect(storageService.get(STORAGE_KEYS.token)).toBeNull();
    });

    it('round-trips numbers and returns null for missing or non-numeric values', () => {
        storageService.setNumber(STORAGE_KEYS.pollingInterval, 5000);
        expect(storageService.getNumber(STORAGE_KEYS.pollingInterval)).toBe(5000);

        expect(storageService.getNumber(STORAGE_KEYS.tokenExpiry)).toBeNull(); // missing

        localStorage.setItem(STORAGE_KEYS.pollingInterval, 'not-a-number');
        expect(storageService.getNumber(STORAGE_KEYS.pollingInterval)).toBeNull();
    });

    it('round-trips booleans and treats anything but "true" as false', () => {
        storageService.setBoolean(STORAGE_KEYS.autoStartPolling, true);
        expect(storageService.getBoolean(STORAGE_KEYS.autoStartPolling)).toBe(true);

        storageService.setBoolean(STORAGE_KEYS.autoStartPolling, false);
        expect(storageService.getBoolean(STORAGE_KEYS.autoStartPolling)).toBe(false);

        expect(storageService.getBoolean(STORAGE_KEYS.theme)).toBe(false); // missing key
    });

    it('clearAll removes every known key', () => {
        storageService.set(STORAGE_KEYS.token, 'a');
        storageService.set(STORAGE_KEYS.username, 'b');

        storageService.clearAll();

        expect(storageService.get(STORAGE_KEYS.token)).toBeNull();
        expect(storageService.get(STORAGE_KEYS.username)).toBeNull();
    });
});
