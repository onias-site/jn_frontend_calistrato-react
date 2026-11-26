import { defaultSortOf, emptyForm, formOf, sortCriteriaOf, sortOfThePosition, sortToShow } from './positionsData';

const keysOf = (rules: any[]) => rules.map((rule) => (rule.value ? `${rule.field[0]}:${rule.value}:${rule.type}` : `${rule.field[0]}:${rule.type}`));

describe('ordem dos currículos da vaga', () => {
    it('a padrão segue a prioridade e só leva o que a vaga pede', () => {
        const form = { ...emptyForm(), resumeType: '1', hasClt: true, hasPj: true, hasLanguages: true, spokenLanguage: [{ name: 'Inglês', level: 2 }, { name: 'Espanhol', level: 1 }], disponibility: 30, temporallyJobTime: 6 };
        expect(keysOf(defaultSortOf(form, ['Java']))).toEqual([
            'clt:asc',
            'pj:asc',
            'spokenLanguage:Inglês:desc',
            'spokenLanguage:Espanhol:desc',
            'experience:desc',
            'ddd:asc',
            'skillsTotal:desc',
            'shouldSkillsTotal:desc',
            'disponibility:asc',
            'temporallyJobTime:asc',
        ]);
    });

    it('só PJ: a pretensão PJ vem primeiro; fora de TI não há critérios de habilidade', () => {
        const form = { ...emptyForm(), resumeType: '4', hasClt: false, hasPj: true };
        expect(keysOf(defaultSortOf(form, ['Java']))).toEqual(['pj:asc', 'experience:desc', 'ddd:asc']);
        expect(sortCriteriaOf(form, ['Java']).map((criterion) => criterion.key)).toEqual(['pj', 'experience', 'ddd']);
    });

    it('cada habilidade desejável vira uma opção (fora da padrão) com os textos de aparecer primeiro e depois', () => {
        const skill = sortCriteriaOf({ ...emptyForm(), resumeType: '1' }, ['Java']).find((criterion) => criterion.key == 'skill:Java')!;
        expect(skill.inDefault).toBe(false);
        expect(skill.types).toEqual({ asc: 'Quem tiver Java aparece depois', desc: 'Quem tiver Java aparece primeiro' });
    });

    it('os sentidos falam a língua do critério', () => {
        const criteria = sortCriteriaOf({ ...emptyForm(), resumeType: '1' }, []);
        expect(criteria.find((criterion) => criterion.key == 'clt')!.types).toEqual({ asc: 'Candidatos mais baratos', desc: 'Candidatos mais caros' });
        expect(criteria.find((criterion) => criterion.key == 'experience')!.types).toEqual({ asc: 'Candidatos mais inexperientes', desc: 'Candidatos mais experientes' });
        expect(criteria.find((criterion) => criterion.key == 'shouldSkillsTotal')!.types.desc).toBe('Maior quantidade de habilidades desejáveis');
    });

    it('a ordem editada perde só o critério que a vaga deixou de pedir; vazia, volta a padrão', () => {
        const form = { ...emptyForm(), resumeType: '1', hasPj: true, sortEdited: true, sort: [{ type: 'desc' as const, field: ['pj'] }, { type: 'desc' as const, field: ['skill'], value: 'Java' }] };
        expect(keysOf(sortToShow(form, ['Java']))).toEqual(['pj:desc', 'skill:Java:desc']);
        expect(keysOf(sortToShow({ ...form, hasPj: false }, ['Java']))).toEqual(['skill:Java:desc']);
        expect(keysOf(sortToShow({ ...form, hasPj: false }, []))).toEqual(keysOf(defaultSortOf({ ...form, hasPj: false }, [])));
    });

    it('o DDD é sempre uma opção e (desde 2026-11-25) entra na padrão depois das pretensões e da experiência, os menores primeiro', () => {
        const ddd = sortCriteriaOf({ ...emptyForm(), resumeType: '4' }, []).find((criterion) => criterion.key == 'ddd')!;
        expect(ddd.inDefault).toBe(true);
        expect(ddd.defaultType).toBe('asc');
        expect(ddd.types).toEqual({ asc: 'DDDs menores primeiro', desc: 'DDDs maiores primeiro' });
        expect(keysOf(defaultSortOf({ ...emptyForm(), resumeType: '1' }, [])).slice(0, 3)).toEqual(['clt:asc', 'experience:desc', 'ddd:asc']);
        // a vaga nova já nasce com a padrão
        expect(keysOf(emptyForm().sort)).toEqual(keysOf(defaultSortOf({ ...emptyForm(), resumeType: '1' }, [])));
    });

    it('a ordem gravada antes, com vários critérios numa regra, vira um critério por regra', () => {
        expect(sortOfThePosition([{ type: 'desc', field: ['clt', 'experience'] }])).toEqual([
            { type: 'desc', field: ['clt'] },
            { type: 'desc', field: ['experience'] },
        ]);
        const position: any = { title: 'T', description: 'D', resumeType: 1, seniority: ['pleno'], ddd: [11], expiration: { min: 0, max: 0 }, sort: [] };
        expect(formOf(position).sortEdited).toBe(false);
    });
});
