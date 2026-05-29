import { describe, it, expect } from 'vitest';
import { cn, statusGenerator } from '@/lib/utils';

describe('statusGenerator', () => {
    it('returns Active when updated less than 30s ago', () => {
        expect(statusGenerator(new Date(Date.now() - 5_000))).toBe('Active');
    });

    it('returns Stale when updated between 30s and 60s ago', () => {
        expect(statusGenerator(new Date(Date.now() - 45_000))).toBe('Stale');
    });

    it('returns Inactive when updated 60s or more ago', () => {
        expect(statusGenerator(new Date(Date.now() - 90_000))).toBe('Inactive');
    });
});

describe('cn', () => {
    it('merges class names and resolves Tailwind conflicts', () => {
        expect(cn('px-2', 'px-4')).toBe('px-4'); 
        expect(cn('a', false && 'b', 'c')).toBe('a c'); // clsx will drop falsy values
    });
});
