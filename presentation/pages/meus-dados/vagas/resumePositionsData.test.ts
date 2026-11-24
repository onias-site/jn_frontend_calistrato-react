import { dddRegions } from '@/presentation/components/regions/dddRegions';
import { contactHref, contactLabel, newestFirst, PositionOfTheResume, regionsLabel, salaryLabel, senioritiesLabel, validUntilLabel } from './resumePositionsData';

const position = (title: string, min: number): PositionOfTheResume => ({
    title,
    description: 'descrição',
    resumeType: 1,
    seniority: ['pleno'],
    ddd: ['11'],
    expiration: { min, max: min + 1 },
    contact: [],
});

describe('a tela Minhas vagas do candidato', () => {
    it('mostra as vagas mais recentes primeiro', () => {
        const titles = newestFirst([position('antiga', 1), position('nova', 3), position('meio', 2)]).map((item) => item.title);
        expect(titles).toEqual(['nova', 'meio', 'antiga']);
    });

    it('nomeia as senioridades na ordem do cadastro, aceitando o texto das vagas antigas', () => {
        expect(senioritiesLabel(['senior', 'junior'])).toBe('Júnior, Sênior');
        expect(senioritiesLabel('pleno')).toBe('Pleno');
    });

    it('põe o home office primeiro e resume todas as regiões', () => {
        const someRegion = dddRegions.find((region) => region.id != '10')!;
        expect(regionsLabel(['10', someRegion.id])).toBe(`Home office, ${someRegion.nome}`);
        const everyRegion = dddRegions.map((region) => region.id);
        expect(regionsLabel(['10', ...everyRegion])).toBe('Home office, Qualquer estado / cidade');
        expect(regionsLabel(everyRegion)).toBe('Qualquer estado / cidade');
    });

    it('escreve a faixa salarial e o fim da validade', () => {
        expect(salaryLabel({ min: 5000, max: 8000 }).replace(/\s/g, ' ')).toBe('R$ 5.000 a R$ 8.000');
        expect(salaryLabel(undefined)).toBe('');
        expect(validUntilLabel(new Date(2026, 11, 5, 23, 59).getTime())).toBe('05/12/2026');
    });

    it('abre o WhatsApp, o e-mail ou a página de cada contato', () => {
        expect(contactHref({ type: 'whatsapp', value: '+55 (11) 99999-0000' })).toBe('https://wa.me/5511999990000');
        expect(contactHref({ type: 'email', value: 'rh@empresa.com' })).toBe('mailto:rh@empresa.com');
        expect(contactHref({ type: 'link', value: 'empresa.com/vagas' })).toBe('https://empresa.com/vagas');
        expect(contactHref({ type: 'link', value: 'http://empresa.com' })).toBe('http://empresa.com');
        expect(contactLabel({ type: 'link', value: 'x' })).toBe('Página da vaga');
    });
});
