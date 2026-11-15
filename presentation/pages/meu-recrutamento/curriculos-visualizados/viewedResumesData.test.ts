import { parseViews, sortableDate } from './viewedResumesData';

const view = (alias: string, date: string) => JSON.stringify({ linkedinHash: alias, alias, date });

describe('lista de currículos visualizados', () => {
    it('ordena da visualização mais recente à mais antiga', () => {
        const views = parseViews([view('antiga', '01/11/2026 08:00:00'), view('recente', '14/11/2026 09:30:00'), view('meio', '14/11/2026 09:29:59')]);
        expect(views.map((item) => item.alias)).toEqual(['recente', 'meio', 'antiga']);
    });

    it('descarta o item ilegível', () => {
        const views = parseViews([view('boa', '01/11/2026 08:00:00'), '{quebrado']);
        expect(views.map((item) => item.alias)).toEqual(['boa']);
    });

    it('a lista ausente (API sem unwantedResume) vira lista vazia', () => {
        expect(parseViews(undefined)).toEqual([]);
        expect(parseViews(null)).toEqual([]);
    });

    it('a data vira yyyyMMddHHmmss', () => {
        expect(sortableDate('15/11/2026 13:05:09')).toBe('20261115130509');
    });
});
