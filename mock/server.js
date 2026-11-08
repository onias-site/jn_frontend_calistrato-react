/**
 * Backend mocado para desenvolver o layout sem as APIs reais: responde nas portas 8081 (currículos, vis) e 8082 (login
 * e chamados, js) com dados inventados, nos mesmos formatos que as telas esperam.
 *
 *   npm run mock          (sobe os dois servidores)
 *
 * Login: qualquer e-mail entra com qualquer senha, menos "Errada@1", que devolve senha incorreta (427).
 * Tudo fica em memória: reiniciar o processo volta ao estado inicial.
 */
const express = require('express');
const cors = require('cors');

const log = (...args) => console.log(new Date().toLocaleTimeString('pt-BR'), ...args);

const corsOptions = {
    origin: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'sessionToken', 'email'],
};

const now = () => new Date();
const pad = (n) => String(n).padStart(2, '0');
const brDateTime = (date) => `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
const daysAgo = (days, hour = 10) => {
    const date = now();
    date.setDate(date.getDate() - days);
    date.setHours(hour, 15, 0, 0);
    return date;
};

// ---------------------------------------------------------------------------------------------------------------
// Sessão: as telas mandam os cabeçalhos sessionToken e email; sem eles (ou com token desconhecido) a resposta é 401
// ---------------------------------------------------------------------------------------------------------------
const sessions = new Map(); // sessionToken -> email

const requireSession = (req, res, next) => {
    const token = req.header('sessionToken');
    const email = req.header('email');
    if (!token || !email || sessions.get(token) !== email) {
        return res.status(401).json({ errorName: 'notLogged', errorDescription: 'Sessão inválida' });
    }
    req.email = email;
    next();
};

// ---------------------------------------------------------------------------------------------------------------
// Dados
// ---------------------------------------------------------------------------------------------------------------
const SKILL_PARENTS = {
    'SPRING BOOT': ['JAVA', 'SPRING'],
    SPRING: ['JAVA'],
    HIBERNATE: ['JAVA', 'SQL'],
    JPA: ['JAVA', 'SQL'],
    REACT: ['JAVASCRIPT'],
    'REACT NATIVE': ['JAVASCRIPT', 'REACT'],
    NEXTJS: ['REACT', 'JAVASCRIPT'],
    ANGULAR: ['TYPESCRIPT', 'JAVASCRIPT'],
    TYPESCRIPT: ['JAVASCRIPT'],
    NODEJS: ['JAVASCRIPT'],
    MYSQL: ['SQL'],
    POSTGRESQL: ['SQL'],
    ORACLE: ['SQL'],
    MONGODB: ['NOSQL'],
    ELASTICSEARCH: ['NOSQL'],
    KUBERNETES: ['DOCKER', 'LINUX'],
    DOCKER: ['LINUX'],
    AWS: ['CLOUD'],
    GCP: ['CLOUD'],
    AZURE: ['CLOUD'],
    TERRAFORM: ['CLOUD'],
    DJANGO: ['PYTHON'],
    FLASK: ['PYTHON'],
    PANDAS: ['PYTHON'],
    KAFKA: ['MENSAGERIA'],
    RABBITMQ: ['MENSAGERIA'],
    JAVA: [],
    JAVASCRIPT: [],
    PYTHON: [],
    SQL: [],
    NOSQL: [],
    LINUX: [],
    CLOUD: [],
    GIT: [],
    SCRUM: [],
    KANBAN: [],
    JENKINS: ['CI/CD'],
    'CI/CD': [],
    SAP: [],
    DEVOPS: [],
    MENSAGERIA: [],
    REDIS: ['NOSQL'],
    GRAPHQL: [],
    REST: [],
    MICROSERVICES: [],
    JUNIT: ['JAVA'],
    JEST: ['JAVASCRIPT'],
    CYPRESS: ['JAVASCRIPT'],
    SELENIUM: [],
};
const SYNONYMS = { 'SPRING BOOT': ['SPRINGBOOT'], NODEJS: ['NODE', 'NODE.JS'], NEXTJS: ['NEXT.JS', 'NEXT'], POSTGRESQL: ['POSTGRES'], KUBERNETES: ['K8S'], 'CI/CD': ['CI CD', 'INTEGRAÇÃO CONTÍNUA'] };
const ALL_SKILLS = Object.keys(SKILL_PARENTS);

const statisticsSkills = ['SAP', 'DEVOPS', 'PYTHON', 'JAVASCRIPT', 'AWS', 'CLOUD', 'SQL', 'JAVA', 'REACT', 'SPRING BOOT', 'DOCKER', 'KUBERNETES', 'TYPESCRIPT', 'NODEJS', 'ANGULAR', 'POSTGRESQL', 'MYSQL', 'GIT', 'SCRUM', 'LINUX', 'KAFKA', 'MONGODB', 'AZURE', 'GCP', 'TERRAFORM', 'JENKINS', 'REST', 'MICROSERVICES', 'GRAPHQL', 'REDIS', 'ORACLE', 'ELASTICSEARCH', 'DJANGO', 'FLASK', 'PANDAS', 'RABBITMQ', 'HIBERNATE', 'JPA', 'JUNIT', 'JEST', 'CYPRESS', 'SELENIUM', 'KANBAN', 'NEXTJS', 'REACT NATIVE', 'C#', '.NET', 'PHP', 'LARAVEL', 'RUBY', 'GO', 'RUST', 'KOTLIN', 'SWIFT', 'FLUTTER', 'POWER BI', 'TABLEAU', 'EXCEL', 'ETL', 'SPARK', 'HADOOP', 'AIRFLOW', 'DBT', 'SNOWFLAKE', 'BIGQUERY', 'MACHINE LEARNING', 'TENSORFLOW', 'PYTORCH', 'LLM', 'OPENAI', 'LANGCHAIN', 'JIRA', 'CONFLUENCE', 'FIGMA', 'UX', 'UI', 'TAILWIND', 'SASS', 'HTML', 'CSS', 'VUE', 'NUXT', 'SVELTE', 'ELECTRON', 'ANDROID', 'IOS', 'XAMARIN', 'UNITY', 'C++', 'C', 'EMBARCADOS', 'IOT', 'PLC', 'SCADA', 'SAP ABAP', 'SAP FI', 'SAP MM', 'SAP SD', 'ORACLE EBS', 'TOTVS', 'PROTHEUS', 'DATASUL', 'SENIOR', 'SALESFORCE', 'DYNAMICS', 'SERVICENOW', 'ITIL', 'COBIT', 'PMP', 'OKR', 'LEAN', 'SIX SIGMA', 'BPMN', 'UML', 'DDD', 'TDD', 'BDD', 'CLEAN CODE', 'SOLID', 'DESIGN PATTERNS', 'ARQUITETURA', 'SEGURANÇA', 'OWASP', 'PENTEST', 'SIEM', 'FIREWALL', 'REDES', 'CISCO', 'VMWARE', 'WINDOWS SERVER', 'ACTIVE DIRECTORY', 'POWERSHELL', 'BASH', 'ANSIBLE', 'PUPPET', 'CHEF', 'GRAFANA', 'PROMETHEUS', 'DATADOG', 'NEW RELIC', 'SPLUNK', 'ELK', 'NGINX', 'APACHE', 'TOMCAT', 'JBOSS', 'WEBLOGIC', 'IIS', 'SQL SERVER', 'DB2', 'SYBASE', 'FIREBIRD', 'SQLITE', 'CASSANDRA', 'DYNAMODB', 'NEO4J', 'COUCHBASE', 'SOAP', 'WSDL', 'XML', 'JSON', 'YAML', 'PROTOBUF', 'GRPC', 'WEBSOCKET', 'OAUTH', 'JWT', 'SAML', 'LDAP', 'KEYCLOAK', 'AUTH0', 'STRIPE', 'PAGSEGURO', 'PIX', 'OPEN BANKING', 'BLOCKCHAIN', 'SOLIDITY', 'WEB3', 'ETHEREUM', 'BITCOIN', 'INGLÊS'];

// um número determinístico por texto, para as estatísticas não mudarem a cada recarga
const hash = (text) => [...text].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

const statistics = (yearMonth, seniority, ddd) => {
    const seed = hash(`${yearMonth}/${seniority}/${ddd}`);
    const total = 120 + (seed % 300);
    const skills = statisticsSkills.map((skill, index) => {
        const weight = Math.max(1, Math.round((total * 0.35) / (index + 1) + ((seed >> (index % 13)) % 7)));
        return JSON.stringify({ skill, total: weight });
    });
    return { total, skills };
};

const monthsOf = (skill, seniority, ddd) => {
    const months = [];
    const base = now();
    for (let i = 35; i >= 0; i--) {
        const date = new Date(base.getFullYear(), base.getMonth() - i, 1);
        const yearMonth = `${date.getFullYear()}${pad(date.getMonth() + 1)}`;
        const seed = hash(`${skill}/${seniority}/${ddd}/${yearMonth}`);
        months.push(JSON.stringify({ yearMonth, total: 5 + (seed % 60) }));
    }
    return { months };
};

const telegramGroups = ['https://t.me/vagasdeti', 'https://t.me/vagas_dev_brasil', 'https://t.me/javavagas', 'https://t.me/pythonbrasilvagas', 'https://t.me/devopsjobsbr', 'https://t.me/frontendvagas', 'https://t.me/dadosvagas', 'https://t.me/homeofficevagas'];

const companies = ['ACCENTURE', 'STEFANINI', 'CI&T', 'THOUGHTWORKS', 'GLOBANT', 'IBM', 'TOTVS', 'NUBANK', 'ITAÚ', 'BRADESCO', 'SANTANDER', 'MAGAZINE LUIZA', 'MERCADO LIVRE', 'IFOOD', 'PICPAY', 'STONE', 'XP INC', 'BTG PACTUAL', 'AMBEV TECH', 'PETROBRAS', 'VIVO', 'CLARO', 'TIM', 'OI', 'EMBRAER', 'NATURA', 'B3', 'CIELO', 'GETNET', 'LOCALIZA', 'GUPY', 'CATHO', 'INFOJOBS', 'ROBERT HALF', 'MICHAEL PAGE', 'RANDSTAD', 'MANPOWER', 'KELLY SERVICES', 'HAYS', 'PAGE PERSONNEL'];

// o currículo de cada e-mail: começa com um currículo de tecnologia pronto para quem fizer login
const resumes = new Map(); // email -> { status: 'active' | 'inactive', resume }

const sampleResumeFor = (email) => ({
    email,
    desiredJob: 'Desenvolvedor Java Pleno',
    lastJob: 'Desenvolvedor Java Júnior',
    linkedinAddress: 'https://www.linkedin.com/in/candidato-exemplo',
    notAllowedCompany: ['STEFANINI', 'ACCENTURE'],
    resumeType: 1,
    ddd: [11, 19, 21],
    disponibility: 15,
    experience: now().getFullYear() - 4,
    temporallyJobTime: 6,
    travel: true,
    pcd: false,
    negotiableClaim: true,
    clt: 8500,
    pj: 12000,
    spokenLanguage: [
        { name: 'Inglês', level: 2 },
        { name: 'Espanhol', level: 1 },
    ],
    skill: [
        ...['JAVA', 'SPRING BOOT', 'HIBERNATE', 'POSTGRESQL', 'DOCKER', 'GIT', 'SCRUM', 'REACT'].map((skill) => ({
            skill,
            word: skill,
            type: 'skillsFromResume',
            category: 'skillsFromText',
            parent: SKILL_PARENTS[skill] || [],
            synonym: SYNONYMS[skill] || [],
        })),
        { skill: 'PHP', word: 'PHP', type: 'excludedSkills', category: 'excludedSkills', parent: [] },
        { skill: 'ASP', word: 'ASP', type: 'isPieceOfOtherWord', category: 'discardedSkills', parent: [], associated: 'ASPECTJ' },
    ],
});

const findSkillsInText = (text, excluded = []) => {
    const upper = (text || '').toUpperCase();
    const excludedUpper = excluded.map((item) => String(item).toUpperCase());
    const found = ALL_SKILLS.filter((skill) => new RegExp(`(?<![\\p{L}\\p{N}])${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\p{L}\\p{N}])`, 'u').test(upper));
    const toItem = (skill, type, category) => ({ skill, word: skill, type, category, parent: SKILL_PARENTS[skill] || [], synonym: SYNONYMS[skill] || [] });
    const skill = found.filter((item) => !excludedUpper.includes(item)).map((item) => toItem(item, 'skillsFromResume', 'skillsFromText'));
    const excludedSkill = excludedUpper.map((item) => toItem(item, 'excludedSkills', 'excludedSkills'));
    const discardedSkills = {};
    if (/ASPECTJ/.test(upper)) {
        discardedSkills.isPieceOfOtherWord = [{ skill: 'ASP', word: 'ASP', type: 'isPieceOfOtherWord', category: 'discardedSkills', associated: 'ASPECTJ', parent: [] }];
    }
    return { skill, excludedSkill, discardedSkills };
};

const sampleViewedResumes = () =>
    [
        { linkedin: 'https://www.linkedin.com/in/maria-silva-dev', alias: 'Maria, Java sênior SP', date: brDateTime(daysAgo(2, 9)) },
        { linkedin: 'https://www.linkedin.com/in/joao-souza-react', alias: 'João, React pleno remoto', date: brDateTime(daysAgo(5, 14)) },
        { linkedin: 'https://www.linkedin.com/in/ana-pereira-data', alias: 'Ana, dados júnior BH', date: brDateTime(daysAgo(9, 11)) },
        { linkedin: 'https://www.linkedin.com/in/carlos-lima-devops', alias: 'Carlos, DevOps RJ', date: brDateTime(daysAgo(12, 16)) },
        { linkedin: 'https://www.linkedin.com/in/fernanda-costa-qa', alias: 'Fernanda, QA Curitiba', date: brDateTime(daysAgo(20, 10)) },
    ].map((item) => JSON.stringify(item));

const sampleResumeRow = (id, job, skills, regions, salary) => ({
    resumeId: id,
    token: `token-${id}`,
    whatMatters: [`Pretensão CLT: R$ ${salary}`, 'Disponibilidade: 15 dias', 'Experiência: 4 anos'],
    regions,
    languagesAndSkills: ['Inglês (fluente)', ...skills],
    job: [job, 'Última: ' + job.replace('Pleno', 'Júnior').replace('Sênior', 'Pleno')],
    otherInformation: ['Aceita viagens', 'Pretensão negociável', 'Não aceita temporário'],
});

const sampleResumeRows = () => [
    sampleResumeRow('r1', 'Desenvolvedor Java Pleno', ['JAVA', 'SPRING BOOT', 'POSTGRESQL', 'DOCKER'], ['São Paulo – SP', 'Campinas – SP', 'Rio de Janeiro – RJ', 'Curitiba – PR', 'Belo Horizonte – MG'], '8.500'),
    sampleResumeRow('r2', 'Desenvolvedora React Sênior', ['REACT', 'TYPESCRIPT', 'NEXTJS', 'JEST'], ['Home office'], '14.000'),
    sampleResumeRow('r3', 'Engenheiro de Dados Júnior', ['PYTHON', 'PANDAS', 'SQL', 'AIRFLOW'], ['Belo Horizonte – MG'], '5.200'),
    sampleResumeRow('r4', 'Analista DevOps Pleno', ['DOCKER', 'KUBERNETES', 'AWS', 'TERRAFORM'], ['Rio de Janeiro – RJ', 'Niterói – RJ'], '9.800'),
    sampleResumeRow('r5', 'QA Pleno', ['CYPRESS', 'SELENIUM', 'JAVASCRIPT'], ['Curitiba – PR', 'Joinville – SC'], '7.000'),
];

const viewers = { viewers: [{ domain: 'stefanini.com', views: 4 }, { domain: 'ciandt.com', views: 3 }, { domain: 'accenture.com', views: 2 }, { domain: 'gmail.com', views: 2 }, { domain: 'nubank.com.br', views: 1 }] };

// grupos do jn_grouper: lado ativo (em análise / logins) e inativo (encerrados / logouts)
const groups = {
    js_contact_us: {
        jn_grouper: {
            child: [
                JSON.stringify({ type: 'reportBug', title: 'Erro ao salvar currículo', description: 'Ao clicar em salvar na aba Salários a tela fica carregando e não termina.\nTentei duas vezes.', date: brDateTime(daysAgo(1, 9)) }),
                JSON.stringify({ type: 'makeSuggestion', title: 'Filtro por cidade', description: 'Seria ótimo filtrar as vagas por cidade além da região metropolitana.', date: brDateTime(daysAgo(3, 15)) }),
            ],
        },
        jn_inactive_grouper: {
            child: [
                JSON.stringify({
                    type: 'clarifyDoubts',
                    title: 'Como excluir meu currículo?',
                    description: 'Não achei a opção de excluir.',
                    supportResponse: 'Na tela Sobre mim, com o currículo carregado, aparece a faixa com os botões Inativar e Excluir logo acima das abas.',
                    status: 'js_contact_us_solved',
                    date: brDateTime(daysAgo(10, 11)),
                }),
                JSON.stringify({
                    type: 'reportBug',
                    title: 'Gráfico não carrega no celular',
                    description: 'O gráfico de pizza da home não aparece no meu Android. ' + 'Texto comprido para testar o modal de ver tudo. '.repeat(6),
                    supportResponse: 'Corrigido na versão de ontem, obrigado pelo aviso!',
                    status: 'js_contact_us_solved',
                    date: brDateTime(daysAgo(18, 17)),
                }),
            ],
        },
    },
    vis_skill_fix_hierarchy_pending: {
        jn_grouper: { child: [JSON.stringify({ type: 'add', parent: 'JAVA', skill: ['QUARKUS', 'MICRONAUT'], description: 'Quarkus e Micronaut são frameworks Java, dependem de conhecer Java.', date: brDateTime(daysAgo(2, 10)) })] },
        jn_inactive_grouper: {
            child: [
                JSON.stringify({ type: 'remove', parent: 'SQL', skill: ['MONGODB'], description: 'MongoDB é NoSQL, não depende de SQL.', explanation: 'Concordamos: MongoDB passou a depender de NOSQL.', status: 'vis_skill_fix_hierarchy_fulfiled', date: brDateTime(daysAgo(15, 10)) }),
            ],
        },
    },
    vis_skill_pending: {
        jn_grouper: { child: [JSON.stringify({ skill: 'QUARKUS', synonym: ['QUARKUS.IO'], description: 'Framework Java usado no meu último projeto, consta no currículo.', date: brDateTime(daysAgo(2, 10)) })] },
        jn_inactive_grouper: {
            child: [
                JSON.stringify({ skill: 'PICK BY LIGHT', synonym: ['PTL', 'PICK TO LIGHT'], description: 'Sistema de separação em logística.', explanation: 'Aprovada: habilidade reconhecida com os sinônimos.', status: 'vis_skill_approved', date: brDateTime(daysAgo(25, 10)) }),
                JSON.stringify({ skill: 'PROATIVIDADE', synonym: [], description: 'Sou muito proativo.', explanation: 'Rejeitada: só aceitamos habilidades técnicas.', status: 'vis_skill_rejected', date: brDateTime(daysAgo(30, 10)) }),
            ],
        },
    },
    js_login_session_validation: {
        jn_grouper: {
            child: [
                JSON.stringify({ userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/130', ip: '189.40.12.7', loginDate: brDateTime(daysAgo(0, 9)) }),
                JSON.stringify({ userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/130', ip: '189.40.12.7', loginDate: brDateTime(daysAgo(1, 8)) }),
                JSON.stringify({ userAgent: 'Mozilla/5.0 (Linux; Android 14) Chrome/130 Mobile', ip: '177.22.90.140', loginDate: brDateTime(daysAgo(2, 21)) }),
                JSON.stringify({ userAgent: 'Mozilla/5.0 (Windows NT 10.0) Firefox/131', ip: '200.150.3.9', loginDate: brDateTime(daysAgo(6, 14)) }),
            ],
        },
        jn_inactive_grouper: {
            child: [
                JSON.stringify({ userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/130', ip: '189.40.12.7', logoutDate: brDateTime(daysAgo(1, 18)) }),
                JSON.stringify({ userAgent: 'Mozilla/5.0 (Windows NT 10.0) Firefox/131', ip: '200.150.3.9', logoutDate: brDateTime(daysAgo(6, 15)) }),
            ],
        },
    },
};

// sugestões de habilidade e de hierarquia por e-mail
const skillSuggestions = new Map(); // email -> Map(skill -> suggestion)
const hierarchySuggestions = new Map(); // email -> Map(`${parent}/${type}` -> suggestion)
const mapOf = (store, email) => {
    if (!store.has(email)) store.set(email, new Map());
    return store.get(email);
};

const privacyPolicy = `POLÍTICA DE PRIVACIDADE (texto de exemplo do backend mocado)

