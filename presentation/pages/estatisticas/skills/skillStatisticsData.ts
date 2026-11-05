/** Um item dos grupos das estatísticas: vem como texto JSON, e um item ilegível é descartado. */
const parseItems = <T>(texts: string[]): T[] =>
    (texts || [])
        .map((text) => {
            try {
                return JSON.parse(text) as T;
            } catch (e) {
                return null;
            }
        })
        .filter((item): item is NonNullable<typeof item> => item != null) as T[];

export type SkillTotal = { skill: string; total: number };

export type MonthTotal = { yearMonth: string; total: number };

/** O que sobra das fatias da pizza vai para "Outras": acima de 8 cores não dá para distinguir as skills. */
const PIE_SLICES = 7;

/** As skills da mais pedida para a menos pedida; no empate, em ordem alfabética. */
export const parseSkills = (texts: string[]): SkillTotal[] => parseItems<SkillTotal>(texts).sort((a, b) => b.total - a.total || a.skill.localeCompare(b.skill));

/** Os meses em ordem cronológica. */
export const parseMonths = (texts: string[]): MonthTotal[] => parseItems<MonthTotal>(texts).sort((a, b) => a.yearMonth.localeCompare(b.yearMonth));

/** Alguns nomes guardam o sufixo 123 para não serem achados nos textos: na tela ele não aparece. */
export const skillLabel = (skill: string) => skill.replace(/123$/, '');

/** 202203 vira 03/2022. */
export const monthLabel = (yearMonth: string) => `${yearMonth.substring(4)}/${yearMonth.substring(0, 4)}`;

/** As fatias da pizza: as skills mais pedidas e "Outras" com a soma das demais. */
export const pieSlices = (skills: SkillTotal[]) => {
    const biggest = skills.slice(0, PIE_SLICES);
    const others = skills.slice(PIE_SLICES).reduce((sum, skill) => sum + skill.total, 0);
    const labels = biggest.map((skill) => skillLabel(skill.skill));
    const values = biggest.map((skill) => skill.total);
    return others > 0 ? { labels: [...labels, 'Outras'], values: [...values, others] } : { labels, values };
};

/** O total da pizza é a soma das fatias: uma vaga com várias skills conta uma vez em cada uma. */
export const pieTotal = (values: number[]) => values.reduce((sum, value) => sum + value, 0);

/** O total da pizza para o usuário: cada skill pedida por uma vaga é uma exigência dela. */
export const requirementsLabel = (requirements: number, vacancies: number) =>
    `${requirements} ${requirements == 1 ? 'exigência' : 'exigências'} ${vacancies == 1 ? 'da vaga' : `das ${vacancies} vagas`}`;

/** 1 de 3 vira 33,3%. */
export const percentLabel = (value: number, total: number) => `${((value * 100) / total).toFixed(1).replace('.', ',')}%`;

/** The first month (yyyyMM) of the last "count" months, the current one included: 6 in November 2026 starts at 202606. */
export const firstOfLastMonths = (count: number, now: Date = new Date()) => {
    const first = new Date(now.getFullYear(), now.getMonth() - (count - 1), 1);
    return `${first.getFullYear()}${String(first.getMonth() + 1).padStart(2, '0')}`;
};

/** The months between "from" and "to" (yyyyMM), both included. */
export const monthsBetween = (months: MonthTotal[], from: string, to: string) => months.filter((month) => month.yearMonth >= from && month.yearMonth <= to);
