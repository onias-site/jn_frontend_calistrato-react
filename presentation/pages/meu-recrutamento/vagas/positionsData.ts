/**
 * Os dados da tela "Meu Recrutamento → Vagas" (desde 2026-11-21): as vagas que o usuário logado cadastrou vêm do grupo
 * do e-mail dele no jn_grouper (parent jn_login_email, child vis_position), um texto JSON por vaga com o que ele
 * preencheu. As regras do formulário repetem as de VisEntityPosition no backend, para o usuário saber o que falta antes
 * de enviar.
 */

export type SalaryRange = { min: number; max: number };

export type Language = { name: string; level: number };

// um critério por regra desde 2026-11-23; value é o nome do idioma (spokenLanguage) ou da habilidade (skill) do critério
export type SortRule = { type: 'asc' | 'desc'; field: string[]; value?: string };

export type Contact = { type: 'whatsapp' | 'email' | 'link'; value: string };

/** Uma vaga como o grupo a guarda (os campos que o usuário preencheu, as datas em milissegundos). */
export type Position = {
    title: string;
    // o mês de criação (yyyyMM), parte da chave desde 2026-11-24; as vagas gravadas antes não o têm
    yearMonth?: string;
    description: string;
    resumeType: number;
    // uma lista desde 2026-11-23; as vagas gravadas antes guardam um texto só
    seniority: string | string[];
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
    frequencyType: string;
    resumesEmail?: string;
};

/** O formulário do modal de criar e de editar: as datas como yyyy-mm-dd e as habilidades como listas de nomes. */
export type PositionForm = {
    title: string;
    description: string;
    resumeType: string;
    // as senioridades aceitas pela vaga (escolha múltipla desde 2026-11-23)
    seniority: string[];
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
    // o usuário mexeu na ordem: a partir daí ela não volta a seguir a padrão (só perde os critérios que a vaga deixou de pedir)
    sortEdited: boolean;
    contact: Contact[];
    mustSendInGroups: boolean;
    frequencyType: string;
    // o e-mail que recebe os currículos encontrados (o do recrutador logado, por padrão); sem uso na frequência 'none'
    resumesEmail: string;
};

/** As senioridades da vaga como lista: a vaga gravada antes de 2026-11-23 guarda um texto só. */
export const senioritiesOf = (seniority: string | string[] | undefined): string[] => {
    if (Array.isArray(seniority)) return seniority;
    return seniority ? [seniority] : [];
};

export const seniorityOptions = [
    { value: 'estag', label: 'Estágio' },
    { value: 'junior', label: 'Júnior' },
    { value: 'pleno', label: 'Pleno' },
    { value: 'senior', label: 'Sênior' },
    { value: 'especialista', label: 'Especialista' },
];

export const frequencyOptions = [
    { value: 'none', label: 'Não receber currículos' },
    // desde 2026-11-23, no lugar do antigo visibleToCandidates: a vaga aparece aos candidatos aderentes, que enviam o currículo
    { value: 'byTheCandidates', label: 'Os próprios candidatos enviam seus currículos' },
    { value: 'instantly', label: 'Receber currículos instantâneamente' },
    { value: 'hourly', label: 'Receber currículos uma vez por hora' },
    { value: 'daily', label: 'Receber currículos uma vez por dia' },
    { value: 'weekly', label: 'Receber currículos uma vez por semana' },
];

/**
 * Um critério de ordem dos currículos que a vaga oferece (desde 2026-11-23): key identifica a opção no combo (o campo, ou
 * "campo:valor" no idioma e na habilidade), types dá o texto de cada sentido e defaultType o sentido da ordem padrão.
 */
export type SortCriterion = {
    key: string;
    label: string;
    field: string;
    value?: string;
    defaultType: 'asc' | 'desc';
    types: { asc: string; desc: string };
    // entra na ordem padrão (as habilidades desejáveis uma a uma só entram quando o usuário as escolhe)
    inDefault: boolean;
};

const criterion = (field: string, label: string, defaultType: 'asc' | 'desc', asc: string, desc: string, value?: string, inDefault = true): SortCriterion => ({
    key: value ? `${field}:${value}` : field,
    label,
    field,
    value,
    defaultType,
    types: { asc, desc },
    inDefault,
});

/** A chave da opção de uma regra de ordem: o campo, ou "campo:valor" no idioma e na habilidade. */
export const sortKeyOf = (rule: SortRule) => (rule.value ? `${rule.field[0]}:${rule.value}` : rule.field[0] || '');

