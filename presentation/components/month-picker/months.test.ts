import { clampMonth, isFutureMonth, previousMonth, selectableMonthNumbers, selectableYears } from './months';

describe('selects de mês e ano', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date(2026, 10, 15));
    });

    afterEach(() => jest.useRealTimers());

    it('os anos vão do corrente até o do mínimo, do mais recente ao mais antigo', () => {
        expect(selectableYears('2024-05')).toEqual(['2026', '2025', '2024']);
        expect(selectableYears('2015-01')).toHaveLength(12);
    });

    it('no ano corrente os meses param no mês corrente', () => {
        expect(selectableMonthNumbers('2026', '2015-01')).toEqual(['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11']);
    });

    it('no ano do mínimo os meses começam nele, e nos outros anos vão de 01 a 12', () => {
        expect(selectableMonthNumbers('2024', '2024-05')).toEqual(['05', '06', '07', '08', '09', '10', '11', '12']);
        expect(selectableMonthNumbers('2025', '2024-05')).toHaveLength(12);
    });

    it('trocar o ano leva o mês fora da faixa ao limite mais próximo', () => {
        expect(clampMonth('2026-12', '2015-01')).toBe('2026-11');
        expect(clampMonth('2015-01', '2015-03')).toBe('2015-03');
        expect(clampMonth('2020-07', '2015-01')).toBe('2020-07');
    });
});

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
