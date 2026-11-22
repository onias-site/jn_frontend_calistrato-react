/**
 * Os dados da tela "Meu Recrutamento → Vagas" (desde 2026-11-21): as vagas que o usuário logado cadastrou vêm do grupo
 * do e-mail dele no jn_grouper (parent jn_login_email, child vis_position), um texto JSON por vaga com o que ele
 * preencheu. As regras do formulário repetem as de VisEntityPosition no backend, para o usuário saber o que falta antes
 * de enviar.
 */

export type SalaryRange = { min: number; max: number };

export type Language = { name: string; level: number };

export type SortRule = { type: 'asc' | 'desc'; field: string[] };

export type Contact = { type: 'whatsapp' | 'email' | 'link'; value: string };

/** Uma vaga como o grupo a guarda (os campos que o usuário preencheu, as datas em milissegundos). */
export type Position = {
    title: string;
    description: string;
    resumeType: number;
    seniority: string;
    ddd: number[];
    clt?: SalaryRange;
    pj?: SalaryRange;
    disponibility: number;
    temporallyJobTime: number;
    spokenLanguage: Language[];
    skill: any[];
    negotiableClaim: boolean;
    pcd: boolean;
    travel: boolean;
    expiration: { min: number; max: number };
    sort: SortRule[];
    contact: Contact[];
    mustSendInGroups: boolean;
    mustSendToResumes: boolean;
    visibleToCandidates: boolean;
    frequencyType: string;
};

/** O formulário do modal de criar e de editar: as datas como yyyy-mm-dd e as habilidades como listas de nomes. */
export type PositionForm = {
    title: string;
    description: string;
    resumeType: string;
    seniority: string;
    ddd: string[];
    hasClt: boolean;
    cltMin: number | '';
    cltMax: number | '';
    hasPj: boolean;
    pjMin: number | '';
    pjMax: number | '';
    disponibility: number | string;
    temporallyJobTime: number | string;
    hasLanguages: boolean;
    spokenLanguage: Language[];
    negotiableClaim: boolean;
    pcd: boolean;
    travel: boolean;
    expirationMin: string;
    expirationMax: string;
    sort: SortRule[];
    contact: Contact[];
    mustSendInGroups: boolean;
    mustSendToResumes: boolean;
    visibleToCandidates: boolean;
    frequencyType: string;
};

export const seniorityOptions = [
    { value: 'estag', label: 'Estágio' },
    { value: 'junior', label: 'Júnior' },
    { value: 'pleno', label: 'Pleno' },
    { value: 'senior', label: 'Sênior' },
    { value: 'especialista', label: 'Especialista' },
];

export const frequencyOptions = [
    { value: 'none', label: 'Não enviar' },
    { value: 'instantly', label: 'Na hora' },
    { value: 'hourly', label: 'De hora em hora' },
    { value: 'daily', label: 'Uma vez por dia' },
    { value: 'weekly', label: 'Uma vez por semana' },
];

export const sortFieldOptions = [
    { value: 'pj', label: 'Pretensão PJ' },
    { value: 'clt', label: 'Pretensão CLT' },
    { value: 'experience', label: 'Experiência' },
    { value: 'shouldSkillsTotal', label: 'Habilidades desejáveis' },
];

export const sortTypeOptions = [
    { value: 'asc', label: 'Crescente' },
    { value: 'desc', label: 'Decrescente' },
];

export const contactTypeOptions = [
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'email', label: 'E-mail' },
    { value: 'link', label: 'Link' },
];

export const languageLevelOptions = [
    { value: '1', label: 'Intermediário (lê e escreve bem, entende parte do que lhe dizem, porém tem lentidão ao expressar ideias neste idioma)' },
    { value: '2', label: 'Fluente (lê e escreve quase na mesma velocidade do idioma nativo, se expressa bem e entende os regionalismos em parte ou totalmente)' },
];