/**
 * Os critérios de ordem que a vaga oferece, na prioridade da ordem padrão. Só entra o que a vaga pede: a pretensão CLT ou
 * PJ quando informa a faixa, um nível por idioma exigido, a experiência, o DDD, as habilidades só na vaga de tecnologia (lidas do texto da vaga),
 * a disponibilidade e o trabalho temporário quando diferentes de 0 e, por último, uma opção por habilidade desejável.
 */
export const sortCriteriaOf = (form: PositionForm, desiredSkills: string[]): SortCriterion[] => {
    const tech = isTechPosition(form);
    const criteria: SortCriterion[] = [];
    form.hasClt && criteria.push(criterion('clt', 'Pretensão CLT', 'asc', 'Candidatos mais baratos', 'Candidatos mais caros'));
    form.hasPj && criteria.push(criterion('pj', 'Pretensão PJ', 'asc', 'Candidatos mais baratos', 'Candidatos mais caros'));
    form.hasLanguages &&
        form.spokenLanguage.forEach((language) =>
            criteria.push(criterion('spokenLanguage', `Nível de ${language.name}`, 'desc', `Menor nível de ${language.name} primeiro`, `Maior nível de ${language.name} primeiro`, language.name))
        );
    criteria.push(criterion('experience', 'Experiência', 'desc', 'Candidatos mais inexperientes', 'Candidatos mais experientes'));
    // o menor DDD do currículo, sem contar o home office (só home office vai para o fim); na ordem padrão desde 2026-11-25,
    // logo depois das pretensões e da experiência
    criteria.push(criterion('ddd', 'DDD', 'asc', 'DDDs menores primeiro', 'DDDs maiores primeiro'));
    tech && criteria.push(criterion('skillsTotal', 'Habilidades totais dos currículos', 'desc', 'Menor quantidade de habilidades', 'Maior quantidade de habilidades'));
    tech && criteria.push(criterion('shouldSkillsTotal', 'Habilidades desejáveis', 'desc', 'Menor quantidade de habilidades desejáveis', 'Maior quantidade de habilidades desejáveis'));
    Number(form.disponibility) > 0 && criteria.push(criterion('disponibility', 'Disponibilidade para começar', 'asc', 'Quem começa antes aparece primeiro', 'Quem começa depois aparece primeiro'));
    Number(form.temporallyJobTime) > 0 &&
        criteria.push(criterion('temporallyJobTime', 'Tempo de trabalho temporário', 'asc', 'Quem aceita menos meses aparece primeiro', 'Quem aceita mais meses aparece primeiro'));
    tech &&
        desiredSkills.forEach((skill) => criteria.push(criterion('skill', `Habilidade ${skill}`, 'desc', `Quem tiver ${skill} aparece depois`, `Quem tiver ${skill} aparece primeiro`, skill, false)));
    return criteria;
};

/** A regra de ordem de um critério, no sentido dado (ou no padrão dele). */
export const sortRuleOf = (criterion: SortCriterion, type: 'asc' | 'desc' = criterion.defaultType): SortRule =>
    criterion.value ? { type, field: [criterion.field], value: criterion.value } : { type, field: [criterion.field] };

/** A ordem padrão: os critérios que a vaga pede, na prioridade, cada um no seu sentido padrão. */
export const defaultSortOf = (form: PositionForm, desiredSkills: string[]) =>
    sortCriteriaOf(form, desiredSkills)
        .filter((criterion) => criterion.inDefault)
        .map((criterion) => sortRuleOf(criterion));

/**
 * A ordem a mostrar: a padrão enquanto o usuário não mexe nela; depois, a dele sem os critérios que a vaga deixou de
 * pedir (vazia, volta a padrão).
 */
export const sortToShow = (form: PositionForm, desiredSkills: string[]) => {
    const defaultSort = defaultSortOf(form, desiredSkills);
    if (!form.sortEdited) return defaultSort;
    const keys = sortCriteriaOf(form, desiredSkills).map((criterion) => criterion.key);
    const kept = form.sort.filter((rule) => keys.includes(sortKeyOf(rule)));
    return kept.length ? kept : defaultSort;
};

/** A ordem gravada antes de 2026-11-23 juntava critérios numa regra: aqui cada critério vira uma regra. */
export const sortOfThePosition = (sort: SortRule[] | undefined): SortRule[] =>
    (sort || []).flatMap((rule) => (rule.field || []).map((field) => (rule.value ? { type: rule.type, field: [field], value: rule.value } : { type: rule.type, field: [field] })));

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
    // todas as regiões mais o home office (a vaga simplificada, desde 2026-11-24)
    dddMax: 68,
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

