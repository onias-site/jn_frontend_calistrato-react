import { HOME_OFFICE, money, regionName, regionTree, sliceLabel, yearsLabel, sources, countLabel, folderTotals, monthTitle, daysOfTheMonth, lastMonths, insertionSeries, sortFolders, periodTooltipLabel, charts, comparisonOf, distinctItems, isMultiValue, isSmallSample, percentText, profileComparisonOf, profileOf } from './supplyAndDemandData';

describe('supplyAndDemandData', () => {
    it('rotula as fatias a partir dos códigos do backend', () => {
        expect(sliceLabel('spokenLanguage', 'Inglês|2')).toBe('Inglês fluente');
        expect(sliceLabel('spokenLanguage', 'Inglês|1')).toBe('Inglês intermediário');
        expect(sliceLabel('spokenLanguage', 'none')).toBe('Nenhum Idioma');
        expect(sliceLabel('pcd', 'notInformed')).toBe('Não informado');
        expect(money(8000)).toBe('R$ 8.000');
        expect(sliceLabel('disponibility', 'immediate')).toBe('Imediata');
        expect(sliceLabel('temporallyJob', 'doesNotAccept')).toBe('Não aceita');
        expect(sliceLabel('resumeType', '1')).toBe('Tecnologia da Informação');
        expect(sliceLabel('skill', 'Java')).toBe('Java');
        expect(sliceLabel('negotiableClaim', 'true')).toBe('Sim');
        expect(sliceLabel('negotiableClaim', 'false')).toBe('Não');
        expect(sliceLabel('negotiableClaim', 'notInformed')).toBe('Não informado');
    });

    it('tem as fontes CVs (padrão), CVs vistos e Vagas, esta ainda sem dados', () => {
        expect(sources.map((source) => source.button)).toEqual(['CVs', 'CVs vistos', 'Vagas']);
        expect(sources.map((source) => source.ready)).toEqual([true, true, false]);
        expect(countLabel(sources[1], 1)).toBe('1 visualização');
        expect(countLabel(sources[0], 15)).toBe('15 currículos');
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

    it('junta os 5 gráficos de sim/não no perfil, com a porcentagem de sim sobre todos', () => {
        const bars = profileOf({ pcd: { true: 1, false: 8, notInformed: 1 }, travel: { true: 5, false: 5 } });
        expect(bars.map((bar) => bar.label)).toEqual(['Disponibilidade imediata', 'Negocia a pretensão salarial', 'Aceita viajar', 'Aceita trabalho temporário', 'PCD']);
        expect(bars[2]).toEqual({ label: 'Aceita viajar', yes: 5, total: 10, percent: 50 });
        expect(bars[4]).toEqual({ label: 'PCD', yes: 1, total: 10, percent: 10 });
        expect(bars[0]).toEqual({ label: 'Disponibilidade imediata', yes: 0, total: 0, percent: 0 });
        expect(charts.some((chart) => chart.id == 'pcd')).toBe(false);
    });

    const [cvs, viewed] = sources;

    it('compara as fontes lado a lado em porcentagem de cada uma, com a quantidade para a dica', () => {
        const comparison = comparisonOf('resumeType', [
            { source: cvs, total: 10, counts: { '1': 8, '2': 2 } },
            { source: viewed, total: 40, counts: { '1': 10, '2': 30 } },
        ]);
        expect(comparison.categories).toEqual(['Tecnologia da Informação', 'Recrutamento e seleção']);
        expect(comparison.series.map((item) => item.name)).toEqual(['CVs', 'CVs vistos']);
        expect(comparison.series[0].data).toEqual([80, 20]);
        expect(comparison.series[1].data).toEqual([25, 75]);
        expect(comparison.series[1].counts).toEqual([10, 30]);
        expect(comparison.series[1].source).toBe(viewed);
    });

    it('mantém a ordem própria das faixas, da contratação e da senioridade, e põe zero onde a fonte não tem a categoria', () => {
        const skills = comparisonOf('skillsCount', [{ source: cvs, total: 13, counts: { over50: 1, upTo5: 3, from16To30: 9 } }]);
        expect(skills.categories).toEqual(['Até 5', 'De 16 a 30', 'Mais de 50']);
        const contracts = comparisonOf('contractType', [{ source: cvs, total: 116, counts: { both: 106, onlyPj: 3, onlyClt: 7 } }]);
        expect(contracts.categories).toEqual(['Aceita apenas CLT', 'Aceita apenas PJ', 'Aceita ambos']);
        const seniority = comparisonOf('seniority', [
            { source: cvs, total: 34, counts: { senior: 9, estag: 1, pleno: 20, junior: 4 } },
            { source: viewed, total: 5, counts: { senior: 5 } },
        ]);
        expect(seniority.categories).toEqual(['Estágio', 'Júnior', 'Pleno', 'Sênior']);
        expect(seniority.series[1].data).toEqual([0, 0, 0, 100]);
    });

    it('ordena as demais categorias pela primeira fonte e une as categorias das duas', () => {
        const comparison = comparisonOf('anyChart', [
            { source: cvs, total: 10, counts: { a: 2, b: 8 } },
            { source: viewed, total: 10, counts: { c: 10 } },
        ]);
        expect(comparison.categories).toEqual(['b', 'a', 'c']);
        expect(comparison.series[0].data).toEqual([80, 20, 0]);
    });

    it('calcula habilidades e idiomas sobre os registros, só com os 12 mais frequentes', () => {
        expect(isMultiValue('skill')).toBe(true);
        const comparison = comparisonOf('skill', [{ source: cvs, total: 8, counts: { Java: 6, SQL: 4, Docker: 2 } }]);
        expect(comparison.series[0].data).toEqual([75, 50, 25]);
        const many = Object.fromEntries(Array.from({ length: 20 }, (_, index) => [`S${index}`, 20 - index]));
        const top = comparisonOf('skill', [{ source: cvs, total: 40, counts: many }]);
        expect(top.categories.length).toBe(12);
        expect(top.categories[0]).toBe('S0');
        expect(distinctItems(many)).toBe(20);
        expect(distinctItems(undefined)).toBe(0);
    });

    it('compara o perfil das fontes lado a lado', () => {
        const comparison = profileComparisonOf([
            { source: cvs, charts: { pcd: { true: 1, false: 9 } } },
            { source: viewed, charts: { pcd: { true: 3, false: 1 } } },
        ]);
        expect(comparison.categories[4]).toBe('PCD');
        expect(comparison.series[0].data[4]).toBe(10);
        expect(comparison.series[1].data[4]).toBe(75);
        expect(comparison.series[1].counts[4]).toBe(3);
    });

    it('escreve a porcentagem e avisa a amostra pequena', () => {
        expect(percentText(12.5)).toBe('12,5%');
        expect(isSmallSample(3)).toBe(true);
        expect(isSmallSample(10)).toBe(false);
        expect(isSmallSample(0)).toBe(false);
    });

    it('põe Dia ou Mês antes do período na dica do gráfico de linhas', () => {
        expect(periodTooltipLabel(true, '14')).toBe('Dia 14');
        expect(periodTooltipLabel(false, 'nov/26')).toBe('Mês nov/26');
    });
});
