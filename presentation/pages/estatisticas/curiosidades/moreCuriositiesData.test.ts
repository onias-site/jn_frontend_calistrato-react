import { channelGoalChart, rankingOf } from './moreCuriositiesData';

describe('moreCuriositiesData', () => {
    it('monta o ranking dos 10 maiores e diz quantos itens há', () => {
        const counts = Object.fromEntries(Array.from({ length: 14 }, (_, index) => [`s${index}`, 20 - index]));
        const { items, distinct } = rankingOf(counts, { s0: 'Primeira' });
        expect(distinct).toBe(14);
        expect(items).toHaveLength(10);
        expect(items[0]).toEqual({ label: 'Primeira', total: 20 });
    });

    it('empilha os objetivos em cada origem, da origem que traz mais usuários para a que traz menos', () => {
        const chart = channelGoalChart({ 'linkedin|jobs': 99, 'linkedin|recruiting': 8, 'friends|jobs': 14, 'telegram|recruiting': 30 });
        expect(chart.categories).toEqual(['LinkedIn', 'Grupos do Telegram', 'Indicação de amigos']);
        expect(chart.series).toEqual([
            { name: 'Buscam emprego', data: [99, 0, 14] },
            { name: 'Recrutam', data: [8, 30, 0] },
        ]);
    });
});