/**
 * As vagas dos dois lados do grupo do e-mail (grouper/.../bothSides, desde 2026-11-24): jn_grouper com as vagas de
 * vis_position (as duas primeiras abas) e jn_inactive_grouper com as excluídas, que estão na gêmea vis_inactive_position.
 */
export const parsePositionsOnBothSides = (groups: any) => ({
    positions: parsePositions(groups && groups.jn_grouper),
    deleted: parsePositions(groups && groups.jn_inactive_grouper),
});

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

/**
 * O mês corrente como yyyyMM no fuso de São Paulo: o mês de criação de uma vaga nova (o backend usa o mesmo, desde
 * 2026-11-24 parte da chave da vaga com o recrutador e o título).
 */
export const currentYearMonth = (now: Date = new Date()): string => {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit' }).formatToParts(now);
    const part = (type: string) => (parts.find((piece) => piece.type == type) || { value: '' }).value;
    return `${part('year')}${part('month')}`;
};

/**
 * A identidade da vaga na tela (desde 2026-11-24): o mês de criação e o título, a chave dela no backend (o recrutador é
 * sempre o usuário logado). Duas vagas de mesmo título em meses diferentes são vagas diferentes.
 */
export const positionKey = (position: { title: string; yearMonth?: string }) => `${position.yearMonth || ''}|${position.title}`;

/** O corpo das ações sobre uma vaga gravada (excluir, inativar, reativar, restaurar): a chave dela. */
export const keyBodyOf = (position: Position) => ({ title: position.title, yearMonth: position.yearMonth });

/** A lista com a vaga gravada no lugar da de mesma chave (ou da chave anterior, quando o título mudou), ou acrescentada. */
export const replacePosition = (positions: Position[], saved: Position, replacedKey: string = positionKey(saved)) => [
    saved,
    ...positions.filter((position) => positionKey(position) != positionKey(saved) && positionKey(position) != replacedKey),
];

export const removePosition = (positions: Position[], key: string) => positions.filter((position) => positionKey(position) != key);

/** A lista com a nova expiração da vaga de mesma chave. */
export const changeExpiration = (positions: Position[], key: string, expiration: { min: any; max: any }) =>
    positions.map((position) => (positionKey(position) == key ? { ...position, expiration: { min: Number(expiration.min), max: Number(expiration.max) } } : position));

/** O rótulo do botão dos currículos encontrados: ainda sem a contagem (o botão vem antes da busca). */
export const foundResumesLabel = (resumes?: number) => (resumes == null ? 'Ver os currículos encontrados' : `Ver os ${resumes} currículos encontrados`);

export const emptyForm = (now: Date = new Date()): PositionForm => {
    // desde 2026-11-24 a vaga nova fica aberta por uma semana (antes, 30 dias)
    const inOneWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);
    return {
        title: '',
        description: '',
        // obrigatória; desde 2026-11-25 já vem com tecnologia da informação (antes, vazia)
        resumeType: '1',
        seniority: [],
        // home office marcado por padrão: a aba Opções já entra contando os currículos do ddd 10
        ddd: ['10'],
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
        expirationMax: today(inOneWeek),
        // a padrão de uma vaga nova (CLT marcado, sem idiomas): o modal a refaz enquanto o usuário não mexer nela
        sort: [
            { type: 'asc', field: ['clt'] },
            { type: 'desc', field: ['experience'] },
            { type: 'asc', field: ['ddd'] },
            { type: 'desc', field: ['skillsTotal'] },
            { type: 'desc', field: ['shouldSkillsTotal'] },
        ],
        sortEdited: false,
        contact: [{ type: 'email', value: '' }],
        mustSendInGroups: true,
        frequencyType: 'daily',
        resumesEmail: '',
    };
};

/**
 * A vaga simplificada (desde 2026-11-24): só as abas Vaga e Salários aparecem, e o resto vem preenchido. Todas as
 * senioridades, todas as regiões mais o home office, nenhum idioma, os próprios candidatos enviam os currículos, a
 * divulgação nos grupos marcada e o e-mail que recebe os currículos é o do usuário logado.
 */
