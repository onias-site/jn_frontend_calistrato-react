// Cotas diárias dos chamados que o usuário abre com o suporte (desde 2026-11-07). Cada chamado manda e-mail e pesa no
// backend, que aceita um por grupo de cota a cada 24 horas (jn_ticket_daily_limit, 429). Esta marca no navegador,
// individualizada por e-mail, evita até mesmo ir ao backend quando já se sabe que a requisição seria recusada: depois de
// 24 horas do envio ela vence e o usuário pode abrir de novo. Mesmos valores do enum JnTicketQuotaGroups do backend.
export type TicketQuotaGroup = 'sharedTickets' | 'clarifyDoubts' | 'makeCriticism';

const STORAGE_KEY = 'ticketDailyQuotas';
export const ONE_DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

// O que o usuário já não pode abrir enquanto a cota do grupo estiver gasta
const GROUP_LABELS: Record<TicketQuotaGroup, string> = {
    sharedTickets: 'um chamado de sugestão de habilidade, ajuste de hierarquia ou fale conosco (exceto bug, dúvida e crítica)',
    clarifyDoubts: 'uma dúvida pelo fale conosco',
    makeCriticism: 'uma crítica pelo fale conosco',
};

// Os chamados que o usuário abre: os tipos do fale conosco mais a sugestão de habilidade e o ajuste de hierarquia (vis)
export type TicketKind = 'reportBug' | 'makeCompliment' | 'makeCriticism' | 'makeSuggestion' | 'makeComment' | 'clarifyDoubts' | 'skillSuggestion' | 'skillFixHierarchy';

interface TicketKindTexts {
    // o que o diálogo pergunta se o usuário deseja enviar
    thisTicket: string;
    // como o chamado aparece na lista dos que ficam bloqueados pela cota compartilhada
    asBlocked: string;
}

const TICKET_KIND_TEXTS: Record<TicketKind, TicketKindTexts> = {
    reportBug: { thisTicket: 'este bug ao suporte', asBlocked: 'bug' },
    makeCompliment: { thisTicket: 'este elogio', asBlocked: 'elogio pelo fale conosco' },
    makeCriticism: { thisTicket: 'esta crítica', asBlocked: 'uma única crítica' },
    makeSuggestion: { thisTicket: 'esta sugestão', asBlocked: 'sugestão pelo fale conosco' },
    makeComment: { thisTicket: 'este comentário', asBlocked: 'comentário pelo fale conosco' },
    clarifyDoubts: { thisTicket: 'esta dúvida', asBlocked: 'uma única dúvida' },
    skillSuggestion: { thisTicket: 'esta sugestão de habilidade', asBlocked: 'sugestão de habilidade' },
    skillFixHierarchy: { thisTicket: 'este ajuste de hierarquia de habilidades', asBlocked: 'ajuste de hierarquia de habilidades' },
};

const TICKET_KIND_QUOTA_GROUPS: Record<TicketKind, TicketQuotaGroup | null> = {
    reportBug: null,
    makeCompliment: 'sharedTickets',
    makeCriticism: 'makeCriticism',
    makeSuggestion: 'sharedTickets',
    makeComment: 'sharedTickets',
    clarifyDoubts: 'clarifyDoubts',
    skillSuggestion: 'sharedTickets',
    skillFixHierarchy: 'sharedTickets',
};

