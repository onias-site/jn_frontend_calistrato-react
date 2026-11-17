import { Comparison, Source, TotalsByRegion, comparisonOf, profileComparisonOf, regionName, seniorities, sliceLabel, sources } from './supplyAndDemandData';

/**
 * Os cálculos dos gráficos acrescentados em 2026-11-17 (um bloco por gráfico, cada um com o seu painel em arquivo
 * próprio): para retirar um gráfico, apague o painel, a linha dele na tela e o bloco daqui.
 */

type ChartsOfSource = Record<string, Record<string, number>>;

/** O que cada fonte tem num painel por região: o total e as contagens de cada gráfico. */
export type SourceData = { source: Source; total: number; charts?: ChartsOfSource };

const [RESUMES, VIEWED] = sources;

// ---------------------------------------------------------------------------------------------------------------------
// 1. O que os recrutadores procuram mais do que existe
// ---------------------------------------------------------------------------------------------------------------------

/** Os gráficos que entram na diferença, com o prefixo do rótulo de cada um. */
const gapCharts = [
    { chart: 'seniority', prefix: 'Senioridade' },
    { chart: 'contractType', prefix: 'Contratação' },
    { chart: 'resumeType', prefix: 'Tipo' },
    { chart: 'spokenLanguage', prefix: 'Idioma' },
    { chart: 'skill', prefix: 'Habilidade' },
];

/** Abaixo disto (currículos + visualizações com o item), a diferença é ruído: o item fica de fora. */
export const GAP_MINIMUM_RECORDS = 3;

/** Quantos itens de cada lado (procurado e sobrando) o gráfico mostra. */
export const GAP_ITEMS_EACH_SIDE = 6;

export type Gap = { label: string; gap: number; resumes: number; viewed: number; resumesCount: number; viewedCount: number };

const gapsOf = (prefix: string, comparison: Comparison): Gap[] => {
    const [resumes, viewed] = comparison.series;
    if (!resumes || !viewed) return [];
    return comparison.categories.map((category, index) => ({
        label: `${prefix}: ${category}`,
        gap: Math.round((viewed.data[index] - resumes.data[index]) * 10) / 10,
        resumes: resumes.data[index],
        viewed: viewed.data[index],
        resumesCount: resumes.counts[index],
        viewedCount: viewed.counts[index],
    }));
};

/**
 * A diferença, em pontos percentuais, entre a fatia de cada item entre os currículos vistos e entre os currículos da
 * região: positiva quando os recrutadores procuram o item mais do que ele existe, negativa quando sobra. Ficam os
 * GAP_ITEMS_EACH_SIDE maiores de cada lado, o mais procurado primeiro e o que mais sobra por último.
 */
export const gapsOfTheRegion = (resumes: SourceData, viewed: SourceData): Gap[] => {
    if (!resumes.total || !viewed.total) return [];
    const bySource = (chart: string) => [resumes, viewed].map((item) => ({ source: item.source, total: item.total, counts: item.charts?.[chart] }));
    const all = [
        ...gapCharts.flatMap((item) => gapsOf(item.prefix, comparisonOf(item.chart, bySource(item.chart)))),
        ...gapsOf('Perfil', profileComparisonOf([resumes, viewed])),
    ].filter((item) => item.gap != 0 && item.resumesCount + item.viewedCount >= GAP_MINIMUM_RECORDS);
    const sought = all.filter((item) => item.gap > 0).sort((a, b) => b.gap - a.gap).slice(0, GAP_ITEMS_EACH_SIDE);
    const spare = all.filter((item) => item.gap < 0).sort((a, b) => a.gap - b.gap).slice(0, GAP_ITEMS_EACH_SIDE).reverse();
    return [...sought, ...spare];
};

/** +13,3 pp; -4 pp. */
export const pointsText = (gap: number) => `${gap > 0 ? '+' : ''}${gap.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} pp`;

// ---------------------------------------------------------------------------------------------------------------------
// 2. Pretensão salarial por senioridade
// ---------------------------------------------------------------------------------------------------------------------

type Averages = Record<string, { clt?: number; pj?: number }>;

/**
 * As médias das pretensões por senioridade, uma série por pretensão e fonte (CLT dos CVs, CLT dos vistos, PJ dos CVs,
 * PJ dos vistos); sem média (ninguém informou) a barra não aparece.
 */
export const salaryBySeniority = (bySource: { source: Source; averages?: Averages }[]) => ({
    categories: seniorities.map((seniority) => seniority.nome),
    series: ['clt', 'pj'].flatMap((kind) =>
        bySource.map((item) => ({
            name: `${kind.toUpperCase()} · ${item.source.button}`,
            data: seniorities.map((seniority) => item.averages?.[seniority.id]?.[kind as 'clt' | 'pj'] || null),
        })),
    ),
});

