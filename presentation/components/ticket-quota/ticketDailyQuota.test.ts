import { ONE_DAY_IN_MILLISECONDS, getContactUsQuotaGroup, getTicketConfirmMessage, getTicketQuotaBlockMessage, getTicketQuotaNextAllowedTime, recordTicketQuota } from './ticketDailyQuota';

// o Jest roda no ambiente node, sem localStorage
const fakeStorage = () => {
    const items = new Map<string, string>();
    return {
        getItem: (key: string) => (items.has(key) ? items.get(key) : null),
        setItem: (key: string, value: string) => items.set(key, value),
    };
};

describe('ticketDailyQuota', () => {
    const email = 'candidato@jobsnow.com';
    const now = new Date(2026, 10, 7, 10, 0).getTime();

    beforeEach(() => Object.defineProperty(global, 'localStorage', { value: fakeStorage(), configurable: true, writable: true }));

    it('maps the contact us types to their quota groups, the bug to none', () => {
        expect(getContactUsQuotaGroup('reportBug')).toBeNull();
        expect(getContactUsQuotaGroup('clarifyDoubts')).toBe('clarifyDoubts');
        expect(getContactUsQuotaGroup('makeCriticism')).toBe('makeCriticism');
        expect(getContactUsQuotaGroup('makeCompliment')).toBe('sharedTickets');
        expect(getContactUsQuotaGroup('makeSuggestion')).toBe('sharedTickets');
        expect(getContactUsQuotaGroup('makeComment')).toBe('sharedTickets');
    });

    it('only asks for the confirmation of a bug', () => {
        expect(getTicketConfirmMessage('reportBug')).toBe('Tem certeza de que deseja enviar este bug ao suporte?');
    });

    it('warns of the quota of its own of the question and of the criticism', () => {
        expect(getTicketConfirmMessage('clarifyDoubts')).toContain('só é possível enviar uma única dúvida por dia');
        expect(getTicketConfirmMessage('makeCriticism')).toContain('só é possível enviar uma única crítica por dia');
    });

    it('lists the other tickets blocked by the shared quota', () => {
        const message = getTicketConfirmMessage('makeCompliment');
        expect(message).toContain('Tem certeza de que deseja enviar este elogio?');
        expect(message).toContain(
            'você não poderá abrir: sugestão pelo fale conosco, comentário pelo fale conosco, sugestão de habilidade e ajuste de hierarquia de habilidades.',
        );
        expect(getTicketConfirmMessage('skillSuggestion')).toContain(
            'você não poderá abrir: elogio pelo fale conosco, sugestão pelo fale conosco, comentário pelo fale conosco e ajuste de hierarquia de habilidades.',
        );
    });

    it('allows every group never spent', () => {
        expect(getTicketQuotaNextAllowedTime(email, 'sharedTickets', now)).toBeNull();
        expect(getTicketQuotaBlockMessage(email, 'sharedTickets', now)).toBeNull();
    });

    it('blocks the group for 24 hours after it was spent', () => {
        recordTicketQuota(email, 'makeCriticism', now);
        expect(getTicketQuotaNextAllowedTime(email, 'makeCriticism', now + 1000)).toBe(now + ONE_DAY_IN_MILLISECONDS);
        expect(getTicketQuotaBlockMessage(email, 'makeCriticism', now + 1000)).toContain('uma crítica');
        expect(getTicketQuotaNextAllowedTime(email, 'makeCriticism', now + ONE_DAY_IN_MILLISECONDS)).toBeNull();
    });

    it('keeps the groups and the users independent, ignoring the case of the e-mail', () => {
        recordTicketQuota(email, 'sharedTickets', now);
        expect(getTicketQuotaNextAllowedTime(email, 'clarifyDoubts', now)).toBeNull();
        expect(getTicketQuotaNextAllowedTime(email, 'makeCriticism', now)).toBeNull();
        expect(getTicketQuotaNextAllowedTime('outro@jobsnow.com', 'sharedTickets', now)).toBeNull();
        expect(getTicketQuotaNextAllowedTime(' Candidato@JobsNow.com ', 'sharedTickets', now)).toBe(now + ONE_DAY_IN_MILLISECONDS);
    });

    it('drops the expired marks when recording a new one', () => {
        recordTicketQuota(email, 'sharedTickets', now);
        recordTicketQuota(email, 'clarifyDoubts', now + ONE_DAY_IN_MILLISECONDS + 1);
        const stored = JSON.parse(localStorage.getItem('ticketDailyQuotas') || '{}');
        expect(Object.keys(stored[email])).toEqual(['clarifyDoubts']);
    });

    it('lets the backend decide when the localStorage fails', () => {
        Object.defineProperty(global, 'localStorage', {
            value: { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } },
            configurable: true,
            writable: true,
        });
        recordTicketQuota(email, 'sharedTickets', now);
        expect(getTicketQuotaNextAllowedTime(email, 'sharedTickets', now)).toBeNull();
    });
});
