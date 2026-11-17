import { CONTACT_US_TYPES } from '@/presentation/layouts/contactUsTypes';
import { Curiosities } from './curiositiesData';

/**
 * Os cálculos das sugestões aplicadas em 2026-11-17 na tela Curiosidades, um bloco por sugestão (cada uma com o seu
 * painel em arquivo próprio): para retirar uma, apague o painel, a linha dela na tela e o bloco daqui.
 */

const stripAccents = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '');

// ---------------------------------------------------------------------------------------------------------------------
// 1. Consultorias / empresas já contratantes: sem e-mails nem "nenhuma", e as grafias da mesma empresa juntas
// ---------------------------------------------------------------------------------------------------------------------

/** Respostas que dizem "nenhuma empresa": não são empresa nenhuma. */
const noCompany = ['nenhuma', 'nenhum', 'nao', 'nada', 'na', 'n/a', '-', '.', 'x', 'sem', 'nenhuma empresa'];

/** Sufixos que a mesma empresa ganha em grafias diferentes (Inexti, Inexbr, Inexconsulting). */
const companySuffixes = ['consultoria', 'consulting', 'tecnologia', 'brasil', 'ltda', 'sa', 'br', 'ti'];

const MINIMUM_STEM = 3;

/** O texto da empresa só com letras e números, sem acento e em minúsculas: "Inex Consulting" vira "inexconsulting". */
export const companyName = (text: string) => stripAccents(text).toLowerCase().replace(/[^a-z0-9]/g, '');

/** A raiz do nome sem um dos sufixos de companySuffixes, quando sobra o bastante: "inexconsulting" vira "inex". */
const stemOf = (name: string) => {
    const suffix = companySuffixes.find((item) => name.endsWith(item) && name.length - item.length >= MINIMUM_STEM);
    return suffix ? name.substring(0, name.length - suffix.length) : name;
};

/** Um e-mail digitado no lugar da empresa: dado pessoal, nunca vai para um gráfico público. */
export const looksLikeEmail = (text: string) => text.includes('@');

/**
 * As consultorias limpas: fora os e-mails e as respostas "nenhuma"; as grafias da mesma empresa (mesmo nome sem
 * acentos, espaços e pontuação, ou a mesma raiz sem um sufixo como "ti" ou "consulting" quando há mais de uma grafia
 * com essa raiz) somam numa só, com o rótulo da grafia mais frequente.
 */
export const cleanCompanies = (counts: Record<string, number> = {}): Record<string, number> => {
    const entries = Object.entries(counts).filter(([key]) => !looksLikeEmail(key) && !noCompany.includes(stripAccents(key).toLowerCase().trim()) && companyName(key) != '');
    const stems = entries.map(([key]) => stemOf(companyName(key)));
    const groupOf = (index: number) => {
        const stem = stems[index];
        const shared = stems.filter((item) => item == stem).length > 1 || entries.some(([key]) => companyName(key) == stem);
        return shared ? stem : companyName(entries[index][0]);
    };
    const groups: Record<string, { label: string; best: number; total: number }> = {};
    entries.forEach(([key, total], index) => {
        const group = groupOf(index);
        const current = groups[group] || { label: key, best: 0, total: 0 };
        const label = total > current.best ? key : current.label;
        groups[group] = { label, best: Math.max(current.best, total), total: current.total + total };
    });
    return Object.fromEntries(Object.values(groups).map((group) => [group.label, group.total]));
};

// ---------------------------------------------------------------------------------------------------------------------
// 2. Empresas que mais veem currículos: sem a equipe Onias.Site
// ---------------------------------------------------------------------------------------------------------------------

/** Os domínios da própria equipe: quem olha currículo para dar suporte não é empresa recrutando. */
export const OWN_DOMAINS = ['onias.site'];

// ---------------------------------------------------------------------------------------------------------------------
// 3. Ranking em barras no lugar das pizzas grandes
// ---------------------------------------------------------------------------------------------------------------------

/** Quantos itens o ranking mostra. */
export const RANKING_SIZE = 10;

export type RankingItem = { label: string; total: number };

/** Os RANKING_SIZE maiores, do maior para o menor (empate pelo rótulo), e quantos itens há ao todo. */
export const rankingOf = (counts: Record<string, number> = {}, labels: Record<string, string> = {}, excluded: string[] = []) => {
    const items = Object.entries(counts)
        .filter(([key, total]) => total > 0 && !excluded.includes(key))
        .map(([key, total]) => ({ label: labels[key] || key, total: Math.round(total) }))
        .sort((a, b) => b.total - a.total || a.label.localeCompare(b.label, 'pt-BR'));
    return { items: items.slice(0, RANKING_SIZE), distinct: items.length };
};

// ---------------------------------------------------------------------------------------------------------------------
// 4 e 5. Números de destaque e taxa de desistência do currículo
// ---------------------------------------------------------------------------------------------------------------------

const sum = (counts: Record<string, number> = {}, excluded: string[] = []) =>
    Object.entries(counts)
        .filter(([key]) => !excluded.includes(key))
        .reduce((total, [, count]) => total + Math.round(count), 0);