/** 9100 vira "R$ 9,1 mil"; 800 vira "R$ 800". */
export const shortMoney = (value: number) => (value >= 1000 ? `R$ ${(value / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mil` : `R$ ${Math.round(value)}`);

// ---------------------------------------------------------------------------------------------------------------------
// 3. Regiões mais disputadas
// ---------------------------------------------------------------------------------------------------------------------

/** Abaixo disto (currículos ativos na região), a razão visualizações por currículo não diz nada: a região fica de fora. */
export const DISPUTED_MINIMUM_RESUMES = 5;

/** Quantas regiões o ranking mostra. */
export const DISPUTED_REGIONS = 15;

export type DisputedRegion = { ddd: string; label: string; resumes: number; views: number; ratio: number };

/** As regiões com mais visualizações por currículo ativo (os totais por ddd que a tela já carrega para as pastas). */
export const disputedRegions = (byRegion: TotalsByRegion = {}): DisputedRegion[] => {
    const resumesByDdd = byRegion[RESUMES.id] || {};
    const viewsByDdd = byRegion[VIEWED.id] || {};
    return Object.keys(resumesByDdd)
        .map((ddd) => {
            const resumes = resumesByDdd[ddd] || 0;
            const views = viewsByDdd[ddd] || 0;
            return { ddd, label: regionName(ddd), resumes, views, ratio: resumes ? Math.round((views * 100) / resumes) / 100 : 0 };
        })
        .filter((item) => item.resumes >= DISPUTED_MINIMUM_RESUMES)
        .sort((a, b) => b.ratio - a.ratio || b.views - a.views)
        .slice(0, DISPUTED_REGIONS);
};

// ---------------------------------------------------------------------------------------------------------------------
// 4. Senioridade x contratação
// ---------------------------------------------------------------------------------------------------------------------

/** As colunas do mapa de calor: as formas de contratação (as chaves de seniorityContract são "<senioridade>|<forma>"). */
export const contractColumns = ['onlyClt', 'onlyPj', 'both'];

export type HeatRow = { name: string; total: number; data: { x: string; y: number; count: number }[] };

/** Uma linha por senioridade, uma coluna por forma de contratação; cada célula é a porcentagem da linha. */
export const seniorityContractRows = (counts: Record<string, number> = {}): HeatRow[] =>
    seniorities
        .map((seniority) => {
            const cells = contractColumns.map((contract) => ({ contract, count: counts[`${seniority.id}|${contract}`] || 0 }));
            const total = cells.reduce((sum, cell) => sum + cell.count, 0);
            const data = cells.map((cell) => ({ x: sliceLabel('contractType', cell.contract), y: total ? Math.round((cell.count * 1000) / total) / 10 : 0, count: cell.count }));
            return { name: seniority.nome, total, data };
        })
        // o heatmap do ApexCharts desenha a primeira série embaixo: Estágio fica no alto
        .reverse();

// ---------------------------------------------------------------------------------------------------------------------
// 6. Visualizações por dia da semana
// ---------------------------------------------------------------------------------------------------------------------

export const weekdays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

const dayKey = (date: Date) => `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;

const dateOf = (key: string) => new Date(Number(key.substring(0, 4)), Number(key.substring(4, 6)) - 1, Number(key.substring(6, 8)));

/**
 * A média por dia da semana dos registros inseridos em cada fonte, do primeiro dia do contador até ontem (hoje ainda
 * não acabou); os dias sem nenhum registro contam como zero.
 */
export const weekdayAverages = (byDay: TotalsByRegion = {}, now: Date) => {
    const readySources = sources.filter((source) => source.ready);
    const today = dayKey(now);
    const keys = readySources.flatMap((source) => Object.keys(byDay[source.id] || {})).filter((key) => key < today);
    if (keys.length == 0) return { days: 0, series: [] as { name: string; data: number[] }[] };
    const first = dateOf(keys.sort()[0]);
    const lastDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const daysOfEachWeekday = weekdays.map(() => 0);
    const sums = readySources.map(() => weekdays.map(() => 0));
    let days = 0;
    for (const date = new Date(first); date <= lastDay; date.setDate(date.getDate() + 1)) {
        const weekday = (date.getDay() + 6) % 7;
        daysOfEachWeekday[weekday]++;
        days++;
        readySources.forEach((source, index) => (sums[index][weekday] += byDay[source.id]?.[dayKey(date)] || 0));
    }
    const series = readySources.map((source, index) => ({
        name: source.line,
        data: sums[index].map((sum, weekday) => (daysOfEachWeekday[weekday] ? Math.round((sum * 10) / daysOfEachWeekday[weekday]) / 10 : 0)),
    }));
    return { days, series };
};
