import { dddRegions } from '@/presentation/components/regions/dddRegions';

/** O ddd do home office, que o formulário do currículo grava junto das regiões metropolitanas. */
export const HOME_OFFICE = '10';

/**
 * Os gráficos que o backend devolve (GET statistics/resumes/{ddd}), na ordem da tela. Os de sim/não (PCD, viagens,
 * pretensão negociável, disponibilidade imediata e trabalho temporário) não têm painel próprio: vão juntos no painel
 * "Perfil dos currículos" (profileItems). O "profile" marca onde esse painel entra.
 */
export const charts = [
    { id: 'gap', title: 'O que os recrutadores procuram mais do que existe' },
    { id: 'resumeType', title: 'Tipo do currículo' },
    { id: 'seniority', title: 'Senioridade' },
    { id: 'skill', title: 'Habilidades' },
    { id: 'spokenLanguage', title: 'Idiomas falados' },
    { id: 'profile', title: 'Perfil dos currículos' },
    { id: 'contractType', title: 'Formas de contratação aceitas' },
    { id: 'seniorityContract', title: 'Senioridade x contratação' },
    { id: 'salaryBySeniority', title: 'Pretensão salarial por senioridade' },
    { id: 'cltRange', title: 'Faixas de pretensão CLT' },
    { id: 'pjRange', title: 'Faixas de pretensão PJ' },
    { id: 'skillsCount', title: 'Quantidade de habilidades declaradas' },
];

/** O id do painel que junta os gráficos de sim/não. */
export const PROFILE = 'profile';

/**
 * Os gráficos de sim/não do painel "Perfil dos currículos": a chave que conta como "sim" e o texto da barra. Cada
 * currículo cai em uma só chave de cada gráfico, então a soma das chaves é o total de currículos.
 */
export const profileItems = [
    { chart: 'disponibility', yes: 'immediate', label: 'Disponibilidade imediata' },
    { chart: 'negotiableClaim', yes: 'true', label: 'Negocia a pretensão salarial' },
    { chart: 'travel', yes: 'true', label: 'Aceita viajar' },
    { chart: 'temporallyJob', yes: 'accepts', label: 'Aceita trabalho temporário' },
    { chart: 'pcd', yes: 'true', label: 'PCD' },
];

/**
 * Gráficos em que um currículo conta em várias fatias (várias habilidades, vários idiomas): as fatias somam mais que os
 * currículos, então não são pizza; cada barra é a porcentagem dos currículos que têm o item.
 */
export const multiValueCharts = ['skill', 'spokenLanguage'];

export const isMultiValue = (chart: string) => multiValueCharts.includes(chart);

/** Quantas categorias os gráficos de vários valores mostram: os itens mais frequentes. */
export const MULTI_VALUE_BARS = 12;

/** Quantos itens diferentes o gráfico tem: a tela diz quando mostra só os mais frequentes. */
export const distinctItems = (counts: Record<string, number> = {}) => Object.keys(counts).length;

/** Abaixo disto, as porcentagens de uma região oscilam muito: a tela avisa que a amostra é pequena. */
export const SMALL_SAMPLE = 10;

export const isSmallSample = (total: number) => total > 0 && total < SMALL_SAMPLE;

/** As faixas das pretensões CLT e PJ (cltRange e pjRange do backend), em ordem. */
const salaryRanges = ['upTo3k', 'from3kTo6k', 'from6kTo10k', 'from10kTo15k', 'from15kTo20k', 'over20k'];

const salaryRangeLabels = { upTo3k: 'Até R$ 3 mil', from3kTo6k: 'R$ 3 a 6 mil', from6kTo10k: 'R$ 6 a 10 mil', from10kTo15k: 'R$ 10 a 15 mil', from15kTo20k: 'R$ 15 a 20 mil', over20k: 'Mais de R$ 20 mil' };

/** Gráficos de faixas ou categorias com ordem própria: as categorias seguem esta ordem, não o tamanho. */
const fixedOrders: Record<string, string[]> = {
    skillsCount: ['upTo5', 'from6To15', 'from16To30', 'from31To50', 'over50'],
    contractType: ['onlyClt', 'onlyPj', 'both', 'notInformed'],
    seniority: ['estag', 'junior', 'pleno', 'senior', 'especialista', 'notInformed'],
    cltRange: salaryRanges,
    pjRange: salaryRanges,
};

