// Ações sobre o currículo salvo permitidas uma vez a cada 24 horas por usuário (desde 2026-11-07): cada uma manda e-mail
// e pesa no backend. O backend é quem decide (vis_resume_daily_action, 429); esta marca no navegador só evita mandar
// uma requisição que já se sabe recusada. Mesmos valores do enum VisResumeDailyActions do backend.
export type ResumeDailyAction = 'inactivation' | 'reactivation' | 'exclusion' | 'update';

const STORAGE_KEY = 'resumeDailyActions';
export const ONE_DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

const ACTION_LABELS: Record<ResumeDailyAction, string> = {
    inactivation: 'inativar o currículo',
    reactivation: 'reativar o currículo',
    exclusion: 'excluir o currículo',
    update: 'atualizar o currículo',
};

type DoneActions = Record<string, Partial<Record<ResumeDailyAction, number>>>;

// localStorage pode faltar ou lançar erro (janela anônima, dados bloqueados): sem ele, quem barra é o backend
const readDoneActions = (): DoneActions => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return (stored && JSON.parse(stored)) || {};
    } catch (error) {
        return {};
    }
};

const writeDoneActions = (doneActions: DoneActions) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(doneActions));
    } catch (error) {}
};

/** Quando a ação volta a ser permitida (ms), ou null se já é permitida agora. */
export const getNextAllowedTime = (email: string, action: ResumeDailyAction, now: number = Date.now()): number | null => {
    const doneAt = (readDoneActions()[email] || {})[action];
    if (!doneAt) {
        return null;
    }
    const nextAllowedTime = doneAt + ONE_DAY_IN_MILLISECONDS;
    return nextAllowedTime > now ? nextAllowedTime : null;
};

/** Marca a ação como feita agora pelo usuário; aproveita para descartar as marcas já vencidas. */
export const recordResumeDailyAction = (email: string, action: ResumeDailyAction, now: number = Date.now()) => {
    const doneActions = readDoneActions();
    const stillValid: DoneActions = {};
    Object.keys(doneActions).forEach((storedEmail) => {
        const actions = doneActions[storedEmail] || {};
        (Object.keys(actions) as ResumeDailyAction[])
            .filter((storedAction) => (actions[storedAction] || 0) + ONE_DAY_IN_MILLISECONDS > now)
            .forEach((storedAction) => (stillValid[storedEmail] = { ...stillValid[storedEmail], [storedAction]: actions[storedAction] }));
    });
    stillValid[email] = { ...stillValid[email], [action]: now };
    writeDoneActions(stillValid);
};

/** O aviso de que a ação já foi feita nas últimas 24 horas, ou null se ela é permitida agora. */
export const getResumeDailyActionBlockMessage = (email: string, action: ResumeDailyAction, now: number = Date.now()): string | null => {
    const nextAllowedTime = getNextAllowedTime(email, action, now);
    if (!nextAllowedTime) {
        return null;
    }
    const nextAllowedText = new Date(nextAllowedTime).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
    return `Só é possível ${ACTION_LABELS[action]} uma única vez ao dia, e você já fez isso. Poderá fazer de novo a partir de ${nextAllowedText}.`;
};

/** A pergunta do diálogo de confirmação da ação. */
export const getResumeDailyActionConfirmMessage = (action: ResumeDailyAction): string =>
    `Tem certeza de que deseja ${ACTION_LABELS[action]}? Atenção: só é possível ${ACTION_LABELS[action]} uma única vez ao dia.`;

/** O aviso do 429 do backend: a ação já foi feita nas últimas 24 horas (por esta ou por outra janela, outro navegador). */
export const getResumeDailyLimitReachedMessage = (action: ResumeDailyAction): string =>
    `Só é possível ${ACTION_LABELS[action]} uma única vez ao dia, e você já fez isso nas últimas 24 horas. Tente de novo amanhã.`;
