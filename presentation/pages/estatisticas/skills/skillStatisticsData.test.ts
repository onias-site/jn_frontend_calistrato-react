import { firstOfLastMonths, monthsBetween, percentLabel, pieSlices, pieTotal, requirementsLabel } from './skillStatisticsData';

describe('skillStatisticsData', () => {
    it('expressa o total da pizza como exigências das vagas', () => {
        expect(requirementsLabel(520, 91)).toBe('520 exigências das 91 vagas');
        expect(requirementsLabel(1, 1)).toBe('1 exigência da vaga');
    });

    it('soma as fatias para formar o total da pizza', () => {
        expect(pieTotal([10, 20, 5])).toBe(35);
    });

    it('escreve a porcentagem com uma casa decimal e vírgula', () => {
        expect(percentLabel(1, 3)).toBe('33,3%');
        expect(percentLabel(1, 1)).toBe('100,0%');
    });

    it('inclui a fatia "Outras" no total, sem perder nenhuma skill', () => {
        const skills = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((total) => ({ skill: `S${total}`, total }));

        const { labels, values } = pieSlices(skills);

        expect(labels[labels.length - 1]).toBe('Outras');
        expect(pieTotal(values)).toBe(45);
    });
});

describe('date range of the line charts', () => {
    const months = ['202501', '202506', '202601', '202610'].map((yearMonth) => ({ yearMonth, total: 1 }));

    it('counts the current month among the last months, crossing the year', () => {
        expect(firstOfLastMonths(6, new Date(2026, 10, 15))).toBe('202606');
        expect(firstOfLastMonths(12, new Date(2026, 1, 1))).toBe('202503');
    });

    it('keeps the months between the ends, both included', () => {
        expect(monthsBetween(months, '202506', '202601').map((month) => month.yearMonth)).toEqual(['202506', '202601']);
        expect(monthsBetween(months, '202611', '202612')).toEqual([]);
    });
});
