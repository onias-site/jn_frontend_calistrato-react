import { HOME_OFFICE } from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/tabs/TabFilter/RegioesComponent';
import { isTechPosition, LIMITS, PositionForm, REQUIRED_SKILLS, REQUIRED_SKILLS_MAX } from './positionsData';

/**
 * Os currículos que atendem aos filtros da vaga (desde 2026-11-22): o público POST resume-filter (desde 2026-11-25; antes,
 * positions/resumes-of-the-filters) grava os filtros em vis_resume_filter, filtra dentro do Elasticsearch os currículos
 * ativos da área nas regiões da vaga e devolve o id dos filtros, os ids dos currículos, quantos são e as médias de
 * pretensão CLT e PJ e de experiência deles. Os mesmos filtros pedidos de novo na mesma hora vêm do cache, sem nova
 * busca. Os filtros vão como os campos da vaga; um filtro que não filtra fica fora do corpo: vaga home office (todos os
 * ddds), contratação imediata (0 dias), vaga não temporária (0 meses), caixa desmarcada, faixa salarial desligada ou
 * incompleta.
 */

// id: o de vis_resume_filter, que a tela curriculos/buscar põe no endereço para ler os filtros de volta
export type ResumesOfTheFilters = { id?: string; ids: string[]; resumes: number; cltAverage?: number; pjAverage?: number; experienceAverage?: number };

const DOMAIN = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}$/;

const positive = (value: number | string) => {
    const number = Number(value);
    return Number.isInteger(number) && number > 0 ? number : null;
};

// a faixa só vai quando ligada e válida (o backend recusa a incompleta ou invertida)
const rangeOf = (enabled: boolean, min: number | '', max: number | '') => {
    if (!enabled || min === '' || max === '') return null;
    const valid = min >= LIMITS.salaryMin && max <= LIMITS.salaryMax && min <= max;
    return valid ? { min, max } : null;
};

/** O domínio do e-mail de quem está logado, ou null: os currículos que proíbem essa empresa não contam. */
export const recruiterDomainOf = (email?: string | null) => {
    const domain = email && email.includes('@') ? email.split('@').pop() || '' : '';
    return DOMAIN.test(domain) ? domain.toLowerCase() : null;
};

// as habilidades sem as repetidas, mesmo com maiúsculas e minúsculas diferentes ("SPRING" e "spring"): fica a primeira
const distinctSkills = (skills: string[]) => skills.filter((skill, index) => skills.findIndex((other) => other.toUpperCase() == skill.toUpperCase()) == index);

// a habilidade obrigatória como a vaga a guarda (VisJsonFieldsPositionSkills): a categoria skillsFromText é a que filtra
const requiredSkillOf = (skill: string) => ({ skill, word: skill, type: REQUIRED_SKILLS, category: 'skillsFromText' });

/**
 * O corpo do POST resume-filter, ou null quando ainda não dá para contar (sem área, sem região ou com mais habilidades
 * obrigatórias do que o backend aceita, que a aba Habilidades avisa e bloqueia). A tela curriculos/buscar (desde
 * 2026-11-25) conta sem região: regionRequired false, e nenhuma região é todas.
 */
export const filtersRequestOf = (form: PositionForm, requiredSkills: string[], loggedEmail?: string | null, regionRequired: boolean = true) => {
    if (!form.resumeType) return null;
    const homeOffice = form.ddd.includes(HOME_OFFICE);
    if (regionRequired && !homeOffice && !form.ddd.length) return null;
    const skills = isTechPosition(form) ? distinctSkills(requiredSkills.filter(Boolean)) : [];
    if (skills.length > REQUIRED_SKILLS_MAX) return null;
    const body: Record<string, any> = { resumeType: Number(form.resumeType) };
    !homeOffice && form.ddd.length > 0 && (body.ddd = form.ddd.map(Number));
    const disponibility = positive(form.disponibility);
    disponibility && (body.disponibility = disponibility);
    const temporallyJobTime = positive(form.temporallyJobTime);
    temporallyJobTime && (body.temporallyJobTime = temporallyJobTime);
    form.seniority.length && (body.seniority = form.seniority);
    skills.length && (body.skill = skills.map(requiredSkillOf));
    const languages = form.hasLanguages ? form.spokenLanguage.map(({ name, level }) => ({ name, level })) : [];
    languages.length && (body.spokenLanguage = languages);
    form.negotiableClaim && (body.negotiableClaim = true);
    form.pcd && (body.pcd = true);
    form.travel && (body.travel = true);
    const clt = rangeOf(form.hasClt, form.cltMin, form.cltMax);
    clt && (body.clt = clt);
    const pj = rangeOf(form.hasPj, form.pjMin, form.pjMax);
    pj && (body.pj = pj);
    const recruiterDomain = recruiterDomainOf(loggedEmail);
    recruiterDomain && (body.recruiterDomain = recruiterDomain);
    return body;
};

const money = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

// os anos com uma casa decimal só quando ela existe: "6 anos", "6,5 anos"
const years = (value: number) => `${value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} ${value == 1 ? 'ano' : 'anos'}`;

/** "Foram encontrados N currículos", com as médias de pretensão e (desde 2026-11-23) de experiência dos que as informaram. */
export const foundResumesMessage = (found: ResumesOfTheFilters) => {
    if (found.resumes == 0) return 'Não foram encontrados currículos para os seus critérios de busca';
    const averages = [
        found.cltAverage != null && `média CLT ${money(found.cltAverage)}`,
        found.pjAverage != null && `média PJ ${money(found.pjAverage)}`,
        found.experienceAverage != null && `média de experiência ${years(found.experienceAverage)}`,
    ].filter(Boolean);
    const count = `Foram encontrados ${found.resumes} currículos`;
    return averages.length ? `${count} (${averages.join(', ')})` : count;
};
