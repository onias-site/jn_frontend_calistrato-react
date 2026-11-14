import { HOME_OFFICE, OTHERS, money, regionName, regionTree, sliceLabel, slicesOf, yearsLabel, sources, countLabel, folderTotals, monthTitle, daysOfTheMonth, lastMonths, insertionSeries, sortFolders } from './supplyAndDemandData';

describe('supplyAndDemandData', () => {
    it('rotula as fatias a partir dos códigos do backend', () => {
        expect(sliceLabel('spokenLanguage', 'Inglês|2')).toBe('Inglês fluente');
        expect(sliceLabel('spokenLanguage', 'Inglês|1')).toBe('Inglês intermediário');
        expect(sliceLabel('spokenLanguage', 'none')).toBe('Nenhum');
        expect(sliceLabel('pcd', 'notInformed')).toBe('Não informado');
        expect(money(8000)).toBe('R$ 8.000');
        expect(sliceLabel('disponibility', 'immediate')).toBe('Imediata');
        expect(sliceLabel('temporallyJob', 'doesNotAccept')).toBe('Não aceita');
        expect(sliceLabel('resumeType', '1')).toBe('Tecnologia da Informação');
        expect(sliceLabel('skill', 'Java')).toBe('Java');
    });

    it('tem as fontes CVs (padrão), CVs vistos e Vagas, esta ainda sem dados', () => {
        expect(sources.map((source) => source.button)).toEqual(['CVs', 'CVs vistos', 'Vagas']);
        expect(sources.map((source) => source.ready)).toEqual([true, true, false]);
        expect(countLabel(sources[1], 1)).toBe('1 visualização');
        expect(countLabel(sources[0], 15)).toBe('15 currículos');
    });

    it('mantém a ordem própria das faixas de habilidades e das formas de contratação', () => {
        const skills = slicesOf('skillsCount', { over50: 1, upTo5: 3, from16To30: 9 });
        expect(skills.map((slice) => slice.label)).toEqual(['Até 5', 'De 16 a 30', 'Mais de 50']);
        const contracts = slicesOf('contractType', { both: 106, onlyPj: 3, onlyClt: 7 });
        expect(contracts.map((slice) => slice.label)).toEqual(['Aceita apenas CLT', 'Aceita apenas PJ', 'Aceita ambos']);
    });

    it('soma os totais dos ddds de uma pasta em cada fonte', () => {
        const totals = { resumes: { '11': 15, '12': 2 }, viewedResumes: { '11': 22 } };
        expect(folderTotals(totals, ['11'])).toBe('15 currículos · 22 visualizações');
        expect(folderTotals(totals, ['11', '12', '13'])).toBe('17 currículos · 22 visualizações');
        expect(folderTotals(totals, ['99'])).toBe('0 currículos · 0 visualizações');
        expect(folderTotals({}, ['11'])).toBe('0 currículos · 0 visualizações');
    });

    it('monta os dias do mês corrente e os últimos meses do gráfico de linhas', () => {
        const now = new Date(2026, 10, 14);
        expect(monthTitle(now)).toBe('novembro de 2026');
        const days = daysOfTheMonth(now);
        expect(days.length).toBe(14);
        expect(days[0]).toEqual({ key: '20261101', label: '01' });
        expect(days[13]).toEqual({ key: '20261114', label: '14' });
        const months = lastMonths(now, 12);
        expect(months[0]).toEqual({ key: '202512', label: 'dez/25' });
        expect(months[11]).toEqual({ key: '202611', label: 'nov/26' });
        const series = insertionSeries({ resumes: { '20261114': 3 }, viewedResumes: { '20261101': 37 } }, days);
        expect(series.map((line) => line.name)).toEqual(['Currículos inseridos', 'Visualizações feitas']);
        expect(series[0].data[13]).toBe(3);
        expect(series[1].data[0]).toBe(37);
        expect(insertionSeries(undefined, days)[0].data.every((value) => value == 0)).toBe(true);
    });

    it('escreve a média de experiência em anos', () => {
        expect(yearsLabel(4.5)).toBe('4,5 anos');
        expect(yearsLabel(1)).toBe('1 ano');
        expect(yearsLabel(0)).toBe('0 anos');
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

    it('ordena as pastas por visualizações, currículos e nome', () => {
        const nodes = [
            { value: HOME_OFFICE, label: 'Home office' },
            { value: 'uf-RJ', label: 'RJ', children: [{ value: '21', label: 'Rio' }, { value: '22', label: 'Campos' }] },
            { value: 'uf-SP', label: 'SP', children: [{ value: '11', label: 'São Paulo' }, { value: '12', label: 'Vale' }] },
            { value: 'uf-AC', label: 'AC', children: [{ value: '68', label: 'Rio Branco' }] },
            { value: 'uf-AL', label: 'AL', children: [{ value: '82', label: 'Maceió' }] },
        ];
        const totals = { viewedResumes: { '10': 5, '11': 3, '12': 4, '21': 7 }, resumes: { '68': 2, '22': 1, '21': 1 } };
        const sorted = sortFolders(nodes, totals);
        expect(sorted.map((node) => node.value)).toEqual(['uf-RJ', 'uf-SP', HOME_OFFICE, 'uf-AC', 'uf-AL']);
        expect(sorted[1].children?.map((node) => node.value)).toEqual(['12', '11']);
        expect(sorted[0].children?.map((node) => node.value)).toEqual(['21', '22']);
        expect(sortFolders(nodes).map((node) => node.value)).toEqual(['uf-AC', 'uf-AL', HOME_OFFICE, 'uf-RJ', 'uf-SP']);
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
