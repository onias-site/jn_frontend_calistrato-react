// o LinkedIn não vem na lista: o hash dele é a chave dos detalhes, que só o devolvem se o candidato ainda permite a empresa
export type ViewedResume = { linkedinHash: string; alias: string; date: string };

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
