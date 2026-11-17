import { CONTACT_US_TYPES } from '@/presentation/layouts/contactUsTypes';
import { Period, resumeTypes } from '../oferta-x-demanda/supplyAndDemandData';

/** A resposta de GET statistics/curiosities: um mapa {chave: total} por gráfico. */
export type Curiosities = Record<string, Record<string, number>>;

export type Slice = { key: string; label: string; total: number };

export const OTHERS = 'Outras';

/** Quantas fatias a pizza mostra antes de juntar o resto em "Outras". */
export const MAX_SLICES = 8;

const goals: Record<string, string> = { jobs: 'Salários e Empregos', recruiting: 'Ver currículos' };

const channels: Record<string, string> = {
    linkedin: 'Por alguém ou por anúncio no linkedin',
    telegram: 'Grupos de vagas no telegram',
    friends: 'Indicação de amigos',
    others: 'Outros',
};

const situations: Record<string, string> = { active: 'Ativo', inactive: 'Inativo' };

const viewerDomains: Record<string, string> = { freelancer: 'Recrutadores com e-mail pessoal' };

const contactUsTypes: Record<string, string> = Object.fromEntries(CONTACT_US_TYPES.map((type) => [type.value, type.label]));

// a origem de cada recrutador (source de vis_recruiter); a legacy (a carga do JobsNow antigo) não entra no gráfico
const recruiterSources: Record<string, string> = {
    telegram: 'Grupos de vagas no telegram',
    login: 'Cadastro no site',
    support: 'Cadastrado pelo suporte',
};

// o alcance dos ddds de cada currículo ativo (VisResumeRegionScopeCounterKeys no backend)
const regionScopes: Record<string, string> = {
    homeOfficeOnly: 'Aceita somente HomeOffice',
    oneRegion: 'Trabalha em apenas uma região',
    severalRegions: 'Trabalha em mais de uma região',
    anyRegion: 'Trabalha em qualquer região',
};

type Pie = { id: string; title: string; labels?: Record<string, string>; help?: string; excluded?: string[] };

/** As 10 pizzas da tela, na ordem pedida em 2026-11-17; os rótulos dos combos de onde os valores vieram, o texto do "?" e as chaves que ficam fora. */
export const pies: Pie[] = [
    { id: 'viewerDomains', title: 'Empresas que mais veem currículos', labels: viewerDomains },
    {
        id: 'notAllowedCompanies',
        title: 'Consultorias / Empresas já contratantes',
        help: 'Estas são as consultorias / empresas que os candidatos mais evitam enviar currículos, pois provavelmente já trabalham ou trabalharam nelas.',
    },
    { id: 'recruiterSources', title: 'Origem dos recrutadores', labels: recruiterSources, excluded: ['legacy'] },
    { id: 'contactUsTypes', title: 'Chamados abertos por tipo', labels: contactUsTypes },
    { id: 'goals', title: 'Objetivos dos usuários', labels: goals },
    { id: 'channels', title: 'Origem do usuário', labels: channels },
    { id: 'resumeTypes', title: 'Áreas dos currículos', labels: resumeTypes },
    { id: 'resumeSituation', title: 'Situação do Currículo', labels: situations },
    {
        id: 'avoidedSkills',
        title: 'Skills Evitadas',
        help: 'Habilidades / Conceitos / Ferramentas que os donos dos currículos mais cadastram para não trabalharem com elas.',
    },
    { id: 'resumeRegionScopes', title: 'DDDs do currículo', labels: regionScopes },
];

/**
 * As fatias de uma pizza, da maior para a menor (empate pelo rótulo); o que passar de MAX_SLICES vira uma fatia "Outras"
 * no fim. Sem rótulo conhecido, a chave aparece como veio; as chaves de excluded ficam fora (e fora do total).
 */
export const slicesOf = (counts: Record<string, number> = {}, labels: Record<string, string> = {}, excluded: string[] = []): Slice[] => {
    const slices = Object.entries(counts)
        .filter(([key, total]) => total > 0 && !excluded.includes(key))
        .map(([key, total]) => ({ key, label: labels[key] || key, total: Math.round(total) }))
        .sort((a, b) => b.total - a.total || a.label.localeCompare(b.label, 'pt-BR'));
    if (slices.length <= MAX_SLICES) return slices;
    const kept = slices.slice(0, MAX_SLICES - 1);
    const rest = slices.slice(MAX_SLICES - 1).reduce((sum, slice) => sum + slice.total, 0);
    return [...kept, { key: OTHERS, label: OTHERS, total: rest }];
};

/** O total geral de uma pizza, ao lado do título: "Total: 1.234". */
export const totalLabel = (total: number) => `Total: ${total.toLocaleString('pt-BR')}`;

/** A linha dos novos usuários: o total de cada período, 0 quando o contador não tem a chave. */
export const newUsersSeries = (counts: Record<string, number> = {}, periods: Period[]) => [
    { name: 'Novos usuários', data: periods.map((period) => Math.round(counts[period.key] || 0)) },
];