export const simplifiedFormOf = (allDdds: string[], loggedEmail: string, now: Date = new Date()): PositionForm => ({
    ...emptyForm(now),
    seniority: seniorityOptions.map((option) => option.value),
    ddd: allDdds,
    hasLanguages: false,
    spokenLanguage: [],
    frequencyType: 'byTheCandidates',
    mustSendInGroups: true,
    resumesEmail: loggedEmail,
});

/** A ordem da vaga simplificada: as pretensões informadas (CLT antes de PJ), os mais baratos primeiro, a experiência e o DDD. */
export const simplifiedSortOf = (form: PositionForm): SortRule[] => {
    const sort: SortRule[] = [];
    form.hasClt && sort.push({ type: 'asc', field: ['clt'] });
    form.hasPj && sort.push({ type: 'asc', field: ['pj'] });
    sort.push({ type: 'desc', field: ['experience'] });
    sort.push({ type: 'asc', field: ['ddd'] });
    return sort;
};

/**
 * O formulário de "Copiar" (desde 2026-11-24): uma vaga nova que usa a antiga só como molde. Tudo vem da antiga, menos o
 * título, que ganha " 2" no fim (ele é parte da chave: o mesmo título seria a antiga; um título que já exista o backend
 * recusa com 409 e o usuário troca), e o período, que recomeça como o de uma vaga nova (de hoje a uma semana), já que a
 * antiga pode estar expirada.
 */
export const copyFormOf = (position: Position, now: Date = new Date()): PositionForm => {
    const newPeriod = emptyForm(now);
    return { ...formOf(position), title: `${position.title} 2`, expirationMin: newPeriod.expirationMin, expirationMax: newPeriod.expirationMax };
};

/** O formulário de "Editar", preenchido com a vaga. */
export const formOf = (position: Position): PositionForm => ({
    title: position.title,
    description: position.description,
    resumeType: String(position.resumeType),
    seniority: senioritiesOf(position.seniority),
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
    sort: sortOfThePosition(position.sort),
    // a vaga gravada guarda a ordem escolhida; sem ordem gravada, segue a padrão
    sortEdited: sortOfThePosition(position.sort).length > 0,
    contact: position.contact && position.contact.length ? position.contact : [{ type: 'email', value: '' }],
    mustSendInGroups: position.mustSendInGroups !== false,
    frequencyType: position.frequencyType || 'daily',
    resumesEmail: position.resumesEmail || '',
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
        mustSendInGroups: form.mustSendInGroups,
        frequencyType: form.frequencyType,
    };
    if (sendsTheResumes(form)) body.resumesEmail = form.resumesEmail.trim();
    // os contatos só aparecem na divulgação nos grupos (desde 2026-11-25): fora dela não são pedidos nem enviados
    if (form.mustSendInGroups) body.contact = form.contact.map((contact) => ({ type: contact.type, value: contact.value.trim() }));
    if (form.hasClt) body.clt = { min: Number(form.cltMin), max: Number(form.cltMax) };
    if (form.hasPj) body.pj = { min: Number(form.pjMin), max: Number(form.pjMax) };
    return body;
};

/** A vaga como fica na lista depois de gravada (o que foi enviado, com as datas em número). */
export const positionOf = (body: any): Position => ({ ...body, expiration: { min: Number(body.expiration.min), max: Number(body.expiration.max) } });

export const salaryErrors = (name: string, min: number | '', max: number | '') => {
    const { salaryMin, salaryMax } = LIMITS;
    const outOfRange = (value: number | '') => value === '' || value < salaryMin || value > salaryMax;
    if (outOfRange(min) || outOfRange(max)) return [`A faixa ${name} deve ir de R$ ${salaryMin.toLocaleString('pt-BR')} a R$ ${salaryMax.toLocaleString('pt-BR')}`];
    if (Number(max) < Number(min)) return [`O máximo da faixa ${name} não pode ser menor que o mínimo`];
    return [];
};

// o campo apagado ('') e o 0 digitado ('0') ficam fora da faixa, como no currículo (IntegerFieldComponent); só o checkbox põe o 0
const isOutOfIntegerRange = (value: number | string, max: number) => value === '' || value === '0' || !Number.isInteger(Number(value)) || Number(value) < 0 || Number(value) > max;

/**
 * Os erros da aba "Requisitos" (antes, "Vaga") por campo, mostrados embaixo de cada um, como na aba Currículo
 * (LabelComponent): descrição e área (desde 2026-11-25 o título, os contatos e o período estão na aba Opções).
 */
