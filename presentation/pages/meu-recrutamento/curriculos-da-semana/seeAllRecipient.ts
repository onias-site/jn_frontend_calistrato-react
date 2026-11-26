/**
 * O destinatário do e-mail de currículos, que o link "Ver todos" leva em `?email=` desde 2026-11-12, e a decisão da
 * tela: a lista é lida pelo e-mail da conta logada, então, com outra conta logada no navegador, a tela abria vazia
 * (404). Agora ela pede o login do destinatário.
 */

export type SeeAllDecision = 'load' | 'wrongAccount';

const normalize = (email: string | null | undefined) => (email || '').trim().toLowerCase();

/** O destinatário do link (`?email=`), já decodificado e em minúsculas; vazio quando o link não o traz (e-mails antigos). */
export const getRecipientFromQuery = (search: string): string => {
    const params = new URLSearchParams(search || '');
    return normalize(params.get('email'));
};

/**
 * O título da tela (pedido de 2026-11-12): o recrutador dono da lista. Usa o e-mail da lista carregada (a conta logada)
 * e, antes de carregar, o destinatário do link; sem nenhum dos dois, só "Currículos da semana".
 */
export const getSeeAllTitle = (listEmail: string | null | undefined, recipient: string | null | undefined): string => {
    const owner = normalize(listEmail) || normalize(recipient);
    return owner ? `Currículos da semana do recrutador ${owner}` : 'Currículos da semana';
};

/**
 * Preenche o e-mail do modal de login com o destinatário do link (pedido de 2026-11-16: em 2026-11-16 um recrutador
 * digitou no modal outro e-mail do mesmo domínio, sem cadastro, e desistiu). Link sem destinatário não mexe no modal.
 */
export const prefillTheLoginWithTheRecipient = (recipient: string, setLoginEmail: (email: string) => void): void => {
    const expected = normalize(recipient);
    if (!expected) return;
    setLoginEmail(expected);
};

/**
 * `load` quando a lista pode ser lida: link sem destinatário, ninguém logado (o 401 abre o login) ou a conta logada é
 * a do destinatário. `wrongAccount` quando outra conta está logada.
 */
export const decideSeeAll = (recipient: string, loggedEmail: string | null | undefined): SeeAllDecision => {
    const expected = normalize(recipient);
    const logged = normalize(loggedEmail);
    if (!expected || !logged) return 'load';
    return expected == logged ? 'load' : 'wrongAccount';
};
