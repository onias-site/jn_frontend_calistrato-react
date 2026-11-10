/** Quantas linhas cada página de um grid mostra, quando a tela não informa outro tamanho. */
export const GRID_PAGE_SIZE = 10;

/**
 * A página corrente de uma lista já carregada no navegador: as linhas da página e o índice da primeira. A página pedida é
 * limitada à última que existe, para que uma lista que encolheu não mostre uma página vazia.
 */
export const paginate = <T>(rows: T[], page: number, pageSize: number = GRID_PAGE_SIZE) => {
    const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
    const currentPage = Math.min(Math.max(1, page), totalPages);
    const first = (currentPage - 1) * pageSize;
    return { totalPages, currentPage, first, pageRows: rows.slice(first, first + pageSize) };
};
