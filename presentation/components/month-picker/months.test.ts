import { isFutureMonth, previousMonth } from './months';

describe('previousMonth', () => {
    afterEach(() => jest.useRealTimers());

    it('volta um mês, mesmo no último dia de um mês mais longo que o anterior', () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date(2026, 2, 31));

        expect(previousMonth()).toBe('2026-02');
    });

    it('em janeiro volta para dezembro do ano anterior', () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date(2027, 0, 15));

        expect(previousMonth()).toBe('2026-12');
    });
});

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
