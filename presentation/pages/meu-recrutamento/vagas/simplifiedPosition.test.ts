import { dddRegions } from '@/presentation/components/regions/dddRegions';
import { DESIRED_SKILLS, REQUIRED_SKILLS, filtersTabErrors, formOf, optionsTabErrors, positionOf, requestBodyOf, simplifiedFormOf, simplifiedSkillGroupsFromText, simplifiedSortOf } from './positionsData';

const allDdds = [...dddRegions.map((region) => region.id), '10'];

describe('vaga simplificada', () => {
    it('vem com todas as senioridades, todas as regiões mais o home office, sem idioma e com os candidatos enviando', () => {
        const form = simplifiedFormOf(allDdds, 'rh@empresa.com.br');
        expect(form.seniority).toEqual(['estag', 'junior', 'pleno', 'senior', 'especialista']);
        expect(form.ddd).toHaveLength(68);
        expect(form.ddd).toContain('10');
        expect(form.spokenLanguage).toEqual([]);
        expect(form.hasLanguages).toBe(false);
        expect(form.frequencyType).toBe('byTheCandidates');
        expect(form.mustSendInGroups).toBe(true);
        expect(form.resumesEmail).toBe('rh@empresa.com.br');
        // as abas escondidas não seguram a gravação
        expect(filtersTabErrors(form)).toEqual([]);
        expect(optionsTabErrors({ ...form, sort: simplifiedSortOf(form) })).toEqual([]);
    });

    it('ordena pelas pretensões informadas, as mais baratas primeiro, e pela experiência', () => {
        const form = simplifiedFormOf(allDdds, 'rh@empresa.com.br');
        expect(simplifiedSortOf({ ...form, hasClt: true, hasPj: true })).toEqual([
            { type: 'asc', field: ['clt'] },
            { type: 'asc', field: ['pj'] },
            { type: 'desc', field: ['experience'] },
        ]);
        expect(simplifiedSortOf({ ...form, hasClt: false, hasPj: true })).toEqual([
            { type: 'asc', field: ['pj'] },
            { type: 'desc', field: ['experience'] },
        ]);
    });

    it('gravada como simplificada, a vaga é editada como completa com tudo o que foi gravado', () => {
        const simplifiedForm = { ...simplifiedFormOf(allDdds, 'rh@empresa.com.br'), title: 'Dev Java', description: 'x'.repeat(200), hasClt: true, cltMin: 5000, cltMax: 8000 };
        const sort = simplifiedSortOf(simplifiedForm);
        const saved = positionOf(requestBodyOf({ ...simplifiedForm, sort }));
        const edited = formOf(saved);
        expect(edited.seniority).toEqual(simplifiedForm.seniority);
        expect(edited.ddd).toEqual(allDdds);
        expect(edited.frequencyType).toBe('byTheCandidates');
        expect(edited.resumesEmail).toBe('rh@empresa.com.br');
        expect(edited.mustSendInGroups).toBe(true);
        // a ordem gravada é mantida, como a de quem já mexeu nela
        expect(edited.sort).toEqual(sort);
        expect(edited.sortEdited).toBe(true);
    });

    it('todas as habilidades encontradas são obrigatórias, até o máximo aceito', () => {
        const found = Array.from({ length: 120 }, (_, i) => ({ skill: `S${i}`, label: `S${i}` }));
        const groups = simplifiedSkillGroupsFromText({ skill: found, excludedSkill: [] });
        expect(groups.find((group) => group.name == DESIRED_SKILLS)!.list).toEqual([]);
        expect(groups.find((group) => group.name == REQUIRED_SKILLS)!.list).toHaveLength(100);
    });
});
