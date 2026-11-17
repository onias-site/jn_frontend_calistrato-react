import { channelGoalChart, cleanCompanies, contactUsStatusChart, highlightsOf, newUsersByWeekday, rankingOf } from './moreCuriositiesData';

describe('moreCuriositiesData', () => {
    it('1. tira e-mails e "nenhuma" das consultorias e junta as grafias da mesma empresa', () => {
        const clean = cleanCompanies({ 'alguem@gmail.com': 1, nenhuma: 4, Nenhum: 1, Inexti: 1, Inexbr: 1, Inexconsulting: 2, 'Porto Seguro': 2, portoseguro: 1, Accenture: 3 });
        expect(Object.keys(clean).some((key) => key.includes('@'))).toBe(false);
        expect(clean.nenhuma).toBeUndefined();
        expect(clean.Inexconsulting).toBe(4);
        expect(clean['Porto Seguro']).toBe(3);
        expect(clean.Accenture).toBe(3);
        expect(Object.keys(clean)).toHaveLength(3);
    });

    it('1. não corta o sufixo de um nome que não tem outra grafia', () => {
        expect(cleanCompanies({ Totvsti: 2, Stefanini: 1 })).toEqual({ Totvsti: 2, Stefanini: 1 });
    });

    it('3. monta o ranking dos 10 maiores, sem as chaves de fora, e diz quantos itens há', () => {
        const counts = Object.fromEntries(Array.from({ length: 14 }, (_, index) => [`d${index}`, 20 - index]));
        const { items, distinct } = rankingOf({ ...counts, 'onias.site': 99 }, { d0: 'Primeiro' }, ['onias.site']);
        expect(distinct).toBe(14);
        expect(items).toHaveLength(10);
        expect(items[0]).toEqual({ label: 'Primeiro', total: 20 });
    });

    it('4 e 5. calcula os cartões do topo, com a taxa de desistência do currículo', () => {
        const highlights = highlightsOf(
            {
                newUsersByMonth: { '202611': 169 },
                resumeSituation: { active: 78, inactive: 2 },
                recruiterSources: { legacy: 36347, telegram: 4299, login: 8 },
                pendingContactUsTypes: { makeCriticism: 1 },
                contactUsTypes: { makeSuggestion: 9, makeCriticism: 3 },
            },
            new Date(2026, 10, 17),
        );
        expect(highlights.map((item) => item.value)).toEqual(['169', '78', '4.307', '1']);
        expect(highlights[1].detail).toBe('2,5% dos currículos foram desativados');
        expect(highlights[3].detail).toBe('de 12 abertos');
        expect(highlightsOf({}, new Date(2026, 10, 17)).map((item) => item.value)).toEqual(['0', '0', '0', '0']);
    });

    it('6. empilha os objetivos em cada origem, da origem que traz mais usuários para a que traz menos', () => {
        const chart = channelGoalChart({ 'linkedin|jobs': 99, 'linkedin|recruiting': 8, 'friends|jobs': 14, 'telegram|recruiting': 30 });
        expect(chart.categories).toEqual(['LinkedIn', 'Grupos do Telegram', 'Indicação de amigos']);
        expect(chart.series).toEqual([
            { name: 'Buscam emprego', data: [99, 0, 14] },
            { name: 'Recrutam', data: [8, 30, 0] },
        ]);
    });

    it('7. separa os chamados respondidos dos que esperam o suporte', () => {
        const chart = contactUsStatusChart({ makeSuggestion: 9, makeCriticism: 3, reportBug: 0 }, { makeCriticism: 1 });
        expect(chart.series).toEqual([
            { name: 'Respondidos', data: [9, 2] },
            { name: 'Sem resposta', data: [0, 1] },
        ]);
        expect(chart.categories).toHaveLength(2);
    });

    it('8. tira a média de novos usuários por dia da semana até ontem, os dias vazios valendo zero', () => {
        // 2026-11-09 é segunda; hoje, 2026-11-17 (terça), fica de fora
        const { days, data } = newUsersByWeekday({ '20261109': 4, '20261116': 2, '20261110': 6, '20261117': 50 }, new Date(2026, 10, 17, 12));
        expect(days).toBe(8);
        expect(data).toEqual([3, 6, 0, 0, 0, 0, 0]);
        expect(newUsersByWeekday({}, new Date())).toEqual({ days: 0, data: [] });
    });
});
