import { detailsErrors, editView, moveView, parseViews, sortableDate } from './viewedResumesData';

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

    it('editar troca apelido e comentário só da visualização do hash', () => {
        const views = parseViews([view('um', '01/11/2026 08:00:00'), view('dois', '02/11/2026 08:00:00')]);
        const edited = editView(views, 'um', 'Apelido novo', 'Comentário novo aqui');
        expect(edited.find((item) => item.linkedinHash == 'um')).toMatchObject({ alias: 'Apelido novo', comment: 'Comentário novo aqui', date: '01/11/2026 08:00:00' });
        expect(edited.find((item) => item.linkedinHash == 'dois')!.alias).toBe('dois');
    });

    it('negativar ou positivar tira de uma lista e põe na outra, na ordem da data', () => {
        const viewed = parseViews([view('um', '01/11/2026 08:00:00'), view('dois', '03/11/2026 08:00:00')]);
        const unwanted = parseViews([view('tres', '02/11/2026 08:00:00')]);
        const [remaining, reached] = moveView(viewed, unwanted, 'dois');
        expect(remaining.map((item) => item.alias)).toEqual(['um']);
        expect(reached.map((item) => item.alias)).toEqual(['dois', 'tres']);
    });

    it('valida apelido e comentário como o back end', () => {
        expect(detailsErrors('abc', '')).toHaveProperty('alias');
        expect(detailsErrors('Apelido bom', '')).toEqual({});
        expect(detailsErrors('Apelido bom', 'curto')).toHaveProperty('comment');
        expect(detailsErrors('Apelido bom', '', 'Comentário salvo antes')).toHaveProperty('comment');
        expect(detailsErrors('Apelido bom', 'Comentário com tamanho bom')).toEqual({});
    });
});