// os mesmos limites de VisEntityPosition e VisJsonCommonsFields no backend
export const LIMITS = {
    titleMin: 10,
    titleMax: 100,
    descriptionMin: 100,
    descriptionMax: 5000,
    salaryMin: 1000,
    salaryMax: 100000,
    disponibilityMax: 30,
    temporallyJobTimeMax: 12,
    dddMax: 67,
    contactValueMax: 500,
};

// as mesmas expressões de VisPositionContactTypes no backend
const contactPatterns: Record<Contact['type'], RegExp> = {
    whatsapp: /^\+?[0-9]{10,15}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    link: /^https?:\/\/[^\s/$.?#][^\s]*$/,
};

export const isValidContact = (contact: Contact) => !!contact.value && contactPatterns[contact.type].test(contact.value.trim());

const pad = (value: number) => String(value).padStart(2, '0');

/** 1763694000000 vira "2025-11-21" (no fuso do navegador). */
export const toDateInput = (milliseconds: number | string) => {
    const date = new Date(Number(milliseconds));
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

/** "2026-11-21" vira o começo (00:00:00.000) ou o fim (23:59:59.999) do dia, em milissegundos. */
export const fromDateInput = (text: string, endOfTheDay: boolean) => {
    const [year, month, day] = text.split('-').map(Number);
    const date = endOfTheDay ? new Date(year, month - 1, day, 23, 59, 59, 999) : new Date(year, month - 1, day, 0, 0, 0, 0);
    return date.getTime();
};

/** 1763694000000 vira "21/11/2026 23:59". */
export const dateTimeLabel = (milliseconds: number | string) => {
    const date = new Date(Number(milliseconds));
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const today = (now: Date = new Date()) => `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

/** As vagas do grupo (cada filho é um texto JSON); as mais novas de expirar primeiro. */
export const parsePositions = (group: any): Position[] =>
    ((group && group.child) || [])
        .map((child: any) => (typeof child == 'string' ? JSON.parse(child) : child))
        .map((position: any) => ({ ...position, expiration: { min: Number(position.expiration?.min), max: Number(position.expiration?.max) } }))
        .sort((a: Position, b: Position) => b.expiration.max - a.expiration.max);

export const isExpired = (position: Position, now: number = Date.now()) => position.expiration.max < now;

/** As vagas nas duas abas: dentro da data de expiração e expiradas. */
export const splitByExpiration = (positions: Position[], now: number = Date.now()) => ({
    active: positions.filter((position) => !isExpired(position, now)),
    expired: positions.filter((position) => isExpired(position, now)),
});

/** A lista com a vaga gravada no lugar da de mesmo título (ou acrescentada). */
export const replacePosition = (positions: Position[], saved: Position) => [saved, ...positions.filter((position) => position.title != saved.title)];

export const removePosition = (positions: Position[], title: string) => positions.filter((position) => position.title != title);

/** A lista com a nova expiração da vaga de mesmo título. */
export const changeExpiration = (positions: Position[], title: string, expiration: { min: any; max: any }) =>
    positions.map((position) => (position.title == title ? { ...position, expiration: { min: Number(expiration.min), max: Number(expiration.max) } } : position));

/** O rótulo do botão dos currículos encontrados: ainda sem a contagem (o botão vem antes da busca). */
export const foundResumesLabel = (resumes?: number) => (resumes == null ? 'Ver os currículos encontrados' : `Ver os ${resumes} currículos encontrados`);

export const emptyForm = (now: Date = new Date()): PositionForm => {
    const inThirtyDays = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30);
    return {
        title: '',
        description: '',
        resumeType: '1',
        seniority: '',
        ddd: [],
        hasClt: true,
        cltMin: '',
        cltMax: '',
        hasPj: false,
        pjMin: '',
        pjMax: '',
        disponibility: 0,
        temporallyJobTime: 0,
        hasLanguages: false,
        spokenLanguage: [],
        negotiableClaim: false,
        pcd: false,
        travel: false,
        expirationMin: today(now),
        expirationMax: today(inThirtyDays),
        sort: [{ type: 'desc', field: ['experience'] }],
        contact: [{ type: 'email', value: '' }],
        mustSendInGroups: true,
        mustSendToResumes: true,
        visibleToCandidates: true,
        frequencyType: 'daily',
    };
};


/** O formulário de "Editar", preenchido com a vaga. */
export const formOf = (position: Position): PositionForm => ({
    title: position.title,
    description: position.description,
    resumeType: String(position.resumeType),
    seniority: position.seniority,
    ddd: (position.ddd || []).map(String),
    hasClt: !!position.clt,
    cltMin: position.clt ? position.clt.min : '',
    cltMax: position.clt ? position.clt.max : '',
    hasPj: !!position.pj,
    pjMin: position.pj ? position.pj.min : '',
    pjMax: position.pj ? position.pj.max : '',
    disponibility: position.disponibility || 0,
    temporallyJobTime: position.temporallyJobTime || 0,
    hasLanguages: (position.spokenLanguage || []).length > 0,
    spokenLanguage: (position.spokenLanguage || []).map((language) => ({ name: language.name, level: Number(language.level) })),
    negotiableClaim: !!position.negotiableClaim,
    pcd: !!position.pcd,
    travel: !!position.travel,
    expirationMin: toDateInput(position.expiration.min),
    expirationMax: toDateInput(position.expiration.max),
    sort: position.sort && position.sort.length ? position.sort : [{ type: 'desc', field: ['experience'] }],
    contact: position.contact && position.contact.length ? position.contact : [{ type: 'email', value: '' }],
    mustSendInGroups: position.mustSendInGroups !== false,
    mustSendToResumes: position.mustSendToResumes !== false,
    visibleToCandidates: position.visibleToCandidates !== false,
    frequencyType: position.frequencyType || 'daily',
});


/**
 * O corpo da requisição de criar ou editar: a vaga como o backend a valida (as datas como texto, em milissegundos). As
 * habilidades vêm da aba Habilidades (loadSkillsContext da store), e só a vaga de tecnologia as leva.
 */
export const requestBodyOf = (form: PositionForm, skills: any[] = []) => {
    const body: any = {
        title: form.title.trim(),
        description: form.description.trim(),
        resumeType: Number(form.resumeType),
        seniority: form.seniority,
        ddd: form.ddd.map(Number),
        disponibility: Number(form.disponibility),
        temporallyJobTime: Number(form.temporallyJobTime),
        spokenLanguage: form.hasLanguages ? form.spokenLanguage : [],
        skill: isTechPosition(form) ? skills : [],
        negotiableClaim: form.negotiableClaim,
        pcd: form.pcd,
        travel: form.travel,
        expiration: { min: String(fromDateInput(form.expirationMin, false)), max: String(fromDateInput(form.expirationMax, true)) },
        sort: form.sort,
        contact: form.contact.map((contact) => ({ type: contact.type, value: contact.value.trim() })),
        mustSendInGroups: form.mustSendInGroups,
        mustSendToResumes: form.mustSendToResumes,
        visibleToCandidates: form.visibleToCandidates,
        frequencyType: form.frequencyType,
    };
    if (form.hasClt) body.clt = { min: Number(form.cltMin), max: Number(form.cltMax) };
    if (form.hasPj) body.pj = { min: Number(form.pjMin), max: Number(form.pjMax) };
    return body;
};

/** A vaga como fica na lista depois de gravada (o que foi enviado, com as datas em número). */
export const positionOf = (body: any): Position => ({ ...body, expiration: { min: Number(body.expiration.min), max: Number(body.expiration.max) } });

const salaryErrors = (name: string, min: number | '', max: number | '') => {
    const { salaryMin, salaryMax } = LIMITS;
    const outOfRange = (value: number | '') => value === '' || value < salaryMin || value > salaryMax;
    if (outOfRange(min) || outOfRange(max)) return [`A faixa ${name} deve ir de R$ ${salaryMin.toLocaleString('pt-BR')} a R$ ${salaryMax.toLocaleString('pt-BR')}`];
    if (Number(max) < Number(min)) return [`O máximo da faixa ${name} não pode ser menor que o mínimo`];
    return [];
};


// o campo apagado ('') e o 0 digitado ('0') ficam fora da faixa, como no currículo (IntegerFieldComponent); só o checkbox põe o 0
const isOutOfIntegerRange = (value: number | string, max: number) => value === '' || value === '0' || !Number.isInteger(Number(value)) || Number(value) < 0 || Number(value) > max;

/** Aba "Vaga": título, descrição, área, contatos e as datas de início e de fim da vaga. */
/**
 * Os erros da aba "Vaga" por campo, mostrados embaixo de cada um, como na aba Currículo (LabelComponent): título,
 * descrição, área, contatos e as datas (expiration).
 */
export const positionTabFieldErrors = (form: PositionForm, creating: boolean, now: Date = new Date()) => {
    const fieldErrors: Record<string, string> = {};
    const fail = (field: string, message: string) => (fieldErrors[field] = fieldErrors[field] || message);
    const title = form.title.trim();
    const description = form.description.trim();
    (title.length < LIMITS.titleMin || title.length > LIMITS.titleMax) && fail('title', `O título deve ter de ${LIMITS.titleMin} a ${LIMITS.titleMax} caracteres`);
    (description.length < LIMITS.descriptionMin || description.length > LIMITS.descriptionMax) &&
        fail('description', `A descrição deve ter de ${LIMITS.descriptionMin} a ${LIMITS.descriptionMax.toLocaleString('pt-BR')} caracteres (tem ${description.length})`);
    !form.resumeType && fail('resumeType', 'Escolha a área da vaga');
    form.contact.length < 1 && fail('contact', 'Informe ao menos um contato');
    form.contact.some((contact) => !isValidContact(contact) || contact.value.trim().length > LIMITS.contactValueMax) && fail('contact', 'Confira os contatos: WhatsApp com DDD, e-mail válido ou link começando com http');
    if (!form.expirationMin || !form.expirationMax) {
        fail('expiration', 'Informe o início e o fim da vaga');
        return fieldErrors;
    }
    creating && form.expirationMin < today(now) && fail('expiration', 'O início da vaga não pode ser antes de hoje');
    form.expirationMax < form.expirationMin && fail('expiration', 'O fim da vaga não pode ser antes do início');
    return fieldErrors;
};

/** Aba "Vaga": título, descrição, área, contatos e as datas de início e de fim da vaga. */
export const positionTabErrors = (form: PositionForm, creating: boolean, now: Date = new Date()) => Object.values(positionTabFieldErrors(form, creating, now));

/** Aba "Idiomas": marcado o "exige outro idioma", ao menos um idioma, cada um com o seu nível. */
export const languagesTabErrors = (form: PositionForm) => {
    if (!form.hasLanguages) return [];
    if (!form.spokenLanguage.length) return ['Escolha ao menos um idioma'];
    if (form.spokenLanguage.some((language) => !language.name || ![1, 2].includes(language.level))) return ['Escolha o nível de cada idioma'];
    return [];
};

/** Aba "Opções": regiões, senioridade, dias para começar, temporário e a ordem dos currículos encontrados. */
export const optionsTabErrors = (form: PositionForm) => {
    const errors: string[] = [];
    (form.ddd.length < 1 || form.ddd.length > LIMITS.dddMax) && errors.push('Escolha ao menos uma região');
    !form.seniority && errors.push('Escolha a senioridade');
    isOutOfIntegerRange(form.disponibility, LIMITS.disponibilityMax) && errors.push(`Os dias para começar devem ir de 1 a ${LIMITS.disponibilityMax}`);
    isOutOfIntegerRange(form.temporallyJobTime, LIMITS.temporallyJobTimeMax) && errors.push(`A duração do temporário deve ir de 1 a ${LIMITS.temporallyJobTimeMax} meses`);
    (form.sort.length < 1 || form.sort.some((rule) => rule.field.length < 1)) && errors.push('Escolha ao menos um critério de ordenação dos currículos');
    return errors;
};

/** Aba "Salários": ao menos uma faixa (CLT ou PJ), cada uma dentro dos limites. */
export const salaryTabErrors = (form: PositionForm) => {
    const errors: string[] = [];
    !form.hasClt && !form.hasPj && errors.push('Informe ao menos uma faixa salarial (CLT ou PJ)');
    form.hasClt && errors.push(...salaryErrors('CLT', form.cltMin, form.cltMax));
    form.hasPj && errors.push(...salaryErrors('PJ', form.pjMin, form.pjMax));
    return errors;
};

/** Tudo o que falta ou está errado no formulário, aba por aba; vazio, a vaga pode ser gravada. */
export const pendingRequirements = (form: PositionForm, creating: boolean, now: Date = new Date()) => [
    ...positionTabErrors(form, creating, now),
    ...languagesTabErrors(form),
    ...optionsTabErrors(form),
    ...salaryTabErrors(form),
];

// ---- aba Habilidades (como a do currículo: as habilidades encontradas no texto, aqui a descrição da vaga, por skills/fromText)

/** Como no currículo, só a vaga de tecnologia (área 1) tem a aba Habilidades. */
export const isTechPosition = (form: PositionForm) => form.resumeType == '1';

// os nomes e as categorias de VisPositionSkillTypes e VisPositionSkillCategories no backend
export const REQUIRED_SKILLS = 'skillsFromResume';
export const DESIRED_SKILLS = 'shouldSkills';

const requiredSkillsGroup = (list: any[]) => ({
    title: 'Habilidades OBRIGATÓRIAS da vaga',
    help: 'As habilidades encontradas na descrição da vaga. Os currículos encontrados precisam ter todas elas; arraste para a lista de desejáveis as que não forem obrigatórias.',
    name: REQUIRED_SKILLS,
    category: 'skillsFromText',
    main: true,
    list,
});

const desiredSkillsGroup = (list: any[]) => ({
    title: 'Habilidades DESEJÁVEIS da vaga',
    help: 'Habilidades que contam a favor do currículo, mas não são exigidas. Arraste para cá, da lista de obrigatórias, as que forem apenas desejáveis.',
    name: DESIRED_SKILLS,
    category: 'shouldSkills',
    list,
});

/**
 * O rótulo que o backend dá a cada habilidade em skills/fromText: a própria habilidade, ou "palavra (habilidade)" quando
 * foi encontrada por outra palavra; as listas esperam sempre o parent como array.
 */
export const toSkillListItem = (savedSkill: any) => {
    const foundByAnotherWord = savedSkill.word && savedSkill.word != savedSkill.skill;
    const label = foundByAnotherWord ? `${savedSkill.word} (${savedSkill.skill})` : savedSkill.skill;
    const parent = savedSkill.parent || [];
    return { ...savedSkill, label, parent };
};

/** As duas listas da aba a partir da resposta de skills/fromText: as encontradas são as obrigatórias, as excluídas as desejáveis. */
export const skillGroupsFromText = (response: any) => [requiredSkillsGroup(response.skill || []), desiredSkillsGroup(response.excludedSkill || [])];

/**
 * As listas e o contexto da aba a partir das habilidades gravadas na vaga ("Editar"): cada uma volta à lista do seu type,
 * as descartadas voltam ao contexto separadas pelo motivo, e as implícitas (type parent) a aba recalcula.
 */
export const skillGroupsOfThePosition = (skills: any[], cacheHash: string) => {
    const savedSkills = (skills || []).map(toSkillListItem);
    const ofType = (type: string) => savedSkills.filter((skill) => skill.type == type);
    const discardedSkills: Record<string, any[]> = {};
    savedSkills.filter((skill) => skill.category == 'discardedSkills').forEach((skill) => (discardedSkills[skill.type] = [...(discardedSkills[skill.type] || []), skill]));
    return {
        groups: [requiredSkillsGroup(ofType(REQUIRED_SKILLS)), desiredSkillsGroup(ofType(DESIRED_SKILLS))],
        context: { discardedSkills, cacheHash },
    };
};
