import { HOME_OFFICE } from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/tabs/TabFilter/RegioesComponent';
import { isTechPosition, LIMITS, PositionForm } from './positionsData';

/**
 * Os currículos que atendem aos filtros da vaga (desde 2026-11-22): o público POST positions/resumes-of-the-filters
 * filtra, dentro do Elasticsearch, os currículos ativos da área nas regiões da vaga e devolve só os ids, quantos são e as
 * médias de pretensão CLT e PJ deles. Um filtro que não filtra fica fora do corpo: vaga home office (todos os ddds),
 * contratação imediata (0 dias), vaga não temporária (0 meses), caixa desmarcada, faixa salarial desligada ou incompleta.
 */

export type ResumesOfTheFilters = { ids: string[]; resumes: number; cltAverage?: number; pjAverage?: number };

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

/** O corpo do POST positions/resumes-of-the-filters, ou null quando ainda não dá para contar (sem área ou sem região). */
export const filtersRequestOf = (form: PositionForm, requiredSkills: string[], loggedEmail?: string | null) => {
    if (!form.resumeType) return null;
    const homeOffice = form.ddd.includes(HOME_OFFICE);
    if (!homeOffice && !form.ddd.length) return null;
    const body: Record<string, any> = { resumeType: Number(form.resumeType) };
    !homeOffice && (body.ddd = form.ddd.map(Number));
    const disponibility = positive(form.disponibility);
    disponibility && (body.disponibility = disponibility);
    const temporallyJobTime = positive(form.temporallyJobTime);
    temporallyJobTime && (body.temporallyJobTime = temporallyJobTime);
    form.seniority && (body.seniority = form.seniority);
    const skills = isTechPosition(form) ? requiredSkills.filter(Boolean) : [];
    skills.length && (body.skill = skills);
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

/** "Foram encontrados N currículos", com as médias de pretensão dos que as informaram. */
export const foundResumesMessage = (found: ResumesOfTheFilters) => {
    if (found.resumes == 0) return 'Não foram encontrados currículos para os seus critérios de busca';
    const averages = [found.cltAverage != null && `média CLT ${money(found.cltAverage)}`, found.pjAverage != null && `média PJ ${money(found.pjAverage)}`].filter(Boolean);
    const count = `Foram encontrados ${found.resumes} currículos`;
    return averages.length ? `${count} (${averages.join(', ')})` : count;
};
