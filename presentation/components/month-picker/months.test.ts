import { isFutureMonth } from './months';

describe('isFutureMonth', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date(2026, 10, 15));
    });

    afterEach(() => jest.useRealTimers());

    it('mês corrente e meses passados não são futuros', () => {
        expect(isFutureMonth('2026-11')).toBe(false);
        expect(isFutureMonth('2026-10')).toBe(false);
        expect(isFutureMonth('2025-12')).toBe(false);
    });

    it('mês à frente do corrente é futuro, inclusive na virada do ano', () => {
        expect(isFutureMonth('2026-12')).toBe(true);
        expect(isFutureMonth('2027-01')).toBe(true);
    });
});
