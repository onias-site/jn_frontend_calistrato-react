import { MAX_SLICES, OTHERS, newUsersSeries, pies, slicesOf, totalLabel } from './curiositiesData';

describe('curiositiesData', () => {
    it('ordena as fatias da maior para a menor e usa os rótulos', () => {
        const situation = pies.find((pie) => pie.id == 'resumeSituation');
        expect(slicesOf({ inactive: 2, active: 51 }, situation?.labels)).toEqual([
            { key: 'active', label: 'Ativo', total: 51 },
            { key: 'inactive', label: 'Inativo', total: 2 },
        ]);
    });

    it('usa os rótulos do combo dos chamados', () => {
        const tickets = pies.find((pie) => pie.id == 'contactUsTypes');
        expect(slicesOf({ reportBug: 1 }, tickets?.labels)[0].label).toBe('Reportar um bug');
    });

    it('junta o que passa do limite em Outras', () => {
        const counts = Object.fromEntries(Array.from({ length: 12 }, (_, index) => [`skill${index}`, 20 - index]));
        const slices = slicesOf(counts);
        expect(slices).toHaveLength(MAX_SLICES);
        expect(slices[MAX_SLICES - 1]).toEqual({ key: OTHERS, label: OTHERS, total: 13 + 12 + 11 + 10 + 9 });
    });

    it('ignora as chaves zeradas e mostra a chave sem rótulo como veio', () => {
        expect(slicesOf({ COBOL: 3, JAVA: 0 })).toEqual([{ key: 'COBOL', label: 'COBOL', total: 3 }]);
    });

    it('mostra o total geral com separador de milhar', () => {
        expect(totalLabel(1234)).toBe('Total: 1.234');
    });

    it('rotula as áreas e os recrutadores com e-mail pessoal', () => {
        const areas = pies.find((pie) => pie.id == 'resumeTypes');
        const domains = pies.find((pie) => pie.id == 'viewerDomains');
        expect(slicesOf({ '1': 45 }, areas?.labels)[0].label).toBe('Tecnologia da Informação');
        expect(slicesOf({ freelancer: 52, 'onias.site': 39 }, domains?.labels).map((slice) => slice.label)).toEqual(['Recrutadores com e-mail pessoal', 'onias.site']);
        expect(pies.find((pie) => pie.id == 'resumeSituation')?.title).toBe('Situação do Currículo');
    });

    it('preenche com zero os períodos sem contagem', () => {
        const periods = [
            { key: '20261113', label: '13' },
            { key: '20261114', label: '14' },
        ];
        expect(newUsersSeries({ '20261114': 20 }, periods)).toEqual([{ name: 'Novos usuários', data: [0, 20] }]);
    });
});
