import { paginate } from './paginate';

const rows = Array.from({ length: 23 }, (_, index) => index);

describe('paginate', () => {
    it('devolve as linhas da página pedida e o índice da primeira', () => {
        const result = paginate(rows, 2);
        expect(result).toMatchObject({ totalPages: 3, currentPage: 2, first: 10 });
        expect(result.pageRows).toEqual([10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
    });

    it('a última página traz só o que sobra', () => {
        expect(paginate(rows, 3).pageRows).toEqual([20, 21, 22]);
    });

    it('uma página além da última vira a última', () => {
        expect(paginate(rows, 9)).toMatchObject({ currentPage: 3, first: 20 });
    });

    it('lista vazia tem uma página, sem linhas', () => {
        expect(paginate([], 1)).toMatchObject({ totalPages: 1, currentPage: 1, first: 0, pageRows: [] });
    });

    it('aceita outro tamanho de página', () => {
        expect(paginate(rows, 1, 50)).toMatchObject({ totalPages: 1, pageRows: rows });
    });
});
