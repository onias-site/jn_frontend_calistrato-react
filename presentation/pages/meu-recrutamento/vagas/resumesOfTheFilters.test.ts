import { emptyForm, PositionForm } from './positionsData';
import { filtersRequestOf, foundResumesMessage, recruiterDomainOf } from './resumesOfTheFilters';

const form = (changes: Partial<PositionForm> = {}): PositionForm => ({ ...emptyForm(new Date(2026, 10, 22)), ...changes });

describe('resumesOfTheFilters', () => {
    it('a vaga nova (home office, contratação imediata, não temporária, nada marcado) filtra só pela área', () => {
        expect(filtersRequestOf(form(), [])).toEqual({ resumeType: 1 });
    });

    it('sem área ou sem região ainda não conta', () => {
        expect(filtersRequestOf(form({ resumeType: '' }), [])).toBeNull();
        expect(filtersRequestOf(form({ ddd: [] }), [])).toBeNull();
    });

    it('leva cada filtro informado', () => {
        const request = filtersRequestOf(
            form({
                ddd: ['11', '21'],
                disponibility: 15,
                temporallyJobTime: 6,
                seniority: ['junior', 'pleno'],
                hasLanguages: true,
                spokenLanguage: [{ name: 'Inglês', level: 2 } as any],
                negotiableClaim: true,
                pcd: true,
                travel: true,
                hasClt: true,
                cltMin: 5000,
                cltMax: 9000,
                hasPj: true,
                pjMin: 8000,
                pjMax: 15000,
            }),
            ['JAVA', 'BACKEND'],
            'rh@Empresa.com.br',
        );
        expect(request).toEqual({
            resumeType: 1,
            ddd: [11, 21],
            disponibility: 15,
            temporallyJobTime: 6,
            seniority: ['junior', 'pleno'],
            skill: ['JAVA', 'BACKEND'],
            spokenLanguage: [{ name: 'Inglês', level: 2 }],
            negotiableClaim: true,
            pcd: true,
            travel: true,
            clt: { min: 5000, max: 9000 },
            pj: { min: 8000, max: 15000 },
            recruiterDomain: 'empresa.com.br',
        });
    });

    it('não leva o que não filtra: habilidades fora de TI, idiomas desligados, faixa desligada, incompleta ou invertida', () => {
        const request = filtersRequestOf(
            form({ resumeType: '2', hasLanguages: false, spokenLanguage: [{ name: 'Inglês', level: 1 } as any], hasClt: true, cltMin: 9000, cltMax: 5000, hasPj: false, pjMin: 1000, pjMax: 2000 }),
            ['JAVA'],
        );
        expect(request).toEqual({ resumeType: 2 });
        expect(filtersRequestOf(form({ hasClt: true, cltMin: 5000, cltMax: '' }), [])).toEqual({ resumeType: 1 });
    });

    it('as habilidades vão sem as repetidas (maiúsculas ou não) e, acima de 100, não conta (o backend recusaria com 422)', () => {
        expect(filtersRequestOf(form(), ['SPRING', 'JAVA', 'spring'])).toEqual({ resumeType: 1, skill: ['SPRING', 'JAVA'] });
        const hundred = Array.from({ length: 100 }, (_, index) => `SKILL${index}`);
        expect(filtersRequestOf(form(), [...hundred, 'skill0'])?.skill).toHaveLength(100);
        expect(filtersRequestOf(form(), [...hundred, 'SKILL100'])).toBeNull();
    });

    it('o domínio só vale de um e-mail com domínio válido', () => {
        expect(recruiterDomainOf('rh@empresa.com.br')).toBe('empresa.com.br');
        expect(recruiterDomainOf(undefined)).toBeNull();
        expect(recruiterDomainOf('sem-arroba')).toBeNull();
    });

    it('a mensagem traz a contagem e as médias que houver', () => {
        expect(foundResumesMessage({ ids: [], resumes: 0 })).toBe('Não foram encontrados currículos para os seus critérios de busca');
        const message = foundResumesMessage({ ids: ['a', 'b'], resumes: 2, cltAverage: 8000, pjAverage: 12500.4 });
        expect(message.startsWith('Foram encontrados 2 currículos (média CLT R$')).toBe(true);
        expect(message).toContain('8.000');
        expect(message).toContain('média PJ R$');
        expect(message).toContain('12.500');
        expect(message).not.toContain('experiência');
        expect(foundResumesMessage({ ids: ['a'], resumes: 1, experienceAverage: 6.46 })).toBe('Foram encontrados 1 currículos (média de experiência 6,5 anos)');
        expect(foundResumesMessage({ ids: ['a'], resumes: 1, experienceAverage: 6 })).toContain('média de experiência 6 anos');
    });
});
