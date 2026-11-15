// o LinkedIn não vem na lista: o hash dele é a chave dos detalhes, que só o devolvem se o candidato ainda permite a empresa
export type ViewedResume = { linkedinHash: string; alias: string; date: string; comment?: string };

/** A data dd/MM/yyyy HH:mm:ss como número comparável (yyyyMMddHHmmss), para ordenar da visualização mais recente à mais antiga. */
export const sortableDate = (date: string) => {
    const [day, time] = (date || '').split(' ');
    const [dd, mm, yyyy] = (day || '').split('/');
    return `${yyyy}${mm}${dd}${(time || '').replace(/:/g, '')}`;
};

/**
 * Cada item da lista vem como texto JSON (linkedinHash, alias e date); um item ilegível é descartado, e uma lista ausente
 * (a API anterior a 2026-11-15 não manda unwantedResume) vira lista vazia.
 */
export const parseViews = (texts: string[] | undefined | null): ViewedResume[] =>
    (texts || [])
        .map((text) => {
            try {
                return JSON.parse(text) as ViewedResume;
            } catch (e) {
                return null;
            }
        })
        .filter((view): view is ViewedResume => view != null)
        .sort((a, b) => sortableDate(b.date).localeCompare(sortableDate(a.date)));

/** A visualização de um hash com o apelido e o comentário novos; as outras ficam como estão. */
export const editView = (views: ViewedResume[], linkedinHash: string, alias: string, comment: string): ViewedResume[] =>
    views.map((view) => (view.linkedinHash == linkedinHash ? { ...view, alias, comment: comment || view.comment } : view));

/** Tira a visualização de um hash de uma lista e a põe na outra, na ordem da data (negativar e positivar). */
export const moveView = (from: ViewedResume[], to: ViewedResume[], linkedinHash: string): [ViewedResume[], ViewedResume[]] => {
    const moved = from.filter((view) => view.linkedinHash == linkedinHash);
    const remaining = from.filter((view) => view.linkedinHash != linkedinHash);
    const others = to.filter((view) => view.linkedinHash != linkedinHash);
    const reached = [...others, ...moved].sort((a, b) => sortableDate(b.date).localeCompare(sortableDate(a.date)));
    return [remaining, reached];
};

/**
 * Os erros do formulário "Editar detalhes", pelas regras do back end: apelido de 5 a 200 caracteres e comentário opcional
 * de 10 a 500. Um comentário já salvo não pode ser apagado (o back end mescla e o manteria), só trocado.
 */
export const detailsErrors = (alias: string, comment: string, savedComment?: string) => {
    const errors: { alias?: string; comment?: string } = {};
    const aliasLength = alias.trim().length;
    const commentLength = comment.trim().length;
    if (aliasLength < 5 || aliasLength > 200) errors.alias = 'O apelido precisa ter de 5 a 200 caracteres.';
    if (commentLength == 0 && savedComment) errors.comment = 'O comentário salvo não pode ficar vazio: troque-o por outro de 10 a 500 caracteres.';
    if (commentLength > 0 && (commentLength < 10 || commentLength > 500)) errors.comment = 'O comentário precisa ter de 10 a 500 caracteres.';
    return errors;
};
