import { filtersRequestOf } from '@/presentation/pages/meu-recrutamento/vagas/resumesOfTheFilters';
import { positionTabErrors, languagesTabErrors, filtersTabErrors, seniorityOptions } from '@/presentation/pages/meu-recrutamento/vagas/positionsData';
import { addressWithTheFilter, emptySearch, linkToShare, positionFormOfTheSearch, resumeFilterPath, searchFormOf } from './resumesSearchData';

describe('resumesSearchData', () => {
    it('a busca vazia filtra só pela área de tecnologia, em todas as regiões', () => {
        const { form, requiredSkills } = emptySearch();
        expect(filtersRequestOf(form, requiredSkills, null, false)).toEqual({ resumeType: 1 });
    });

    it('os filtros gravados voltam ao formulário e dele saem os mesmos filtros', () => {
        const { form } = emptySearch();
        const chosen = {
            ...form,
            resumeType: '1',
            ddd: ['11', '21'],
            seniority: ['pleno'],
            disponibility: 15,
            temporallyJobTime: 6,
            hasLanguages: true,
            spokenLanguage: [{ name: 'Inglês', level: 2 }],
            negotiableClaim: true,
            pcd: true,
            travel: true,
            hasClt: true,
            cltMin: 5000,
            cltMax: 9000 as number | '',
        };
        const sent = filtersRequestOf(chosen, ['JAVA'], 'rh@empresa.com.br', false);
        // como volta do backend: os números como texto JSON
        const stored = JSON.parse(JSON.stringify(sent).replace(/:(\d+)([,}\]])/g, ':$1.0$2'));
        const back = searchFormOf(stored);
        expect(back.requiredSkills).toEqual(['JAVA']);
        expect(filtersRequestOf(back.form, back.requiredSkills, 'rh@empresa.com.br', false)).toEqual(sent);
    });

    it('as habilidades desejáveis não voltam como obrigatórias', () => {
        const back = searchFormOf({ resumeType: 1, skill: [{ skill: 'SQL', word: 'SQL', type: 'shouldSkills', category: 'shouldSkills' }] });
        expect(back.requiredSkills).toEqual([]);
    });

    it('o id dos filtros vai para o endereço', () => {
        expect(addressWithTheFilter('http://localhost:3000/curriculos/buscar', 'abc')).toBe('/curriculos/buscar?filtro=abc');
        expect(addressWithTheFilter('http://localhost:3000/curriculos/buscar?filtro=old&x=1', 'abc')).toBe('/curriculos/buscar?filtro=abc&x=1');
    });

    it('o link para enviar leva só o id dos filtros ou, com o descritivo gravado, também o e-mail de quem o gravou', () => {
        const href = 'https://onias.site/curriculos/buscar?filtro=old&email=outro@x.com&x=1';
        expect(linkToShare(href, '56af')).toBe('https://onias.site/curriculos/buscar?filtro=56af');
        expect(linkToShare(href, '56af', 'rh+vagas@empresa.com.br')).toBe('https://onias.site/curriculos/buscar?filtro=56af&email=rh%2Bvagas@empresa.com.br');
    });

    it('o GET dos filtros leva o e-mail do link só quando ele veio', () => {
        expect(resumeFilterPath('-56af')).toBe('resume-filter/-56af');
        expect(resumeFilterPath('56af', null)).toBe('resume-filter/56af');
        expect(resumeFilterPath('56af', 'rh@empresa.com.br')).toBe('resume-filter/56af?email=rh%40empresa.com.br');
    });

    it('contactar os candidatos abre a vaga com os filtros da busca, e o que ela deixa livre vem com todos', () => {
        const now = new Date(2026, 10, 25);
        const allDdds = ['11', '21', '10'];
        const free = positionFormOfTheSearch(emptySearch().form, '', allDdds, now);
        expect(free.ddd).toEqual(allDdds);
        expect(free.seniority).toEqual(seniorityOptions.map((option) => option.value));
        expect(free.hasClt).toBe(true);
        expect(free.cltMin).toBe('');
        expect(free.title).toBe('');
        expect(filtersTabErrors(free)).toEqual([]);

        const search = {
            ...emptySearch().form,
            ddd: ['11'],
            seniority: ['pleno'],
            spokenLanguage: [{ name: 'Inglês', level: 2 }],
            hasLanguages: true,
            pcd: true,
            hasClt: false,
            cltMin: '' as const,
            cltMax: '' as const,
            hasPj: true,
            pjMin: 8000,
            pjMax: 12000,
        };
        const text = 'Desenvolvedor Java com Spring e SQL para sistemas financeiros, em equipe agil, com testes automatizados e deploy em nuvem.';
        const position = positionFormOfTheSearch(search, text, allDdds, now);
        expect(position.ddd).toEqual(['11']);
        expect(position.seniority).toEqual(['pleno']);
        expect(position.spokenLanguage).toEqual([{ name: 'Inglês', level: 2 }]);
        expect(position.pcd).toBe(true);
        expect([position.hasClt, position.hasPj, position.pjMin, position.pjMax]).toEqual([false, true, 8000, 12000]);
        expect(position.description).toBe(text);
        expect(position.resumeType).toBe('1');
        expect(positionTabErrors(position)).toEqual([]);
        expect(languagesTabErrors(position)).toEqual([]);
    });
});
