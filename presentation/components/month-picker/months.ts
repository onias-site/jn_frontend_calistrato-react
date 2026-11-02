/** A data no formato do campo de mês do navegador (yyyy-MM). */
const toMonth = (date: Date) => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${date.getFullYear()}-${month}`;
};

/** O mês corrente. */
export const currentMonth = () => toMonth(new Date());

/** O mês anterior ao corrente: em janeiro, dezembro do ano anterior. */
export const previousMonth = () => {
    const now = new Date();
    return toMonth(new Date(now.getFullYear(), now.getMonth() - 1, 1));
};

/** Mês à frente do corrente: o atributo max do campo só barra o calendário, digitando dá para chegar nele. */
export const isFutureMonth = (month: string) => month > currentMonth();

/** O mês como a API o recebe (yyyyMM). */
export const monthParameter = (month: string) => month.replace('-', '');