/** A explicação do título já usado (o title-in-use respondeu 200): o modal não deixa gravar com ele. */
export const TITLE_IN_USE = 'Este título já é de outra vaga sua criada no mesmo mês: escolha outro título';

export const positionTabFieldErrors = (form: PositionForm) => {
    const fieldErrors: Record<string, string> = {};
    const fail = (field: string, message: string) => (fieldErrors[field] = fieldErrors[field] || message);
    const description = form.description.trim();
    (description.length < LIMITS.descriptionMin || description.length > LIMITS.descriptionMax) &&
        fail('description', `A descrição deve ter de ${LIMITS.descriptionMin} a ${LIMITS.descriptionMax.toLocaleString('pt-BR')} caracteres (tem ${description.length})`);
    !form.resumeType && fail('resumeType', 'Escolha a área da vaga');
    return fieldErrors;
};

/** Aba "Requisitos": descrição e área (os idiomas, também nela, em languagesTabErrors). */
export const positionTabErrors = (form: PositionForm) => Object.values(positionTabFieldErrors(form));

/** Os idiomas (na aba "Requisitos" desde 2026-11-25): marcado o "exige outro idioma", ao menos um idioma, cada um com o seu nível. */
export const languagesTabErrors = (form: PositionForm) => {
    if (!form.hasLanguages) return [];
    if (!form.spokenLanguage.length) return ['Escolha ao menos um idioma'];
    if (form.spokenLanguage.some((language) => !language.name || ![1, 2].includes(language.level))) return ['Escolha o nível de cada idioma'];
    return [];
};

/** Aba "Filtros" (a segunda): regiões, senioridade, dias para começar e temporário. */
export const filtersTabErrors = (form: PositionForm) => {
    const errors: string[] = [];
    (form.ddd.length < 1 || form.ddd.length > LIMITS.dddMax) && errors.push('Escolha ao menos uma região');
    !form.seniority.length && errors.push('Escolha ao menos uma senioridade');
    isOutOfIntegerRange(form.disponibility, LIMITS.disponibilityMax) && errors.push(`Os dias para começar devem ir de 1 a ${LIMITS.disponibilityMax}`);
    isOutOfIntegerRange(form.temporallyJobTime, LIMITS.temporallyJobTimeMax) && errors.push(`A duração do temporário deve ir de 1 a ${LIMITS.temporallyJobTimeMax} meses`);
    return errors;
};

/** Aba "Opções" (depois de Salários): visibilidade, envio da vaga e dos currículos e a ordem dos currículos encontrados. */
/** Toda frequência, menos 'none', envia os currículos encontrados ao resumesEmail. */
export const sendsTheResumes = (form: PositionForm) => form.frequencyType != 'none';

/** O erro do e-mail que recebe os currículos (vazio quando não há): obrigatório e válido, salvo na frequência 'none'. */
export const resumesEmailError = (form: PositionForm) => {
    if (!sendsTheResumes(form)) return '';
    const email = form.resumesEmail.trim();
    if (!email) return 'Informe o e-mail para o qual enviar os currículos';
    if (email.length > 100 || !contactPatterns.email.test(email)) return 'Informe um e-mail válido para receber os currículos';
    return '';
};

/** A vaga fora dos grupos e sem receber currículos não iria a lugar nenhum (desde 2026-11-25): o modal não a deixa gravar. */
export const USELESS_POSITION = 'Sem a divulgação nos grupos, escolha uma forma de receber os currículos: com "Não receber currículos" a vaga não iria a lugar nenhum';

export const isUselessPosition = (form: PositionForm) => !form.mustSendInGroups && form.frequencyType == 'none';

/**
 * Os erros por campo da aba "Opções" (desde 2026-11-25): o título, os contatos, pedidos só com a divulgação nos grupos
 * (onde aparecem), e o período da vaga.
 */
export const optionsTabFieldErrors = (form: PositionForm, creating: boolean, now: Date = new Date(), titleInUse: boolean = false) => {
    const fieldErrors: Record<string, string> = {};
    const fail = (field: string, message: string) => (fieldErrors[field] = fieldErrors[field] || message);
    const title = form.title.trim();
    (title.length < LIMITS.titleMin || title.length > LIMITS.titleMax) && fail('title', `O título deve ter de ${LIMITS.titleMin} a ${LIMITS.titleMax} caracteres`);
    titleInUse && fail('title', TITLE_IN_USE);
    form.mustSendInGroups && form.contact.length < 1 && fail('contact', 'Informe ao menos um contato');
    form.mustSendInGroups &&
        form.contact.some((contact) => !isValidContact(contact) || contact.value.trim().length > LIMITS.contactValueMax) &&
        fail('contact', 'Confira os contatos: WhatsApp com DDD, e-mail válido ou link começando com http');
    if (!form.expirationMin || !form.expirationMax) {
        fail('expiration', 'Informe o início e o fim da vaga');
        return fieldErrors;
    }
    creating && form.expirationMin < today(now) && fail('expiration', 'O início da vaga não pode ser antes de hoje');
    form.expirationMax < form.expirationMin && fail('expiration', 'O fim da vaga não pode ser antes do início');
    return fieldErrors;
};

