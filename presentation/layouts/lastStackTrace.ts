import { STACK_TRACE_MAX_LENGTH } from './contactUsTypes';

/**
 * O último erro de JavaScript (ou do React) que aconteceu nesta aba, guardado para ir junto com o ticket do "Fale
 * Conosco": quem reporta um bug quase nunca sabe dizer o que quebrou, mas o stack trace sabe.
 */
let lastStackTrace = '';

const describe = (error: any): string => {
    if (!error) return '';
    if (error.stack) return String(error.stack);
    if (error.message) return String(error.message);
    return String(error);
};

/** Guarda o erro como o último; aceita qualquer coisa que tenha sido lançada. */
export const recordError = (error: any, componentStack?: string) => {
    const text = describe(error) + (componentStack ? '\n' + componentStack : '');
    if (!text) return;
    lastStackTrace = text.substring(0, STACK_TRACE_MAX_LENGTH);
};

export const getLastStackTrace = () => lastStackTrace;

let installed = false;

/** Passa a ouvir os erros não tratados da página (os síncronos e as promises rejeitadas); chamar mais de uma vez não duplica. */
export const listenToUnhandledErrors = () => {
    if (installed || typeof window == 'undefined') return;
    installed = true;
    window.addEventListener('error', (event: ErrorEvent) => recordError(event.error || event.message));
    window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => recordError(event.reason));
};
