/**
 * Os cálculos das sugestões mantidas em 2026-11-17 na tela Curiosidades: o ranking das Skills Evitadas e a origem x
 * objetivo do usuário, cada uma com o seu painel em arquivo próprio.
 */

// ---------------------------------------------------------------------------------------------------------------------
// Ranking em barras (Skills Evitadas)
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
// Origem x objetivo
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
