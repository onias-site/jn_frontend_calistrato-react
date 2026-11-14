import { HOME_OFFICE, OTHERS, money, regionName, regionTree, sliceLabel, slicesOf, yearsLabel } from './supplyAndDemandData';

describe('supplyAndDemandData', () => {
    it('rotula as fatias a partir dos códigos do backend', () => {
        expect(sliceLabel('spokenLanguage', 'Inglês|2')).toBe('Inglês fluente');
        expect(sliceLabel('spokenLanguage', 'Inglês|1')).toBe('Inglês intermediário');
        expect(sliceLabel('clt', '8000')).toBe(`${money(8000)} a ${money(8999)}`);
        expect(sliceLabel('pj', 'notInformed')).toBe('Não informado');
        expect(sliceLabel('disponibility', 'immediate')).toBe('Imediata');
        expect(sliceLabel('temporallyJob', 'doesNotAccept')).toBe('Não aceita');
        expect(sliceLabel('resumeType', '1')).toBe('Tecnologia da Informação');
        expect(sliceLabel('skill', 'Java')).toBe('Java');
    });

    it('escreve a média de experiência em anos', () => {
        expect(yearsLabel(4.5)).toBe('4,5 anos');
        expect(yearsLabel(1)).toBe('1 ano');
        expect(yearsLabel(0)).toBe('0 anos');
    });

    it('ordena as faixas salariais em ordem crescente, com o não informado por último e sem "Outras"', () => {
        const counts: Record<string, number> = { notInformed: 50 };
        for (let start = 0; start < 12000; start += 1000) counts[String(start)] = 1;
        const slices = slicesOf('clt', counts);
        expect(slices).toHaveLength(13);
        expect(slices[0].key).toBe('0');
        expect(slices[11].key).toBe('11000');
        expect(slices[12].key).toBe('notInformed');
    });

    it('junta em "Outras" o que passa das 7 maiores fatias', () => {
        const counts: Record<string, number> = {};
        for (let index = 1; index <= 10; index++) counts[`skill${index}`] = index;
        const slices = slicesOf('skill', counts);
        expect(slices).toHaveLength(8);
        expect(slices[0]).toEqual({ key: 'skill10', label: 'skill10', total: 10 });
        expect(slices[7]).toEqual({ key: OTHERS, label: OTHERS, total: 1 + 2 + 3 });
        expect(slicesOf('pcd', { true: 1, false: 3 }).map((slice) => slice.label)).toEqual(['Não', 'Sim']);
    });

    it('monta as pastas com o home office e as regiões agrupadas por estado', () => {
        const tree = regionTree();
        expect(tree[0]).toEqual({ value: HOME_OFFICE, label: 'Home office' });
        const states = tree.slice(1) as { value: string; children: { value: string; label: string }[] }[];
        expect(states.every((state) => state.value.startsWith('uf-') && state.children.length > 0)).toBe(true);
        const sp = states.find((state) => state.value == 'uf-SP');
        expect(sp?.children.some((region) => region.value == '11')).toBe(true);
        expect(regionName(HOME_OFFICE)).toBe('Home office');
        expect(regionName('11')).toBe(sp?.children.find((region) => region.value == '11')?.label);
    });
});
