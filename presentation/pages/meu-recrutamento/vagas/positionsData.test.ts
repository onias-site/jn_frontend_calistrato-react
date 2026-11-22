import {
    changeExpiration,
    emptyForm,
    formOf,
    foundResumesLabel,
    fromDateInput,
    isValidContact,
    languagesTabErrors,
    optionsTabErrors,
    parsePositions,
    positionTabErrors,
    salaryTabErrors,
    pendingRequirements,
    positionOf,
    removePosition,
    replacePosition,
    requestBodyOf,
    splitByExpiration,
    toDateInput,
} from './positionsData';

const now = new Date(2026, 10, 21, 15, 0, 0);

const validForm = () => ({
    ...emptyForm(now),
    title: 'Desenvolvedor Java pleno',
    description: 'x'.repeat(120),
    seniority: 'pleno',
    ddd: ['11', '21'],
    cltMin: 5000 as number | '',
    cltMax: 8000 as number | '',
    requiredSkills: ['JAVA'],
    desiredSkills: ['DOCKER'],
    hasLanguages: true,
    spokenLanguage: [{ name: 'Inglês', level: 2 }],
    contact: [{ type: 'email' as const, value: 'rh@empresa.com.br' }],
});

describe('positionsData', () => {
    it('lê as vagas do grupo (textos JSON) e separa as dentro da expiração das expiradas', () => {
        const group = {
            child: [
                JSON.stringify({ title: 'vaga que expirou', expiration: { min: '1000', max: String(now.getTime() - 60000) } }),
                JSON.stringify({ title: 'vaga em aberto', expiration: { min: '1000', max: String(now.getTime() + 86400000) } }),
            ],
        };
        const positions = parsePositions(group);
        expect(positions.map((position) => position.title)).toEqual(['vaga em aberto', 'vaga que expirou']);
        expect(typeof positions[0].expiration.max).toBe('number');
        const { active, expired } = splitByExpiration(positions, now.getTime());
        expect(active.map((position) => position.title)).toEqual(['vaga em aberto']);
        expect(expired.map((position) => position.title)).toEqual(['vaga que expirou']);
        expect(parsePositions(undefined)).toEqual([]);
    });

    it('troca, tira e muda a expiração da vaga pelo título', () => {
        const positions = parsePositions({ child: [JSON.stringify({ title: 'A', expiration: { min: 1, max: 2 } }), JSON.stringify({ title: 'B', expiration: { min: 1, max: 3 } })] });
        expect(replacePosition(positions, { ...positions[1], description: 'nova' } as any).filter((position) => position.title == 'A')[0].description).toBe('nova');
        expect(removePosition(positions, 'A').map((position) => position.title)).toEqual(['B']);
        expect(changeExpiration(positions, 'B', { min: '1', max: '99' }).filter((position) => position.title == 'B')[0].expiration).toEqual({ min: 1, max: 99 });
    });

    it('converte as datas do campo para o começo e o fim do dia', () => {
        const start = fromDateInput('2026-11-21', false);
        const end = fromDateInput('2026-11-21', true);
        expect(new Date(start).getHours()).toBe(0);
        expect(new Date(end).getHours()).toBe(23);
        expect(toDateInput(end)).toBe('2026-11-21');
    });

    it('monta o corpo da requisição como o backend valida', () => {
        const body = requestBodyOf(validForm());
        expect(body.clt).toEqual({ min: 5000, max: 8000 });
        expect(body.pj).toBeUndefined();
        expect(body.ddd).toEqual([11, 21]);
        expect(body.skill).toEqual([
            { skill: 'JAVA', word: 'JAVA', type: 'skillsFromResume', category: 'skillsFromText' },
            { skill: 'DOCKER', word: 'DOCKER', type: 'shouldSkills', category: 'shouldSkills' },
        ]);
        expect(typeof body.expiration.min).toBe('string');
        expect(body.mustSendInGroups).toBe(true);
        expect(body.frequencyType).toBe('daily');
    });

    it('preenche a edição com a vaga gravada, separando as habilidades obrigatórias das desejáveis', () => {
        const position = positionOf(requestBodyOf(validForm()));
        const form = formOf(position);
        expect(form.requiredSkills).toEqual(['JAVA']);
        expect(form.desiredSkills).toEqual(['DOCKER']);
        expect(form.hasPj).toBe(false);
        expect(form.ddd).toEqual(['11', '21']);
        expect(form.expirationMin).toBe('2026-11-21');
    });

    it('lista o que falta no formulário', () => {
        expect(pendingRequirements(validForm(), true, now)).toEqual([]);
        expect(pendingRequirements(emptyForm(now), true, now)).toEqual(
            expect.arrayContaining(['O título deve ter de 10 a 100 caracteres', 'Escolha a senioridade', 'Escolha ao menos uma região']),
        );
        expect(pendingRequirements({ ...validForm(), hasClt: false }, true, now)).toContain('Informe ao menos uma faixa salarial (CLT ou PJ)');
        expect(pendingRequirements({ ...validForm(), cltMin: 9000 }, true, now)).toContain('O máximo da faixa CLT não pode ser menor que o mínimo');
        expect(pendingRequirements({ ...validForm(), expirationMin: '2026-11-01' }, true, now)).toContain('O início da vaga não pode ser antes de hoje');
        // uma vaga antiga editada guarda o início que já passou
        expect(pendingRequirements({ ...validForm(), expirationMin: '2026-11-01' }, false, now)).toEqual([]);
        expect(pendingRequirements({ ...validForm(), sort: [{ type: 'asc', field: [] }] }, true, now)).toContain('Escolha ao menos um critério de ordenação dos currículos');
    });

    it('separa as pendências pelas abas do formulário, as mesmas do currículo', () => {
        expect(positionTabErrors({ ...validForm(), contact: [] }, true, now)).toEqual(['Informe ao menos um contato']);
        expect(languagesTabErrors({ ...validForm(), spokenLanguage: [] })).toEqual(['Escolha ao menos um idioma']);
        // sem o "exige outro idioma" marcado, nada é pedido nem enviado
        expect(languagesTabErrors({ ...validForm(), hasLanguages: false, spokenLanguage: [] })).toEqual([]);
        expect(requestBodyOf({ ...validForm(), hasLanguages: false }).spokenLanguage).toEqual([]);
        expect(optionsTabErrors({ ...validForm(), disponibility: '0' })).toEqual(['Os dias para começar devem ir de 1 a 30']);
        expect(salaryTabErrors({ ...validForm(), hasClt: false })).toEqual(['Informe ao menos uma faixa salarial (CLT ou PJ)']);
    });

    it('valida os contatos como o backend', () => {
        expect(isValidContact({ type: 'whatsapp', value: '+5511999998888' })).toBe(true);
        expect(isValidContact({ type: 'whatsapp', value: '12345' })).toBe(false);
        expect(isValidContact({ type: 'email', value: 'rh@empresa.com.br' })).toBe(true);
        expect(isValidContact({ type: 'link', value: 'empresa.com.br' })).toBe(false);
        expect(isValidContact({ type: 'link', value: 'https://empresa.com.br/vaga' })).toBe(true);
    });

    it('o botão dos currículos encontrados ainda vem sem a contagem', () => {
        expect(foundResumesLabel()).toBe('Ver os currículos encontrados');
        expect(foundResumesLabel(12)).toBe('Ver os 12 currículos encontrados');
    });
});
