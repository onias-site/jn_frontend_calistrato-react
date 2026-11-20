import { TICKET_KINDS } from '@/presentation/pages/meus-dados/chamados/ticketsFromGroups';
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

// as opções do combo da tela de listagem dos chamados (Meus dados > Chamados): os tipos do fale conosco (js) e, desde
// 2026-11-17, os chamados do vis (hierarquia, sugestão de habilidade e LinkedIn inválido), cada um com a sua chave no gráfico
const contactUsTypes: Record<string, string> = Object.fromEntries(TICKET_KINDS.map((kind) => [kind.value, kind.label]));

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

// a situação de cada sugestão do candidato (VisSuggestionStatuses no backend): sugestões de nova habilidade e itens das
// sugestões de associação / desassociação da hierarquia de habilidades, desde 2026-11-20
const suggestionStatuses: Record<string, string> = { approved: 'Aprovado', pending: 'Pendente', rejected: 'Rejeitado' };

/** Como cada gráfico aparece: pizza (o padrão), ranking em barras (Skills Evitadas) ou origem x objetivo (barras empilhadas). */
export type PieKind = 'pie' | 'ranking' | 'channelGoal';

type Pie = { id: string; title: string; labels?: Record<string, string>; help?: string; excluded?: string[]; kind?: PieKind; maxSlices?: number };

/** Os 14 gráficos da tela, na ordem pedida em 2026-11-17 (origem x objetivo e o ranking das Skills Evitadas desde a mesma data) e, no fim, as 3 pizzas das sugestões por situação (2026-11-20); os rótulos dos combos de onde os valores vieram, o texto do "?" e as chaves que ficam fora. */
export const pies: Pie[] = [
    { id: 'viewerDomains', title: 'Empresas que mais veem currículos', labels: viewerDomains },
    {
        id: 'notAllowedCompanies',
        title: 'Consultorias / Empresas já contratantes',
        help: 'Estas são as consultorias / empresas que os candidatos mais evitam enviar currículos, pois provavelmente já trabalham ou trabalharam nelas.',
    },
    { id: 'recruiterSources', title: 'Origem dos recrutadores', labels: recruiterSources, excluded: ['legacy'] },
    // uma fatia por opção do combo dos chamados, sem "Outras"
    { id: 'contactUsTypes', title: 'Chamados abertos por tipo', labels: contactUsTypes, maxSlices: TICKET_KINDS.length },
    { id: 'goals', title: 'Objetivos dos usuários', labels: goals },
    { id: 'channels', title: 'Origem do usuário', labels: channels },
    { id: 'channelGoals', title: 'Origem x objetivo do usuário', kind: 'channelGoal' },
    { id: 'resumeTypes', title: 'Áreas dos currículos', labels: resumeTypes },
    { id: 'resumeSituation', title: 'Situação do Currículo', labels: situations },
    {
        id: 'avoidedSkills',
        title: 'Skills Evitadas',
        help: 'Habilidades / Conceitos / Ferramentas que os donos dos currículos mais cadastram para não trabalharem com elas.',
        kind: 'ranking',
    },
    { id: 'resumeRegionScopes', title: 'DDDs do currículo', labels: regionScopes },
    { id: 'hierarchyAddStatuses', title: 'Sugestões de associação de hierarquia de habilidades', labels: suggestionStatuses },
    { id: 'hierarchyRemoveStatuses', title: 'Sugestões de desassociação de hierarquia de habilidades', labels: suggestionStatuses },
    { id: 'skillSuggestionStatuses', title: 'Sugestões de novas habilidades', labels: suggestionStatuses },
];

/**
 * As fatias de uma pizza, da maior para a menor (empate pelo rótulo); o que passar de MAX_SLICES vira uma fatia "Outras"
 * no fim. Sem rótulo conhecido, a chave aparece como veio; as chaves de excluded ficam fora (e fora do total).
 */
export const slicesOf = (counts: Record<string, number> = {}, labels: Record<string, string> = {}, excluded: string[] = [], maxSlices = MAX_SLICES): Slice[] => {
    const slices = Object.entries(counts)
        .filter(([key, total]) => total > 0 && !excluded.includes(key))
        .map(([key, total]) => ({ key, label: labels[key] || key, total: Math.round(total) }))
        .sort((a, b) => b.total - a.total || a.label.localeCompare(b.label, 'pt-BR'));
    if (slices.length <= maxSlices) return slices;
    const kept = slices.slice(0, maxSlices - 1);
    const rest = slices.slice(maxSlices - 1).reduce((sum, slice) => sum + slice.total, 0);
    return [...kept, { key: OTHERS, label: OTHERS, total: rest }];
};

/** O total geral de uma pizza, ao lado do título: "Total: 1.234". */
export const totalLabel = (total: number) => `Total: ${total.toLocaleString('pt-BR')}`;

/** A linha dos novos usuários: o total de cada período, 0 quando o contador não tem a chave. */
export const newUsersSeries = (counts: Record<string, number> = {}, periods: Period[]) => [
    { name: 'Novos usuários', data: periods.map((period) => Math.round(counts[period.key] || 0)) },
];
