import { dddRegions } from '@/presentation/components/regions/dddRegions';

/** O ddd do home office, que o formulário do currículo grava junto das regiões metropolitanas. */
export const HOME_OFFICE = '10';

/** Os gráficos de pizza que o backend devolve (GET statistics/resumes/{ddd}), na ordem da tela. */
export const charts = [
    { id: 'resumeType', title: 'Tipo do currículo' },
    { id: 'spokenLanguage', title: 'Idiomas falados' },
    { id: 'skill', title: 'Habilidades' },
    { id: 'seniority', title: 'Senioridade' },
    { id: 'pcd', title: 'PCD' },
    { id: 'travel', title: 'Disponibilidade para viagens' },
    { id: 'disponibility', title: 'Disponibilidade' },
    { id: 'temporallyJob', title: 'Trabalho temporário' },
    { id: 'skillsCount', title: 'Quantidade de habilidades declaradas' },
    { id: 'contractType', title: 'Formas de contratação aceitas' },
];

/** Gráficos de faixas ou categorias com ordem própria: as fatias seguem esta ordem, não o tamanho. */
const fixedOrders: Record<string, string[]> = {
    skillsCount: ['upTo5', 'from6To15', 'from16To30', 'from31To50', 'over50'],
    contractType: ['onlyClt', 'onlyPj', 'both', 'notInformed'],
};

/**
 * De onde vêm os números de cada gráfico e de cada coluna da tabela: os grupos do jn_grouper do ddd que o backend devolve
 * (resumes e viewedResumes). Vagas ainda não têm grupo: o botão aparece desligado e as colunas ficam com "—".
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

const resumeTypes: Record<string, string> = {
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
    disponibility: { immediate: 'Imediata', notImmediate: 'Não Imediata' },
    temporallyJob: { accepts: 'Aceita', doesNotAccept: 'Não aceita' },
    skillsCount: { upTo5: 'Até 5', from6To15: 'De 6 a 15', from16To30: 'De 16 a 30', from31To50: 'De 31 a 50', over50: 'Mais de 50' },
    contractType: { onlyClt: 'Aceita apenas CLT', onlyPj: 'Aceita apenas PJ', both: 'Aceita ambos' },
};

const NOT_INFORMED = 'notInformed';

/** A fatia dos currículos que não falam nenhum idioma. */
const NO_LANGUAGE = 'none';

/** O que sobra das fatias vai para "Outras": acima de 8 cores não dá para distinguir as fatias. */
const PIE_SLICES = 7;

export const OTHERS = 'Outras';

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
        return 'Nenhum';
    }
    if (chart == 'spokenLanguage') {
        const [name, level] = key.split('|');
        return `${name} ${level == '2' ? 'fluente' : 'intermediário'}`;
    }
    return fixedLabels[chart]?.[key] || key;
};

export type Slice = { key: string; label: string; total: number };

const byTotal = (a: Slice, b: Slice) => b.total - a.total || a.label.localeCompare(b.label);

/**
 * As fatias de um gráfico: na ordem própria do gráfico, quando ele tem uma; senão da maior para a menor e, acima de 8, as
 * 7 maiores mais "Outras" com a soma do resto.
 */
export const slicesOf = (chart: string, counts: Record<string, number> = {}): Slice[] => {
    const slices = Object.entries(counts).map(([key, total]) => ({ key, label: sliceLabel(chart, key), total }));
    const order = fixedOrders[chart];
    if (order) {
        return slices.sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));
    }
    const sorted = slices.sort(byTotal);
    if (sorted.length <= PIE_SLICES + 1) {
        return sorted;
    }
    const others = sorted.slice(PIE_SLICES).reduce((sum, slice) => sum + slice.total, 0);
    return [...sorted.slice(0, PIE_SLICES), { key: OTHERS, label: OTHERS, total: others }];
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

/** O nome da região de um ddd. */
export const regionName = (ddd: string) => (ddd == HOME_OFFICE ? 'Home office' : dddRegions.find((region) => region.id == ddd)?.nome || ddd);
