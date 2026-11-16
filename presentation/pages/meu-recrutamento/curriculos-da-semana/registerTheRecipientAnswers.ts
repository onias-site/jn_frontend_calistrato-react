import JnAjax from '@/app/JnAjax';

/**
 * As respostas do pré-cadastro do destinatário do e-mail de currículos (pedido de 2026-11-16): quem clica em "Ver todos"
 * é recrutador e chegou pelo e-mail, então o seu registro em js_login_answers é goal = recruiting e channel = others, e o
 * modal de login não lhe faz as perguntas do pré-cadastro.
 */
export const RECIPIENT_ANSWERS = { goal: 'recruiting', channel: 'others' };

const ignore = () => {};

/** Callbacks que não mexem na tela: a gravação corre por trás, sem a capa de carregamento e sem abrir o login. */
const silentCallbacks = (): any => ({ setLoading: ignore, setNotLoading: ignore, 401: ignore, onUnexpectedHttpStatus: ignore });

/**
 * Grava as respostas do destinatário, só se ele ainda não as tem, pelos mesmos serviços públicos do modal de login:
 * POST login/{e-mail}/token registra o e-mail de login quando falta e responde 201 quando faltam as respostas; só então
 * POST login/{e-mail}/pre-registration as grava (o serviço também não regrava respostas existentes). Qualquer outra
 * resposta (cadastro completo, token ou senha bloqueados, e-mail inválido) não faz nada. Link sem destinatário: nada.
 */
export const registerTheRecipientAnswers = (recipient: string): void => {
    if (!recipient) return;
    // um 201 guardado de uma visita anterior faria o modal abrir as perguntas pelo cache
    const forgetTheMissingAnswers = () => JnAjax.removeAllCachedStatus('201');
    const answersCallbacks = silentCallbacks();
    answersCallbacks[200] = forgetTheMissingAnswers;
    answersCallbacks[202] = forgetTheMissingAnswers;
    const saveAnswers = () =>
        JnAjax.doAnAjaxRequest(`login/${recipient}/pre-registration`, answersCallbacks, 'POST', RECIPIENT_ANSWERS as any, {}, 'http://localhost:8082');
    const callbacks = silentCallbacks();
    callbacks[201] = saveAnswers;
    JnAjax.doAnAjaxRequest(`login/${recipient}/token`, callbacks, 'POST', {} as any, {}, 'http://localhost:8082');
};
