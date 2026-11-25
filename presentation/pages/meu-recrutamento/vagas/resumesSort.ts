import { SortRule } from './positionsData';

/**
 * A ordem da lista da aba "Currículos aderentes" (desde 2026-11-24): a lista que já chegou é reordenada no navegador pelos
 * critérios da aba Opções, sem nova requisição. Cada linha traz em sortValues os valores crus do currículo (as pretensões,
 * os anos de experiência, a disponibilidade, os meses de trabalho temporário, o nível de cada idioma, as habilidades
 * escritas e as que estão acima delas na hierarquia). O primeiro critério decide; cada um dos seguintes só desempata. Um
 * currículo sem o valor de um critério (sem a pretensão) vai para o fim nos dois sentidos.
 */

const MISSING = Number.POSITIVE_INFINITY;

const numberOrMissing = (value: any) => (typeof value == 'number' ? value : MISSING);

const languageLevel = (values: any, name: string) => {
    const levels = values.spokenLanguage || {};
    const found = Object.keys(levels).find((language) => language.toLowerCase() == name.toLowerCase());
    return found ? Number(levels[found]) : 0;
};

// as habilidades que contam para as desejáveis: as escritas e as que estão acima delas na hierarquia
const allSkills = (values: any): string[] => [...(values.skill || []), ...(values.parentSkill || [])];

const valueGetters: Record<string, (values: any, criterionValue: string, desiredSkills: string[]) => number> = {
    clt: (values) => numberOrMissing(values.clt),
    pj: (values) => numberOrMissing(values.pj),
    spokenLanguage: (values, language) => languageLevel(values, language),
    experience: (values) => Number(values.experience || 0),
    skillsTotal: (values) => (values.skill || []).length,
    shouldSkillsTotal: (values, _, desiredSkills) => desiredSkills.filter((skill) => allSkills(values).includes(skill)).length,
    disponibility: (values) => Number(values.disponibility || 0),
    temporallyJobTime: (values) => Number(values.temporallyJobTime || 0),
    skill: (values, skill) => (allSkills(values).includes(skill) ? 1 : 0),
    // o menor DDD do currículo sem o home office (desde 2026-11-24); só home office, o backend não manda, e vai para o fim
    ddd: (values) => numberOrMissing(values.ddd),
};

/** O número de uma linha num critério, já no sentido dele (para comparar em ordem crescente). */
export const sortValueOf = (row: any, rule: SortRule, desiredSkills: string[]) => {
    const getter = valueGetters[rule.field[0]];
    if (!getter) return 0;
    const value = getter(row.sortValues || {}, rule.value || '', desiredSkills);
    if (value == MISSING) return MISSING;
    return rule.type == 'desc' ? -value : value;
};

/** As linhas na ordem escolhida para a vaga (uma cópia; a lista recebida não muda). */
export const sortResumes = <T,>(rows: T[], sort: SortRule[], desiredSkills: string[]): T[] => {
    const keyed = rows.map((row, index) => ({ row, index, keys: sort.map((rule) => sortValueOf(row, rule, desiredSkills)) }));
    keyed.sort((first, second) => {
        for (let i = 0; i < first.keys.length; i++) {
            if (first.keys[i] == second.keys[i]) continue;
            return first.keys[i] < second.keys[i] ? -1 : 1;
        }
        // empate em tudo: a ordem em que a lista chegou
        return first.index - second.index;
    });
    return keyed.map((item) => item.row);
};