export const optionsTabErrors = (form: PositionForm, creating: boolean = false, now: Date = new Date(), titleInUse: boolean = false) => {
    const errors: string[] = [];
    const emailError = resumesEmailError(form);
    emailError && errors.push(emailError);
    isUselessPosition(form) && errors.push(USELESS_POSITION);
    errors.push(...Object.values(optionsTabFieldErrors(form, creating, now, titleInUse)));
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
export const pendingRequirements = (form: PositionForm, creating: boolean, now: Date = new Date(), titleInUse: boolean = false) => [
    ...positionTabErrors(form),
    ...languagesTabErrors(form),
    ...filtersTabErrors(form),
    ...salaryTabErrors(form),
    ...optionsTabErrors(form, creating, now, titleInUse),
];

// ---- aba Habilidades (como a do currículo: as habilidades encontradas no texto, aqui a descrição da vaga, por skills/fromText)

/** Como no currículo, só a vaga de tecnologia (área 1) tem a aba Habilidades. */
export const isTechPosition = (form: PositionForm) => form.resumeType == '1';

// os nomes e as categorias de VisPositionSkillTypes e VisPositionSkillCategories no backend
export const REQUIRED_SKILLS = 'skillsFromResume';
export const DESIRED_SKILLS = 'shouldSkills';

// desde 2026-11-22 as encontradas na descrição vão para as desejáveis (a lista principal, de onde saem as implícitas), e
// o recrutador arrasta para as obrigatórias as que os currículos precisam ter
// o máximo de habilidades obrigatórias (desde 2026-11-23): o positions/resumes-of-the-filters recusa (422) mais de 100
export const REQUIRED_SKILLS_MAX = 100;
export const requiredSkillsGroup = (list: any[]) => ({
    title: 'Habilidades OBRIGATÓRIAS da vaga',
    maxItems: REQUIRED_SKILLS_MAX,
    help: 'Os currículos encontrados precisam ter todas estas habilidades. Arraste para cá, da lista de desejáveis, as que forem obrigatórias.',
    name: REQUIRED_SKILLS,
    category: 'skillsFromText',
    list,
});

export const desiredSkillsGroup = (list: any[]) => ({
    title: 'Habilidades DESEJÁVEIS da vaga',
    help:
        'As habilidades encontradas na descrição da vaga. Elas contam a favor do currículo, mas não são exigidas; arraste para a lista de obrigatórias as que os currículos precisam ter. ' +
        'Se faltar alguma habilidade que consta na descrição, use o link "Deixamos de listar alguma habilidade?" para sugeri-la.',
    name: DESIRED_SKILLS,
    category: 'shouldSkills',
    main: true,
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

/**
 * As duas listas da aba a partir da resposta de skills/fromText: as encontradas são as desejáveis; as obrigatórias (que a
 * tela mandou como excluídas, para não reaparecerem entre as desejáveis) voltam como excluídas.
 */
export const skillGroupsFromText = (response: any) => [desiredSkillsGroup(response.skill || []), requiredSkillsGroup(response.excludedSkill || [])];

/**
 * As listas da vaga simplificada (desde 2026-11-24): todas as habilidades encontradas na descrição são obrigatórias, e
 * nenhuma desejável. Sem a aba Habilidades para retirar o excesso, ficam as primeiras até o máximo que o backend aceita.
 */
export const simplifiedSkillGroupsFromText = (response: any) => [
    desiredSkillsGroup([]),
    requiredSkillsGroup([...(response.excludedSkill || []), ...(response.skill || [])].slice(0, REQUIRED_SKILLS_MAX)),
];

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
        groups: [desiredSkillsGroup(ofType(DESIRED_SKILLS)), requiredSkillsGroup(ofType(REQUIRED_SKILLS))],
        context: { discardedSkills, cacheHash },
    };
};