const monthKey = (now: Date) => `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;

export type Highlight = { label: string; value: string; detail?: string };

const integer = (value: number) => value.toLocaleString('pt-BR');

/** 2.5 vira "2,5%". */
export const percentText = (value: number) => `${value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;

/**
 * Os cartões do topo: novos usuários no mês corrente, currículos ativos (com a taxa de desistência: os inativos sobre
 * todos), recrutadores sem a carga legada e chamados ainda sem resposta.
 */
export const highlightsOf = (curiosities: Curiosities, now: Date): Highlight[] => {
    const active = Math.round(curiosities.resumeSituation?.active || 0);
    const inactive = Math.round(curiosities.resumeSituation?.inactive || 0);
    const allResumes = active + inactive;
    const withdrawal = allResumes ? Math.round((inactive * 1000) / allResumes) / 10 : 0;
    return [
        { label: 'Novos usuários no mês', value: integer(Math.round(curiosities.newUsersByMonth?.[monthKey(now)] || 0)) },
        { label: 'Currículos ativos', value: integer(active), detail: `${percentText(withdrawal)} dos currículos foram desativados` },
        { label: 'Recrutadores', value: integer(sum(curiosities.recruiterSources, ['legacy'])), detail: 'sem os da base antiga' },
        { label: 'Chamados sem resposta', value: integer(sum(curiosities.pendingContactUsTypes)), detail: `de ${integer(sum(curiosities.contactUsTypes))} abertos` },
    ];
};

// ---------------------------------------------------------------------------------------------------------------------
// 6. Origem x objetivo
// ---------------------------------------------------------------------------------------------------------------------

export const channelLabels: Record<string, string> = {
    linkedin: 'LinkedIn',
    telegram: 'Grupos do Telegram',
    friends: 'Indicação de amigos',
    others: 'Outros',
};

export const goalLabels: Record<string, string> = { jobs: 'Buscam emprego', recruiting: 'Recrutam' };

/**
 * Uma barra por origem com os objetivos empilhados ({"<channel>|<goal>": n} do backend): as origens da que traz mais
 * usuários para a que traz menos, uma série por objetivo.
 */
export const channelGoalChart = (counts: Record<string, number> = {}) => {
    const pairs = Object.entries(counts).map(([key, total]) => ({ channel: key.split('|')[0], goal: key.split('|')[1], total: Math.round(total) }));
    const channels = Array.from(new Set(pairs.map((pair) => pair.channel)));
    const totalOf = (channel: string) => pairs.filter((pair) => pair.channel == channel).reduce((total, pair) => total + pair.total, 0);
    channels.sort((a, b) => totalOf(b) - totalOf(a));
    const goals = Object.keys(goalLabels).filter((goal) => pairs.some((pair) => pair.goal == goal));
    const series = goals.map((goal) => ({ name: goalLabels[goal], data: channels.map((channel) => pairs.find((pair) => pair.channel == channel && pair.goal == goal)?.total || 0) }));
    return { categories: channels.map((channel) => channelLabels[channel] || channel), series };
};

// ---------------------------------------------------------------------------------------------------------------------
// 7. Chamados respondidos x sem resposta
// ---------------------------------------------------------------------------------------------------------------------

const contactUsTypeLabels: Record<string, string> = Object.fromEntries(CONTACT_US_TYPES.map((type) => [type.value, type.label]));

/**
 * Uma barra por tipo de chamado: os já respondidos (todos os abertos menos os que esperam) e os que esperam resposta,
 * empilhados; os tipos do que tem mais chamados para o que tem menos.
 */
export const contactUsStatusChart = (opened: Record<string, number> = {}, pending: Record<string, number> = {}) => {
    const types = Object.keys(opened)
        .filter((type) => opened[type] > 0)
        .sort((a, b) => opened[b] - opened[a]);
    const waiting = types.map((type) => Math.round(pending[type] || 0));
    const answered = types.map((type, index) => Math.max(0, Math.round(opened[type]) - waiting[index]));
    return {
        categories: types.map((type) => contactUsTypeLabels[type] || type),
        series: [
            { name: 'Respondidos', data: answered },
            { name: 'Sem resposta', data: waiting },
        ],
    };
};

// ---------------------------------------------------------------------------------------------------------------------
// 8. Novos usuários por dia da semana
// ---------------------------------------------------------------------------------------------------------------------

export const weekdays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

const dayKey = (date: Date) => `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;

const dateOf = (key: string) => new Date(Number(key.substring(0, 4)), Number(key.substring(4, 6)) - 1, Number(key.substring(6, 8)));

/**
 * A média de novos usuários em cada dia da semana, do primeiro dia do contador até ontem (hoje ainda não acabou); os
 * dias sem nenhum novo usuário contam como zero.
 */
export const newUsersByWeekday = (byDay: Record<string, number> = {}, now: Date) => {
    const today = dayKey(now);
    const keys = Object.keys(byDay)
        .filter((key) => key < today)
        .sort();
    if (keys.length == 0) return { days: 0, data: [] as number[] };
    const lastDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const daysOfEachWeekday = weekdays.map(() => 0);
    const sums = weekdays.map(() => 0);
    let days = 0;
    for (const date = dateOf(keys[0]); date <= lastDay; date.setDate(date.getDate() + 1)) {
        const weekday = (date.getDay() + 6) % 7;
        daysOfEachWeekday[weekday]++;
        days++;
        sums[weekday] += Math.round(byDay[dayKey(date)] || 0);
    }
    const data = sums.map((total, weekday) => (daysOfEachWeekday[weekday] ? Math.round((total * 10) / daysOfEachWeekday[weekday]) / 10 : 0));
    return { days, data };
};
