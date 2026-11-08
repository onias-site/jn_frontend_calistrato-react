import { ONE_DAY_IN_MILLISECONDS, getNextAllowedTime, getResumeDailyActionBlockMessage, recordResumeDailyAction } from './resumeDailyActions';

// o Jest roda no ambiente node, sem localStorage
const fakeStorage = () => {
    const items = new Map<string, string>();
    return {
        getItem: (key: string) => (items.has(key) ? items.get(key) : null),
        setItem: (key: string, value: string) => items.set(key, value),
    };
};

describe('resumeDailyActions', () => {
    const email = 'candidato@jobsnow.com';
    const now = new Date(2026, 10, 7, 10, 0).getTime();

    beforeEach(() => Object.defineProperty(global, 'localStorage', { value: fakeStorage(), configurable: true, writable: true }));

    it('allows every action that was never done', () => {
        expect(getNextAllowedTime(email, 'update', now)).toBeNull();
        expect(getResumeDailyActionBlockMessage(email, 'update', now)).toBeNull();
    });

    it('blocks the action for 24 hours after it was done', () => {
        recordResumeDailyAction(email, 'inactivation', now);
        expect(getNextAllowedTime(email, 'inactivation', now + 1000)).toBe(now + ONE_DAY_IN_MILLISECONDS);
        expect(getResumeDailyActionBlockMessage(email, 'inactivation', now + 1000)).toContain('uma única vez ao dia');
        expect(getNextAllowedTime(email, 'inactivation', now + ONE_DAY_IN_MILLISECONDS)).toBeNull();
    });

    it('keeps the actions and the users independent', () => {
        recordResumeDailyAction(email, 'inactivation', now);
        expect(getNextAllowedTime(email, 'reactivation', now)).toBeNull();
        expect(getNextAllowedTime('outro@jobsnow.com', 'inactivation', now)).toBeNull();
    });

    it('drops the expired marks when recording a new one', () => {
        recordResumeDailyAction(email, 'exclusion', now);
        recordResumeDailyAction(email, 'update', now + ONE_DAY_IN_MILLISECONDS + 1);
        const stored = JSON.parse(localStorage.getItem('resumeDailyActions') || '{}');
        expect(Object.keys(stored[email])).toEqual(['update']);
    });

    it('works without localStorage, leaving the decision to the backend', () => {
        const blockedStorage = {
            getItem: () => {
                throw new Error('blocked');
            },
            setItem: () => {
                throw new Error('blocked');
            },
        };
        Object.defineProperty(global, 'localStorage', { value: blockedStorage, configurable: true, writable: true });
        recordResumeDailyAction(email, 'update', now);
        expect(getNextAllowedTime(email, 'update', now)).toBeNull();
    });
});
