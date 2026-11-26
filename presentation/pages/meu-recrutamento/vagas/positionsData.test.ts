import {
    TITLE_IN_USE,
    changeExpiration,
    currentYearMonth,
    keyBodyOf,
    positionKey,
    copyFormOf,
    emptyForm,
    filtersTabErrors,
    formOf,
    foundResumesLabel,
    frequencyOptions,
    fromDateInput,
    isValidContact,
    languagesTabErrors,
    optionsTabErrors,
    optionsTabFieldErrors,
    USELESS_POSITION,
    parsePositions,
    parsePositionsOnBothSides,
    positionTabErrors,
    positionTabFieldErrors,
    salaryTabErrors,
    pendingRequirements,
    positionOf,
    removePosition,
    skillGroupsFromText,
    skillGroupsOfThePosition,
    replacePosition,
    requestBodyOf,
    senioritiesOf,
    splitByExpiration,
    toDateInput,
} from './positionsData';

const now = new Date(2026, 10, 21, 15, 0, 0);

const validForm = () => ({
    ...emptyForm(now),
    resumeType: '1',
    title: 'Desenvolvedor Java pleno',
    description: 'x'.repeat(120),
    seniority: ['pleno'],
    resumesEmail: 'rh@empresa.com.br',
    ddd: ['11', '21'],
    cltMin: 5000 as number | '',
    cltMax: 8000 as number | '',
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

    it('troca, tira e muda a expiração da vaga pela chave (mês de criação e título)', () => {
        const positions = parsePositions({
            child: [
                JSON.stringify({ title: 'A', yearMonth: '202611', expiration: { min: 1, max: 2 } }),
                JSON.stringify({ title: 'B', yearMonth: '202611', expiration: { min: 1, max: 3 } }),
                JSON.stringify({ title: 'A', yearMonth: '202610', expiration: { min: 1, max: 1 } }),
            ],
        });
        const novemberA = positions.find((position) => positionKey(position) == '202611|A') as any;
        const replaced = replacePosition(positions, { ...novemberA, description: 'nova' });
        expect(replaced.length).toBe(3);
        expect(replaced.filter((position) => position.description == 'nova').map(positionKey)).toEqual(['202611|A']);
        expect(removePosition(positions, '202611|A').map(positionKey)).toEqual(['202611|B', '202610|A']);
        expect(changeExpiration(positions, '202611|B', { min: '1', max: '99' }).filter((position) => position.title == 'B')[0].expiration).toEqual({ min: 1, max: 99 });
        expect(keyBodyOf(novemberA)).toEqual({ title: 'A', yearMonth: '202611' });
    });

    it('a vaga renomeada toma o lugar da de título antigo, no mesmo mês', () => {
        const positions = parsePositions({ child: [JSON.stringify({ title: 'Antigo', yearMonth: '202611', expiration: { min: 1, max: 2 } })] });
        const renamed = { ...positions[0], title: 'Novo' };
        expect(replacePosition(positions, renamed, '202611|Antigo').map(positionKey)).toEqual(['202611|Novo']);
    });

    it('o mês corrente da vaga nova é o de São Paulo', () => {
        // 01:00 UTC do dia 1 de dezembro ainda é 30 de novembro em São Paulo
        expect(currentYearMonth(new Date(Date.UTC(2026, 11, 1, 1, 0)))).toBe('202611');
        expect(currentYearMonth(new Date(Date.UTC(2026, 11, 1, 12, 0)))).toBe('202612');
    });

    it('o título já usado no mesmo mês é um erro do título, na aba Opções desde 2026-11-25', () => {
        expect(optionsTabFieldErrors(validForm(), true, now, true).title).toBe(TITLE_IN_USE);
        expect(optionsTabFieldErrors(validForm(), true, now, false).title).toBeUndefined();
        expect(optionsTabErrors(validForm(), true, now, true)).toEqual([TITLE_IN_USE]);
    });

    it('as senioridades da vaga são uma lista: a vaga gravada antes, com um texto só, vira lista de uma', () => {
        expect(senioritiesOf(['junior', 'pleno'])).toEqual(['junior', 'pleno']);
        expect(senioritiesOf('pleno')).toEqual(['pleno']);
        expect(senioritiesOf(undefined)).toEqual([]);
        expect(formOf({ ...positionOf(requestBodyOf(validForm(), [])), seniority: 'senior' } as any).seniority).toEqual(['senior']);
        expect(requestBodyOf({ ...validForm(), seniority: ['junior', 'pleno'] }, []).seniority).toEqual(['junior', 'pleno']);
        expect(pendingRequirements({ ...validForm(), seniority: [] }, true)).toContain('Escolha ao menos uma senioridade');
    });

    it('converte as datas do campo para o começo e o fim do dia', () => {
        const start = fromDateInput('2026-11-21', false);
        const end = fromDateInput('2026-11-21', true);
        expect(new Date(start).getHours()).toBe(0);
        expect(new Date(end).getHours()).toBe(23);
        expect(toDateInput(end)).toBe('2026-11-21');
    });

    it('monta o corpo da requisição como o backend valida', () => {
        const skills = [{ skill: 'JAVA', word: 'JAVA', type: 'skillsFromResume', category: 'skillsFromText' }];
        const body = requestBodyOf(validForm(), skills);
        expect(body.clt).toEqual({ min: 5000, max: 8000 });
        expect(body.pj).toBeUndefined();
        expect(body.ddd).toEqual([11, 21]);
        expect(body.skill).toEqual(skills);
        // como no currículo, só a vaga de tecnologia leva habilidades
        expect(requestBodyOf({ ...validForm(), resumeType: '2' }, skills).skill).toEqual([]);
        expect(typeof body.expiration.min).toBe('string');
        expect(body.mustSendInGroups).toBe(true);
        expect(body.frequencyType).toBe('daily');
    });

    it('preenche a edição com a vaga gravada', () => {
        const position = positionOf(requestBodyOf(validForm()));
        const form = formOf(position);
        expect(form.hasPj).toBe(false);
        expect(form.ddd).toEqual(['11', '21']);
        expect(form.expirationMin).toBe('2026-11-21');
    });

    it('a cópia de uma vaga (desde 2026-11-24) traz tudo dela, menos o título, com " 2" no fim, e o período, que recomeça hoje por uma semana', () => {
        const position = positionOf(requestBodyOf(validForm()));
        const original = formOf(position);
        const copy = copyFormOf(position, new Date(2026, 11, 5, 9, 0, 0));
        expect(copy.title).toBe(`${position.title} 2`);
        expect(copy.expirationMin).toBe('2026-12-05');
        expect(copy.expirationMax).toBe('2026-12-12');
        expect({ ...copy, title: original.title, expirationMin: original.expirationMin, expirationMax: original.expirationMax }).toEqual(original);
    });

    it('a vaga nova (desde 2026-11-25) começa com a área de tecnologia, que é obrigatória, e fica aberta por uma semana', () => {
        const form = emptyForm(now);
        expect(form.resumeType).toBe('1');
        expect(positionTabFieldErrors(form).resumeType).toBeUndefined();
        expect(positionTabFieldErrors({ ...form, resumeType: '' }).resumeType).toBe('Escolha a área da vaga');
        expect(form.expirationMin).toBe('2026-11-21');
        expect(form.expirationMax).toBe('2026-11-28');
    });

    it('lê as vagas e as excluídas dos dois lados do grupo (bothSides)', () => {
        const child = (title: string, max: number) => JSON.stringify({ title, expiration: { min: '0', max: String(max) } });
        const sides = parsePositionsOnBothSides({ jn_grouper: { child: [child('ativa', 2)] }, jn_inactive_grouper: { child: [child('excluida', 1)] } });
        expect(sides.positions.map((position) => position.title)).toEqual(['ativa']);
        expect(sides.deleted.map((position) => position.title)).toEqual(['excluida']);
        // um lado sem o grupo vem como json vazio
        expect(parsePositionsOnBothSides({ jn_grouper: {}, jn_inactive_grouper: {} })).toEqual({ positions: [], deleted: [] });
    });

    it('lista o que falta no formulário', () => {
        expect(pendingRequirements(validForm(), true, now)).toEqual([]);
        expect(pendingRequirements(emptyForm(now), true, now)).toEqual(
            expect.arrayContaining(['O título deve ter de 10 a 100 caracteres', 'Escolha ao menos uma senioridade']),
        );
        // a vaga nova nasce home office
        expect(emptyForm(now).ddd).toEqual(['10']);
        expect(pendingRequirements({ ...validForm(), ddd: [] }, true, now)).toContain('Escolha ao menos uma região');
        expect(pendingRequirements({ ...validForm(), hasClt: false }, true, now)).toContain('Informe ao menos uma faixa salarial (CLT ou PJ)');
        expect(pendingRequirements({ ...validForm(), cltMin: 9000 }, true, now)).toContain('O máximo da faixa CLT não pode ser menor que o mínimo');
        expect(pendingRequirements({ ...validForm(), expirationMin: '2026-11-01' }, true, now)).toContain('O início da vaga não pode ser antes de hoje');
        // uma vaga antiga editada guarda o início que já passou
        expect(pendingRequirements({ ...validForm(), expirationMin: '2026-11-01' }, false, now)).toEqual([]);
        expect(pendingRequirements({ ...validForm(), sort: [{ type: 'asc', field: [] }] }, true, now)).toContain('Escolha ao menos um critério de ordenação dos currículos');
    });

    it('separa as pendências pelas abas do formulário, as mesmas do currículo', () => {
        // o título, os contatos e o período ficam na aba Opções desde 2026-11-25
        expect(positionTabErrors({ ...validForm(), title: 'curto', contact: [], expirationMin: '' })).toEqual([]);
        expect(optionsTabErrors({ ...validForm(), title: 'curto' }, true, now)).toEqual(['O título deve ter de 10 a 100 caracteres']);
        expect(optionsTabErrors({ ...validForm(), contact: [] }, true, now)).toEqual(['Informe ao menos um contato']);
        expect(optionsTabErrors({ ...validForm(), expirationMin: '2026-11-01' }, true, now)).toEqual(['O início da vaga não pode ser antes de hoje']);
        expect(languagesTabErrors({ ...validForm(), spokenLanguage: [] })).toEqual(['Escolha ao menos um idioma']);
        // sem o "exige outro idioma" marcado, nada é pedido nem enviado
        expect(languagesTabErrors({ ...validForm(), hasLanguages: false, spokenLanguage: [] })).toEqual([]);
        expect(requestBodyOf({ ...validForm(), hasLanguages: false }).spokenLanguage).toEqual([]);
        expect(filtersTabErrors({ ...validForm(), disponibility: '0' })).toEqual(['Os dias para começar devem ir de 1 a 30']);
        // a ordem dos currículos é da aba Opções, a última antes de salvar
        expect(optionsTabErrors({ ...validForm(), disponibility: '0' })).toEqual([]);
        expect(optionsTabErrors({ ...validForm(), sort: [{ type: 'asc', field: [] }] })).toEqual(['Escolha ao menos um critério de ordenação dos currículos']);
        expect(salaryTabErrors({ ...validForm(), hasClt: false })).toEqual(['Informe ao menos uma faixa salarial (CLT ou PJ)']);
    });

    it('pede o e-mail que recebe os currículos, salvo em "Não receber currículos"', () => {
        expect(optionsTabErrors({ ...validForm(), resumesEmail: '' })).toEqual(['Informe o e-mail para o qual enviar os currículos']);
        expect(optionsTabErrors({ ...validForm(), frequencyType: 'instantly', resumesEmail: 'rh@' })).toEqual(['Informe um e-mail válido para receber os currículos']);
        expect(optionsTabErrors({ ...validForm(), frequencyType: 'none', resumesEmail: '' })).toEqual([]);
        expect(requestBodyOf(validForm()).resumesEmail).toBe('rh@empresa.com.br');
        // sem envio, o e-mail não vai
        expect(requestBodyOf({ ...validForm(), frequencyType: 'none' }).resumesEmail).toBeUndefined();
    });

    it('monta as listas da aba Habilidades pela resposta de skills/fromText e pelas habilidades gravadas', () => {
        // as encontradas no texto vão para as desejáveis (a lista principal); as já obrigatórias voltam como excluídas
        const groups = skillGroupsFromText({ skill: [{ skill: 'JAVA', label: 'JAVA', parent: [] }, { skill: 'SQL', label: 'SQL', parent: [] }], excludedSkill: [{ skill: 'DOCKER', label: 'DOCKER', parent: [] }] });
        expect(groups.map((group: any) => [group.name, group.category, group.list.length, !!group.main])).toEqual([
            ['shouldSkills', 'shouldSkills', 2, true],
            ['skillsFromResume', 'skillsFromText', 1, false],
        ]);
        const saved = [
            { skill: 'ORACLE', word: 'ORACLE DB', type: 'skillsFromResume', category: 'skillsFromText', parent: ['SQL'] },
            { skill: 'DOCKER', word: 'DOCKER', type: 'shouldSkills', category: 'shouldSkills' },
            { skill: 'SQL', word: 'SQL', type: 'parent', category: 'parent' },
            { skill: 'JAVA', word: 'JAVA', type: 'isPieceOfOtherWord', category: 'discardedSkills', associated: 'JAVASCRIPT' },
        ];
        const { groups: savedGroups, context } = skillGroupsOfThePosition(saved, 'hash');
        expect(savedGroups[0].list.map((skill: any) => [skill.label, skill.parent])).toEqual([['DOCKER', []]]);
        expect(savedGroups[1].list.map((skill: any) => skill.label)).toEqual(['ORACLE DB (ORACLE)']);
        expect(Object.keys(context.discardedSkills)).toEqual(['isPieceOfOtherWord']);
        expect(context.cacheHash).toBe('hash');
    });

    it('"os próprios candidatos enviam" é uma opção de recebimento (pede o e-mail) e o erro de cada campo da aba Vaga fica no campo', () => {
        expect(frequencyOptions.map((option) => option.value)).toEqual(['none', 'byTheCandidates', 'instantly', 'hourly', 'daily', 'weekly']);
        const byTheCandidates = { ...validForm(), frequencyType: 'byTheCandidates' };
        expect(requestBodyOf(byTheCandidates)).toMatchObject({ frequencyType: 'byTheCandidates', resumesEmail: 'rh@empresa.com.br' });
        expect(requestBodyOf(byTheCandidates)).not.toHaveProperty('visibleToCandidates');
        expect(requestBodyOf(byTheCandidates)).not.toHaveProperty('mustSendToResumes');
        expect(optionsTabErrors({ ...byTheCandidates, resumesEmail: '' })).toEqual(['Informe o e-mail para o qual enviar os currículos']);
        expect(formOf(positionOf(requestBodyOf(byTheCandidates))).frequencyType).toBe('byTheCandidates');
        expect(Object.keys(positionTabFieldErrors({ ...validForm(), title: 'curto', description: '' }))).toEqual(['description']);
        expect(Object.keys(optionsTabFieldErrors({ ...validForm(), title: 'curto', contact: [], expirationMax: '2026-11-20' }, true, now))).toEqual(['title', 'contact', 'expiration']);
    });

    it('os contatos (desde 2026-11-25) só são pedidos e enviados com a divulgação nos grupos', () => {
        const outOfTheGroups = { ...validForm(), mustSendInGroups: false, contact: [] };
        expect(optionsTabErrors(outOfTheGroups, true, now)).toEqual([]);
        expect(requestBodyOf(outOfTheGroups)).not.toHaveProperty('contact');
        expect(requestBodyOf(validForm()).contact).toEqual([{ type: 'email', value: 'rh@empresa.com.br' }]);
    });

    it('fora dos grupos e sem receber currículos a vaga não iria a lugar nenhum (desde 2026-11-25)', () => {
        expect(optionsTabErrors({ ...validForm(), mustSendInGroups: false, frequencyType: 'none' }, true, now)).toEqual([USELESS_POSITION]);
        expect(optionsTabErrors({ ...validForm(), mustSendInGroups: true, frequencyType: 'none' }, true, now)).toEqual([]);
        expect(optionsTabErrors({ ...validForm(), mustSendInGroups: false, frequencyType: 'byTheCandidates' }, true, now)).toEqual([]);
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
