import { percentLabel, pieSlices, pieTotal, requirementsLabel } from './skillStatisticsData';

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