1. Dados que guardamos: o e-mail de login, o endereço do seu linkedin e as habilidades encontradas no texto do seu currículo. O texto do currículo em si não é gravado.

2. Uso dos dados: os recrutadores cadastrados recebem, por e-mail, os currículos compatíveis com as vagas deles. Empresas que você bloquear não recebem o seu linkedin.

3. Exclusão: você pode inativar ou excluir o seu currículo a qualquer momento na tela Sobre mim.

4. Contato: use o Fale Conosco para dúvidas sobre esta política.`;

// ---------------------------------------------------------------------------------------------------------------
// API 8081 (vis): currículos, estatísticas, recrutadores
// ---------------------------------------------------------------------------------------------------------------
const vis = express();
vis.use(cors(corsOptions));
vis.use(express.json({ type: () => true }));
vis.use((req, res, next) => {
    log('8081', req.method, req.originalUrl);
    next();
});

vis.get('/statistics/skills/telegramGroups', (req, res) => res.json({ groups: telegramGroups }));
vis.get('/statistics/skills/:yearMonth/:seniority/:ddd', (req, res) => res.json(statistics(req.params.yearMonth, req.params.seniority, req.params.ddd)));
vis.get('/statistics/skills/:seniority/:ddd/months', (req, res) => res.json(monthsOf(req.query.skill || '', req.params.seniority, req.params.ddd)));

vis.get('/companies/search/autocomplete/:query', (req, res) => {
    const query = req.params.query.toUpperCase();
    res.json({ companies: companies.filter((company) => company.includes(query)).slice(0, 8) });
});

vis.post('/recruiter-email-link/view-resume', (req, res) => {
    if (!req.body.token) return res.status(422).json({});
    res.json({ linkedinAddress: 'https://www.linkedin.com/in/maria-silva-dev', alias: 'Maria, Java sênior SP' });
});
vis.post('/recruiter-email-link/alias', (req, res) => res.json({}));
vis.post('/recruiter-email-link/unsubscribe', (req, res) => (req.body.token ? res.json({}) : res.status(422).json({})));

vis.get('/resume/:email', requireSession, (req, res) => {
    const saved = resumes.get(req.email);
    if (!saved) return res.status(404).json({});
    res.json(saved.status === 'active' ? { vis_resume: saved.resume, vis_inactive_resume: {} } : { vis_resume: {}, vis_inactive_resume: saved.resume });
});
vis.post('/resume/:email/language/portuguese', requireSession, (req, res) => {
    resumes.set(req.email, { status: 'active', resume: { ...req.body, email: req.email } });
    res.json({});
});
vis.delete('/resume/:email/language/portuguese/status', requireSession, (req, res) => {
    const saved = resumes.get(req.email);
    if (!saved) return res.status(404).json({});
    saved.status = saved.status === 'active' ? 'inactive' : 'active';
    res.json({});
});
vis.delete('/resume/:email/language/portuguese', requireSession, (req, res) => {
    resumes.delete(req.email);
    res.json({});
});
vis.get('/resume/:email/viewers/:yearMonth', requireSession, (req, res) => res.json(viewers));

vis.post('/skills/fromText', requireSession, (req, res) => res.json(findSkillsInText(req.body.text, req.body.excludedSkill)));

vis.post('/resume/:email/skills/suggestion/search', requireSession, (req, res) => {
    const skill = String(req.body.skill || '').toUpperCase();
    const found = mapOf(skillSuggestions, req.email).get(skill);
    if (found) return res.json(found);
    // sugestão já avaliada por outro candidato
    if (skill === 'QUARKUS') return res.json({ skill, synonym: ['QUARKUS.IO'], description: 'Framework Java.', status: 'approved', explanation: 'Aprovada: Quarkus passou a ser reconhecido.' });
    res.json({});
});
vis.post('/resume/:email/skills/suggestion', requireSession, (req, res) => {
    const store = mapOf(skillSuggestions, req.email);
    const skill = String(req.body.skill || '').toUpperCase();
    if (store.has(skill)) return res.status(409).json({});
    if (ALL_SKILLS.includes(skill)) return res.status(412).json({});
    store.set(skill, { ...req.body, skill, status: 'pending' });
    res.json({});
});
vis.delete('/resume/:email/skills/suggestion', requireSession, (req, res) => {
    const store = mapOf(skillSuggestions, req.email);
    const skill = String(req.body.skill || '').toUpperCase();
    if (!store.has(skill)) return res.status(404).json({});
    store.delete(skill);
    res.json({});
});

vis.post('/resume/:email/skills/hierarchy/search', requireSession, (req, res) => {
    const found = mapOf(hierarchySuggestions, req.email).get(`${req.body.parent}/${req.body.type}`);
    res.json(found || {});
});
vis.post('/resume/:email/skills/hierarchy', requireSession, (req, res) => {
    const store = mapOf(hierarchySuggestions, req.email);
    const key = `${req.body.parent}/${req.body.type}`;
    if (store.has(key)) return res.status(409).json({});
    store.set(key, { ...req.body, status: 'pending' });
    res.json({});
});
vis.delete('/resume/:email/skills/hierarchy', requireSession, (req, res) => {
    const store = mapOf(hierarchySuggestions, req.email);
    const key = `${req.body.parent}/${req.body.type}`;
    if (!store.has(key)) return res.status(404).json({});
    store.delete(key);
    res.json({});
});

vis.get('/recruiter/:email/viewed-resumes/:yearMonth', requireSession, (req, res) => res.json({ viewedResume: sampleViewedResumes() }));
vis.post('/recruiter/:email/viewed-resumes/:yearMonth/details', requireSession, (req, res) => res.json({ resumes: sampleResumeRows().slice(0, 1) }));
vis.get('/recruiter/:email/resumes-of-the-week', requireSession, (req, res) => res.json({ resumes: sampleResumeRows() }));

// ---------------------------------------------------------------------------------------------------------------
// API 8082 (js): login, fale conosco, chamados, acessos, política de privacidade
// ---------------------------------------------------------------------------------------------------------------
const js = express();
js.use(cors(corsOptions));
js.use(express.json({ type: () => true }));
js.use((req, res, next) => {
    log('8082', req.method, req.originalUrl);
    next();
});

const sessionResponse = (email) => {
    const token = `mock-${hash(email).toString(16)}-${Date.now().toString(36)}`;
    sessions.set(token, email);
    const expiration = now();
    expiration.setHours(expiration.getHours() + 8);
    return { email, sessionToken: token, timestamp: Date.now(), dateItWasSaved: brDateTime(now()), expirationDate: brDateTime(expiration) };
};

const WRONG_PASSWORD = 'Errada@1';
const passwordAttempts = new Map();

// a verificação do e-mail: 200 quer dizer que o login existe e tem senha (a tela pede a senha)
js.head('/login/:email/token', (req, res) => res.status(200).end());
js.post('/login/:email/token', (req, res) => res.status(200).json({}));
js.post('/login/:email/token/language/:language', (req, res) => res.json({}));
js.post('/login/:email/token/request/unlocking', (req, res) => res.json({}));
js.post('/login/:email/token/request/resending', (req, res) => res.json({}));
js.post('/login/:email/pre-registration', (req, res) => res.json({}));
js.post('/login/:email/password', (req, res) => {
    if (String(req.body.token || '').length !== 8) return res.status(427).json({ attempts: 1 });
    res.json(sessionResponse(req.params.email));
});
js.post('/login/:email', (req, res) => {
    const email = req.params.email;
    if (req.body.password === WRONG_PASSWORD) {
        const attempts = (passwordAttempts.get(email) || 0) + 1;
        passwordAttempts.set(email, attempts);
        return res.status(attempts >= 3 ? 429 : 427).json({ attempts });
    }
    passwordAttempts.delete(email);
    // quem entra pela primeira vez já ganha um currículo de exemplo
    if (!resumes.has(email)) resumes.set(email, { status: 'active', resume: sampleResumeFor(email) });
    res.json(sessionResponse(email));
});
js.get('/login/:email/:sessionToken', (req, res) => (sessions.has(req.params.sessionToken) ? res.json({}) : res.status(404).json({})));
js.delete('/login/:email/:sessionToken', (req, res) => {
    if (!sessions.has(req.params.sessionToken)) return res.status(404).json({});
    sessions.delete(req.params.sessionToken);
    res.json({});
});

js.post('/contact-us/:email', (req, res) => res.json({}));
js.get('/privacy-policy', (req, res) => res.json({ message: privacyPolicy }));
js.get('/grouper/:email/:parentName/:childName/:parentId/bothSides', requireSession, (req, res) => {
    const group = groups[req.params.childName];
    if (!group) return res.status(404).json({});
    res.json(group);
});

vis.listen(8081, () => log('API vis (currículos) mocada em http://localhost:8081'));
js.listen(8082, () => log('API js (login) mocada em http://localhost:8082'));
