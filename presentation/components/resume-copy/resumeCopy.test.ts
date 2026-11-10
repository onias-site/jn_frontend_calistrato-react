jest.mock('pubsub-js', () => ({ publish: jest.fn() }));

import JnAjax from '@/app/JnAjax';
import {
    hasSkillsInTheCopy,
    isTechResumeCopy,
    resumeHasTheSkill,
    resumeSkillsFrom,
    readResumeCopy,
    removeResumeCopy,
    resumeCopyFromSavedResume,
    resumeSavedForTheSearch,
    saveResumeCopy,
    savedResumeFrom,
    seniorityOf,
    isWaitingForTheResume,
    stopWaitingForTheResume,
    takeThePendingSearch,
    takeThePendingSearchFilters,
    waitForTheResume,
} from './resumeCopy';

const fakeStorage = () => {
    const items = new Map<string, string>();
    return {
        getItem: (key: string) => (items.has(key) ? items.get(key) : null),
        setItem: (key: string, value: string) => items.set(key, value),
        removeItem: (key: string) => items.delete(key),
    };
};

const copy = { resumeType: 1, ddd: [11, 19], experienceStartYear: 2022, skills: ['java'] };

describe('resumeCopy', () => {
    const useLogin = (email: string) => ((JnAjax as any).getLogin = () => ({ email, sessionToken: 'S' }));

    beforeEach(() => {
        Object.defineProperty(global, 'localStorage', { value: fakeStorage(), configurable: true, writable: true });
        Object.defineProperty(global, 'sessionStorage', { value: fakeStorage(), configurable: true, writable: true });
        useLogin('dono@teste.com');
    });

    it('calcula a senioridade pelas faixas do backend', () => {
        const seniorityWith = (years: number) => seniorityOf({ ...copy, experienceStartYear: 2026 - years }, 2026);

        expect([0, 1, 2, 3, 4, 5, 9, 10, 40].map(seniorityWith)).toEqual(['estag', 'junior', 'junior', 'pleno', 'pleno', 'senior', 'senior', 'especialista', 'especialista']);
    });

    it('só devolve a cópia ao e-mail que a salvou', () => {
        saveResumeCopy(copy);
        expect(readResumeCopy()).toEqual(copy);

        useLogin('outro@teste.com');
        expect(readResumeCopy()).toBeUndefined();
    });

    it('a cópia apagada não volta', () => {
        saveResumeCopy(copy);
        removeResumeCopy();

        expect(readResumeCopy()).toBeUndefined();
    });

    it('lê o currículo ativo ou o inativo, e nenhum quando não há', () => {
        expect(savedResumeFrom({ vis_resume: { ddd: [11] }, vis_inactive_resume: {} })).toEqual({ ddd: [11] });
        expect(savedResumeFrom({ vis_resume: {}, vis_inactive_resume: { ddd: [19] } })).toEqual({ ddd: [19] });
        expect(savedResumeFrom({ vis_resume: {}, vis_inactive_resume: {} })).toBeUndefined();
    });

    it('guarda só as habilidades que o currículo tem, com as implícitas, e compara sem o sufixo 123 e sem maiúsculas', () => {
        const savedSkills = [
            { skill: 'Java', word: 'java', type: 'skillsFromResume', category: 'skillsFromResume', parent: ['Programming'] },
            { skill: 'Go123', word: 'golang', type: 'skillsFromResume', category: 'skillsFromResume' },
            { skill: 'Programming', word: 'Programming', type: 'parent', category: 'parent' },
            { skill: 'Cobol', word: 'cobol', type: 'excludedSkills', category: 'excludedSkills' },
            { skill: 'Delphi', word: 'delphi', type: 'tooShort', category: 'discardedSkills' },
        ];

        const resumeSkills = resumeSkillsFrom(savedSkills);

        expect(resumeSkills).toEqual(['java', 'programming', 'go']);
        expect(['JAVA', 'Go', 'Go123', 'Programming', 'Cobol', 'Delphi', 'Python'].map((skill) => resumeHasTheSkill(resumeSkills, skill))).toEqual([true, true, true, true, false, false, false]);
        expect(resumeSkillsFrom(undefined as any)).toEqual([]);
    });

    it('a cópia gravada antes das habilidades não serve para a pesquisa', () => {
        expect(hasSkillsInTheCopy({ resumeType: 1, ddd: [11], experienceStartYear: 2020 } as any)).toBe(false);
        expect(hasSkillsInTheCopy(copy)).toBe(true);
    });

    it('monta a cópia do registro gravado e reconhece o currículo de tecnologia', () => {
        const fromRecord = resumeCopyFromSavedResume({ resumeType: 2, ddd: [10], experience: 2009, pj: 9000 });

        expect(fromRecord).toEqual({ resumeType: 2, ddd: [10], experienceStartYear: 2009, skills: [] });
        expect(isTechResumeCopy(fromRecord)).toBe(false);
        expect(isTechResumeCopy(copy)).toBe(true);
    });

    it('salvar o currículo só refaz a pesquisa quando a tela de vagas pediu, e uma vez só', () => {
        expect(resumeSavedForTheSearch()).toBe(false);
        expect(takeThePendingSearch()).toBe(false);

        waitForTheResume();
        expect(takeThePendingSearch()).toBe(false);
        expect(resumeSavedForTheSearch()).toBe(true);
        expect(takeThePendingSearch()).toBe(true);
        expect(takeThePendingSearch()).toBe(false);
    });

    it('o formulário promete a volta só enquanto espera, e os filtros da pesquisa são lidos uma vez', () => {
        const filters = { month: '2026-10', seniority: 'senior', ddd: '11' };
        expect(isWaitingForTheResume()).toBe(false);
        expect(takeThePendingSearchFilters()).toBeNull();

        waitForTheResume(filters);
        expect(isWaitingForTheResume()).toBe(true);
        expect(resumeSavedForTheSearch()).toBe(true);
        expect(isWaitingForTheResume()).toBe(false);
        expect(takeThePendingSearch()).toBe(true);
        expect(takeThePendingSearchFilters()).toEqual(filters);
        expect(takeThePendingSearchFilters()).toBeNull();
    });

    it('quem volta à tela de vagas sem salvar desiste da volta', () => {
        waitForTheResume({ month: '2026-10', seniority: 'pleno', ddd: '10' });
        stopWaitingForTheResume();

        expect(isWaitingForTheResume()).toBe(false);
        expect(resumeSavedForTheSearch()).toBe(false);
        expect(takeThePendingSearchFilters()).toBeNull();
    });
});
