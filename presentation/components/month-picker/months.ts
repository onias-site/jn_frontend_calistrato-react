/** O mês corrente no formato do campo de mês do navegador (yyyy-MM). */
export const currentMonth = () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${now.getFullYear()}-${month}`;
};

/** Mês à frente do corrente: o atributo max do campo só barra o calendário, digitando dá para chegar nele. */
export const isFutureMonth = (month: string) => month > currentMonth();

/** O mês como a API o recebe (yyyyMM). */
export const monthParameter = (month: string) => month.replace('-', '');