/** 12.345 vira "12,3%". */
export const percentText = (percent: number) => `${percent.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;

const percentOf = (count: number, base: number) => (base ? Math.round((count * 1000) / base) / 10 : 0);

/**
 * De onde vêm os números de cada gráfico e de cada coluna da tabela: os grupos do jn_grouper do ddd que o backend devolve
 * (resumes e viewedResumes), lado a lado em cada gráfico. Vagas ainda não têm grupo: ficam fora dos gráficos e as colunas
 * da tabela ficam com "—".
 */
export const sources = [
    { id: 'resumes', button: 'CVs', column: 'CVs', one: 'currículo', many: 'currículos', line: 'Currículos inseridos', ready: true },
    { id: 'viewedResumes', button: 'CVs vistos', column: 'Visualizações', one: 'visualização', many: 'visualizações', line: 'Visualizações feitas', ready: true },
    { id: 'vacancies', button: 'Vagas', column: 'Vagas', one: 'vaga', many: 'vagas', line: 'Vagas publicadas', ready: false },
];

export type Source = (typeof sources)[number];

/** 1 vira "1 currículo"; 7 vira "7 visualizações". */
export const countLabel = (source: Source, total: number) => `${total} ${total == 1 ? source.one : source.many}`;

/** Os totais por ddd de cada fonte (GET statistics/resumes/totals): { resumes: { "11": 15 }, viewedResumes: {...} }. */
export type TotalsByRegion = Record<string, Record<string, number>>;

/**
 * O texto dos totais de uma pasta: a soma dos ddds dela em cada fonte que já tem dados ("15 currículos · 22
 * visualizações"). Um currículo com dois ddds do mesmo estado conta nos dois.
 */
export const folderTotals = (totals: TotalsByRegion, ddds: string[]) =>
    sources
        .filter((source) => source.ready)
        .map((source) => countLabel(source, ddds.reduce((sum, ddd) => sum + (totals[source.id]?.[ddd] || 0), 0)))
        .join(' · ');

/**
 * Tudo o que a página lê ao abrir (GET statistics/resumes/totals): os totais por ddd (títulos das pastas) e as inserções
 * por dia (yyyyMMdd) e por mês (yyyyMM) de cada fonte (gráfico de linhas). Contam só os registros ativos.
 */
export type Totals = { byRegion?: TotalsByRegion; byDay?: TotalsByRegion; byMonth?: TotalsByRegion };

const monthNames = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

const twoDigits = (value: number) => String(value).padStart(2, '0');

const yearMonthKey = (year: number, month: number) => `${year}${twoDigits(month + 1)}`;

/** "novembro de 2026": o mês corrente, para o título do gráfico por dia. */
export const monthTitle = (now: Date) => `${monthNames[now.getMonth()]} de ${now.getFullYear()}`;

/** Um ponto do eixo x do gráfico de linhas: a chave do contador no backend e o rótulo da tela. */
export type Period = { key: string; label: string };

/** Os dias do mês corrente até hoje: { key: '20261114', label: '14' }. */
export const daysOfTheMonth = (now: Date): Period[] => {
    const prefix = yearMonthKey(now.getFullYear(), now.getMonth());
    return Array.from({ length: now.getDate() }, (_, index) => ({ key: `${prefix}${twoDigits(index + 1)}`, label: twoDigits(index + 1) }));
};

/** Os últimos meses, o corrente por último: { key: '202611', label: 'nov/26' }. */
export const lastMonths = (now: Date, count: number): Period[] =>
    Array.from({ length: count }, (_, index) => {
        const moment = new Date(now.getFullYear(), now.getMonth() - (count - 1 - index), 1);
        const label = `${monthNames[moment.getMonth()].substring(0, 3)}/${String(moment.getFullYear()).substring(2)}`;
        return { key: yearMonthKey(moment.getFullYear(), moment.getMonth()), label };
    });

/** O cabeçalho da dica do gráfico de linhas: "Dia 14" ou "Mês nov/26" (o eixo x fica só com "14" ou "nov/26"). */
export const periodTooltipLabel = (byDay: boolean, label: string) => (byDay ? `Dia ${label}` : `Mês ${label}`);

/** Uma linha por fonte que já tem dados, com o total de cada período (0 quando o contador não tem a chave). */
export const insertionSeries = (counts: TotalsByRegion = {}, periods: Period[]) =>
    sources
        .filter((source) => source.ready)
        .map((source) => ({ name: source.line, data: periods.map((period) => counts[source.id]?.[period.key] || 0) }));

/** As senioridades do backend (VisSeniorityType, sem a indefinida), na ordem da tabela de médias. */
export const seniorities = [
    { id: 'estag', nome: 'Estágio' },
    { id: 'junior', nome: 'Júnior' },
    { id: 'pleno', nome: 'Pleno' },
    { id: 'senior', nome: 'Sênior' },
    { id: 'especialista', nome: 'Especialista' },
];

export const resumeTypes: Record<string, string> = {
    '1': 'Tecnologia da Informação',
    '2': 'Recrutamento e seleção',
    '3': 'Nível Superior',
    '4': 'Profissão de nível operacional',
};

const fixedLabels: Record<string, Record<string, string>> = {
    resumeType: resumeTypes,
    seniority: Object.fromEntries(seniorities.map((seniority) => [seniority.id, seniority.nome])),
    pcd: { true: 'Sim', false: 'Não' },
    travel: { true: 'Sim', false: 'Não' },
    negotiableClaim: { true: 'Sim', false: 'Não' },
    disponibility: { immediate: 'Imediata', notImmediate: 'Não Imediata' },
    temporallyJob: { accepts: 'Aceita', doesNotAccept: 'Não aceita' },
    skillsCount: { upTo5: 'Até 5', from6To15: 'De 6 a 15', from16To30: 'De 16 a 30', from31To50: 'De 31 a 50', over50: 'Mais de 50' },
    contractType: { onlyClt: 'Aceita apenas CLT', onlyPj: 'Aceita apenas PJ', both: 'Aceita ambos' },
    cltRange: salaryRangeLabels,
    pjRange: salaryRangeLabels,
};

const NOT_INFORMED = 'notInformed';

/** A fatia dos currículos que não falam nenhum idioma. */
const NO_LANGUAGE = 'none';

/** 8000 vira "R$ 8.000". */
export const money = (value: number) => `R$ ${Math.round(value).toLocaleString('pt-BR')}`;

/** 4.5 vira "4,5 anos"; 1 vira "1 ano". */
export const yearsLabel = (years: number) => `${years.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} ${years == 1 ? 'ano' : 'anos'}`;

/** O rótulo de uma fatia: o backend manda códigos; idioma vem como "<nome>|<nível>" (2 fluente, 1 intermediário). */
export const sliceLabel = (chart: string, key: string): string => {
    if (key == NOT_INFORMED) {
        return 'Não informado';
    }
    if (chart == 'spokenLanguage' && key == NO_LANGUAGE) {
        return 'Nenhum Idioma';
    }
    if (chart == 'spokenLanguage') {
        const [name, level] = key.split('|');
        return `${name} ${level == '2' ? 'fluente' : 'intermediário'}`;
    }
    return fixedLabels[chart]?.[key] || key;
};

/** As pastas da árvore: o home office e, por estado, as regiões metropolitanas do formulário do currículo. */
export const regionTree = () => {
    const byState: Record<string, { value: string; label: string }[]> = {};
    for (const region of dddRegions) {
        const state = region.nome.split('– ').pop() || '';
        (byState[state] = byState[state] || []).push({ value: region.id, label: region.nome });
    }
    const states = Object.keys(byState).sort((a, b) => a.localeCompare(b));
    return [
        { value: HOME_OFFICE, label: 'Home office' },
        ...states.map((state) => ({ value: `uf-${state}`, label: state, children: byState[state] })),
    ];
};

export type FolderNode = { value: string; label: string; children?: FolderNode[] };

/** A ordem das pastas: mais visualizações, depois mais vagas (quando houver), depois mais currículos, por fim o nome. */
const folderSortSources = ['viewedResumes', 'vacancies', 'resumes'];

const dddsOf = (node: FolderNode) => (node.children ? node.children.map((child) => child.value) : [node.value]);

const folderTotal = (totals: TotalsByRegion, node: FolderNode, sourceId: string) =>
    dddsOf(node).reduce((sum, ddd) => sum + (totals[sourceId]?.[ddd] || 0), 0);

/**
 * As pastas ordenadas pelos totais de cada fonte, na ordem de folderSortSources, e no empate pelo nome; o mesmo critério
 * vale para as regiões dentro de cada estado. Sem os totais, só pelo nome.
 */
export const sortFolders = (nodes: FolderNode[], totals: TotalsByRegion = {}): FolderNode[] =>
    nodes
        .map((node) => (node.children ? { ...node, children: sortFolders(node.children, totals) } : node))
        .sort((a, b) => {
            for (const sourceId of folderSortSources) {
                const difference = folderTotal(totals, b, sourceId) - folderTotal(totals, a, sourceId);
                if (difference != 0) return difference;
            }
            return a.label.localeCompare(b.label);
        });

/** A base das porcentagens: os currículos da fonte nos gráficos de vários valores, a soma das fatias nos demais. */
export const percentBase = (chart: string, sourceTotal: number, counts: Record<string, number> = {}) =>
    isMultiValue(chart) ? sourceTotal : Object.values(counts).reduce((sum, count) => sum + count, 0);

export type ProfileBar = { label: string; yes: number; total: number; percent: number };

/** As barras do painel "Perfil dos currículos" de uma fonte: quantos dizem "sim" em cada item, sobre todos da fonte. */
export const profileOf = (chartsOfSource: Record<string, Record<string, number>> = {}): ProfileBar[] =>
    profileItems.map((item) => {
        const counts = chartsOfSource[item.chart] || {};
        const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
        const yes = counts[item.yes] || 0;
        return { label: item.label, yes, total, percent: percentOf(yes, total) };
    });

/** Uma série das barras agrupadas: a fonte, a porcentagem de cada categoria e a quantidade por trás dela. */
export type ComparisonSeries = { name: string; source: Source; data: number[]; counts: number[] };

/** As barras agrupadas de um gráfico: as categorias e uma série por fonte. */
export type Comparison = { categories: string[]; series: ComparisonSeries[] };

export type SourceCounts = { source: Source; total: number; counts?: Record<string, number> };

/**
 * As fontes lado a lado num gráfico de barras agrupadas (CVs x CVs vistos): cada série é uma fonte, cada categoria um
 * valor do gráfico, em porcentagem da base de cada fonte (as fontes têm tamanhos diferentes, os números absolutos não
 * se comparam). A ordem é a própria do gráfico ou a da primeira fonte (a maior primeira); nos gráficos de vários valores
 * ficam só os MULTI_VALUE_BARS mais frequentes.
 */
export const comparisonOf = (chart: string, bySource: SourceCounts[]): Comparison => {
    const keys = Array.from(new Set(bySource.flatMap((item) => Object.keys(item.counts || {}))));
    const first = bySource[0]?.counts || {};
    const order = fixedOrders[chart];
    const sorted = order
        ? keys.sort((a, b) => order.indexOf(a) - order.indexOf(b))
        : keys.sort((a, b) => (first[b] || 0) - (first[a] || 0) || sliceLabel(chart, a).localeCompare(sliceLabel(chart, b)));
    const ordered = isMultiValue(chart) ? sorted.slice(0, MULTI_VALUE_BARS) : sorted;
    const series = bySource.map((item) => {
        const base = percentBase(chart, item.total, item.counts);
        const counts = ordered.map((key) => item.counts?.[key] || 0);
        return { name: item.source.button, source: item.source, data: counts.map((count) => percentOf(count, base)), counts };
    });
    return { categories: ordered.map((key) => sliceLabel(chart, key)), series };
};

/** O perfil lado a lado: uma série por fonte, uma categoria por item de sim/não. */
export const profileComparisonOf = (bySource: { source: Source; charts?: Record<string, Record<string, number>> }[]): Comparison => ({
    categories: profileItems.map((item) => item.label),
    series: bySource.map((item) => {
        const bars = profileOf(item.charts);
        return { name: item.source.button, source: item.source, data: bars.map((bar) => bar.percent), counts: bars.map((bar) => bar.yes) };
    }),
});

/** O nome da região de um ddd. */
export const regionName = (ddd: string) => (ddd == HOME_OFFICE ? 'Home office' : dddRegions.find((region) => region.id == ddd)?.nome || ddd);
