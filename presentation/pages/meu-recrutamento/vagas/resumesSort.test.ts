import { sortResumes } from './resumesSort';

const row = (name: string, sortValues: any) => ({ name, sortValues });
const names = (rows: any[]) => rows.map((item) => item.name);

describe('ordem da lista dos currículos aderentes', () => {
    const rows = [
        row('caro', { clt: 9000, experience: 10, skill: ['Java', 'Spring', 'Docker'], spokenLanguage: {} }),
        row('semPretensao', { experience: 20, skill: ['Python'], spokenLanguage: { Inglês: 2 } }),
        row('baratoJunior', { clt: 5000, experience: 1, skill: ['Java'], parentSkill: ['Docker'], spokenLanguage: { Inglês: 1 } }),
        row('baratoSenior', { clt: 5000, experience: 8, skill: [], spokenLanguage: {} }),
    ];

    it('os mais baratos primeiro, o mais experiente desempata e quem não tem pretensão vai para o fim', () => {
        expect(names(sortResumes(rows, [{ type: 'asc', field: ['clt'] }, { type: 'desc', field: ['experience'] }], []))).toEqual(['baratoSenior', 'baratoJunior', 'caro', 'semPretensao']);
        expect(names(sortResumes(rows, [{ type: 'desc', field: ['clt'] }], [])).slice(-1)).toEqual(['semPretensao']);
    });

    it('o nível do idioma, as habilidades totais e as desejáveis (inclusive pela hierarquia)', () => {
        expect(names(sortResumes(rows, [{ type: 'desc', field: ['spokenLanguage'], value: 'inglês' }], []))).toEqual(['semPretensao', 'baratoJunior', 'caro', 'baratoSenior']);
        expect(names(sortResumes(rows, [{ type: 'desc', field: ['skillsTotal'] }], []))[0]).toBe('caro');
        expect(names(sortResumes(rows, [{ type: 'desc', field: ['shouldSkillsTotal'] }, { type: 'asc', field: ['skillsTotal'] }], ['Java', 'Docker']))).toEqual(['baratoJunior', 'caro', 'baratoSenior', 'semPretensao']);
    });

    it('quem tiver a habilidade aparece primeiro; o empate mantém a ordem recebida', () => {
        expect(names(sortResumes(rows, [{ type: 'desc', field: ['skill'], value: 'Python' }], []))).toEqual(['semPretensao', 'caro', 'baratoJunior', 'baratoSenior']);
    });
});
