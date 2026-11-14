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
    { id: 'clt', title: 'Pretensão CLT' },
    { id: 'pj', title: 'Pretensão PJ' },
];

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
};

const NOT_INFORMED = 'notInformed';

/** O que sobra das fatias vai para "Outras": acima de 8 cores não dá para distinguir as fatias. */
const PIE_SLICES = 7;

export const OTHERS = 'Outras';

/** 8000 vira "R$ 8.000". */
export const money = (value: number) => `R$ ${Math.round(value).toLocaleString('pt-BR')}`;

/** O rótulo de uma fatia: o backend manda códigos; idioma vem como "<nome>|<nível>" (2 fluente, 1 intermediário). */
export const sliceLabel = (chart: string, key: string): string => {
    if (key == NOT_INFORMED) {
        return 'Não informado';
    }
    if (chart == 'spokenLanguage') {
        const [name, level] = key.split('|');
        return `${name} ${level == '2' ? 'fluente' : 'intermediário'}`;
    }
    if (chart == 'clt' || chart == 'pj') {
        const start = Number(key);
        return `${money(start)} a ${money(start + 999)}`;
    }
    return fixedLabels[chart]?.[key] || key;
};

export type Slice = { key: string; label: string; total: number };

/** Faixas salariais: todas aparecem, em ordem crescente, com o "Não informado" por último. */
export const isSalaryChart = (chart: string) => chart == 'clt' || chart == 'pj';

const byRange = (a: Slice, b: Slice) => {
    if (a.key == NOT_INFORMED) {
        return 1;
    }
    if (b.key == NOT_INFORMED) {
        return -1;
    }
    return Number(a.key) - Number(b.key);
};

const byTotal = (a: Slice, b: Slice) => b.total - a.total || a.label.localeCompare(b.label);

/**
 * As fatias de um gráfico: as faixas salariais todas, em ordem crescente; as demais da maior para a menor e, acima de 8,
 * as 7 maiores mais "Outras" com a soma do resto.
 */
export const slicesOf = (chart: string, counts: Record<string, number> = {}): Slice[] => {
    const slices = Object.entries(counts).map(([key, total]) => ({ key, label: sliceLabel(chart, key), total }));
    if (isSalaryChart(chart)) {
        return slices.sort(byRange);
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

/** O nome da região de um ddd. */
export const regionName = (ddd: string) => (ddd == HOME_OFFICE ? 'Home office' : dddRegions.find((region) => region.id == ddd)?.nome || ddd);