const joinWithAnd = (items: string[]) => (items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} e ${items[items.length - 1]}`);

/**
 * A pergunta do diálogo de confirmação do chamado. O bug não tem cota: só pede a confirmação. A dúvida e a crítica avisam
 * da cota própria; os da cota compartilhada listam os outros chamados que ficarão bloqueados nas próximas 24 horas.
 */
export const getTicketConfirmMessage = (kind: TicketKind): string => {
    const question = `Tem certeza de que deseja enviar ${TICKET_KIND_TEXTS[kind].thisTicket}?`;
    const group = TICKET_KIND_QUOTA_GROUPS[kind];
    if (!group) {
        return question;
    }
    if (group != 'sharedTickets') {
        return `${question} Atenção: só é possível enviar ${TICKET_KIND_TEXTS[kind].asBlocked} por dia; depois deste envio, outra só poderá ser enviada daqui a 24 horas.`;
    }
    const otherSharedKinds = (Object.keys(TICKET_KIND_QUOTA_GROUPS) as TicketKind[])
        .filter((other) => other != kind && TICKET_KIND_QUOTA_GROUPS[other] == 'sharedTickets')
        .map((other) => TICKET_KIND_TEXTS[other].asBlocked);
    return `${question} Atenção: só é possível abrir um único chamado por dia entre sugestão de habilidade, ajuste de hierarquia de habilidades e fale conosco (exceto bug, dúvida e crítica). Depois deste envio, nas próximas 24 horas você não poderá abrir: ${joinWithAnd(otherSharedKinds)}.`;
};

/** O grupo de cota de um tipo do fale conosco, ou null quando ele não tem cota (o bug). */
export const getContactUsQuotaGroup = (contactType: string): TicketQuotaGroup | null => TICKET_KIND_QUOTA_GROUPS[contactType as TicketKind] || null;

type SpentQuotas = Record<string, Partial<Record<TicketQuotaGroup, number>>>;

const toUserKey = (email: string) => email.trim().toLowerCase();

// localStorage pode faltar ou lançar erro (janela anônima, dados bloqueados): sem ele, quem barra é o backend
const readSpentQuotas = (): SpentQuotas => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return (stored && JSON.parse(stored)) || {};
    } catch (error) {
        return {};
    }
};

const writeSpentQuotas = (spentQuotas: SpentQuotas) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(spentQuotas));
    } catch (error) {}
};

/** Quando o grupo volta a aceitar um chamado do usuário (ms), ou null se já aceita agora. */
export const getTicketQuotaNextAllowedTime = (email: string, group: TicketQuotaGroup, now: number = Date.now()): number | null => {
    const spentAt = (readSpentQuotas()[toUserKey(email)] || {})[group];
    if (!spentAt) {
        return null;
    }
    const nextAllowedTime = spentAt + ONE_DAY_IN_MILLISECONDS;
    return nextAllowedTime > now ? nextAllowedTime : null;
};

/** Marca a cota do grupo como gasta agora pelo usuário; aproveita para descartar as marcas já vencidas. */
export const recordTicketQuota = (email: string, group: TicketQuotaGroup, now: number = Date.now()) => {
    const spentQuotas = readSpentQuotas();
    const stillValid: SpentQuotas = {};
    Object.keys(spentQuotas).forEach((storedEmail) => {
        const groups = spentQuotas[storedEmail] || {};
        (Object.keys(groups) as TicketQuotaGroup[])
            .filter((storedGroup) => (groups[storedGroup] || 0) + ONE_DAY_IN_MILLISECONDS > now)
            .forEach((storedGroup) => (stillValid[storedEmail] = { ...stillValid[storedEmail], [storedGroup]: groups[storedGroup] }));
    });
    const userKey = toUserKey(email);
    stillValid[userKey] = { ...stillValid[userKey], [group]: now };
    writeSpentQuotas(stillValid);
};

/** O aviso de que o usuário já gastou a cota do grupo nas últimas 24 horas, ou null se pode abrir o chamado agora. */
export const getTicketQuotaBlockMessage = (email: string, group: TicketQuotaGroup, now: number = Date.now()): string | null => {
    const nextAllowedTime = getTicketQuotaNextAllowedTime(email, group, now);
    if (!nextAllowedTime) {
        return null;
    }
    const nextAllowedText = new Date(nextAllowedTime).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', ''); // dd/mm/aa hh:mm (R01-4)
    return `Você já enviou ${GROUP_LABELS[group]} nas últimas 24 horas. Poderá enviar de novo a partir de ${nextAllowedText}.`;
};
