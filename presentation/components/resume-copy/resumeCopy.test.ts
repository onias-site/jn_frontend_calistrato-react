jest.mock('jquery', () => ({ ajax: jest.fn() }));
jest.mock('pubsub-js', () => ({ publish: jest.fn() }));

import JnAjax from '@/app/JnAjax';
import {
    isTechResumeCopy,
    readResumeCopy,
    removeResumeCopy,
    resumeCopyFromSavedResume,
    resumeSavedForTheSearch,
    saveResumeCopy,
    savedResumeFrom,
    seniorityOf,
    takeThePendingSearch,
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

const copy = { resumeType: 1, ddd: [11, 19], experienceStartYear: 2022 };

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

    it('monta a cópia do registro gravado e reconhece o currículo de tecnologia', () => {
        const fromRecord = resumeCopyFromSavedResume({ resumeType: 2, ddd: [10], experience: 2009, pj: 9000 });

        expect(fromRecord).toEqual({ resumeType: 2, ddd: [10], experienceStartYear: 2009 });
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
});
