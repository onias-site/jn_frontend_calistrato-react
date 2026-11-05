/** A data no formato do mês das telas (yyyy-MM). */
const toMonth = (date: Date) => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${date.getFullYear()}-${month}`;
};

/** O primeiro mês que as telas mostram quando não informam outro: antes de 2015 a API responde 422. */
export const FIRST_MONTH = '2015-01';

/** O mês corrente. */
export const currentMonth = () => toMonth(new Date());

/** O mês anterior ao corrente: em janeiro, dezembro do ano anterior. */
export const previousMonth = () => {
    const now = new Date();
    return toMonth(new Date(now.getFullYear(), now.getMonth() - 1, 1));
};

/** Mês à frente do corrente: os seletores não oferecem nenhum, mas a tela também pode recebê-lo de outro lugar. */
export const isFutureMonth = (month: string) => month > currentMonth();

/** O mês como a API o recebe (yyyyMM). */
export const monthParameter = (month: string) => month.replace('-', '');

/** O ano (yyyy) e o mês (MM) de um yyyy-MM. */
export const splitMonth = (month: string) => {
    const [year, monthNumber] = month.split('-');
    return { year, monthNumber };
};

/** Os anos do seletor, do mais recente ao mais antigo: do corrente até o do mês mínimo. */
export const selectableYears = (min: string) => {
    const firstYear = Number(splitMonth(min).year);
    const lastYear = Number(splitMonth(currentMonth()).year);
    return Array.from({ length: lastYear - firstYear + 1 }, (_, index) => String(lastYear - index));
};

/** Os meses (MM) do seletor naquele ano: no ano corrente param no mês corrente, no ano do mínimo começam nele. */
export const selectableMonthNumbers = (year: string, min: string) =>
    Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, '0')).filter((monthNumber) => {
        const month = `${year}-${monthNumber}`;
        return month >= min && month <= currentMonth();
    });

/** O mês dentro dos limites: trocar o ano pode levar a um mês futuro ou anterior ao mínimo, que viram o limite mais próximo. */
export const clampMonth = (month: string, min: string) => {
    const max = currentMonth();
    if (month > max) {
        return max;
    }
    if (month < min) {
        return min;
    }
    return month;
};
