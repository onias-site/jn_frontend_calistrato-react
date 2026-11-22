import { CACHE_LIFETIME, cacheAllDdds, cachedAllDdds, cacheResumesOf, cachedResumesOf, countResumes, forgetResumesInMemory, foundResumesMessage, missingDdds } from './resumesOfTheDdds';

const fakeStorage = () => {
    const items = new Map<string, string>();
    return {
        getItem: (key: string) => (items.has(key) ? (items.get(key) as string) : null),
        setItem: (key: string, value: string) => void items.set(key, value),
        removeItem: (key: string) => void items.delete(key),
        items,
    };
};

describe('resumesOfTheDdds', () => {
    beforeEach(forgetResumesInMemory);

    it('guarda cada ddd por uma hora e só pede ao backend os que faltam', () => {
        const storage = fakeStorage();
        const now = 1_000_000;
        expect(missingDdds(['10'], now, storage)).toEqual(['10']);
        cacheResumesOf('10', [{ id: 'a' }], now, storage);
        expect(missingDdds(['10', '11', '21'], now, storage)).toEqual(['11', '21']);
        // depois de uma hora, o ddd volta a faltar
        expect(missingDdds(['10'], now + CACHE_LIFETIME, storage)).toEqual(['10']);
    });

    it('lê do localStorage o que outra aba ou outra visita guardou', () => {
        const storage = fakeStorage();
        cacheResumesOf('11', [{ id: 'b' }], 5, storage);
        forgetResumesInMemory();
        expect(cachedResumesOf('11', 10, storage)).toEqual([{ id: 'b' }]);
    });

    it('com o localStorage cheio, a cópia em memória continua valendo', () => {
        const fullStorage = { ...fakeStorage(), setItem: () => { throw new Error('QuotaExceededError'); } };
        cacheResumesOf('21', [{ id: 'c' }], 5, fullStorage);
        expect(cachedResumesOf('21', 10, fullStorage)).toEqual([{ id: 'c' }]);
    });

    it('na vaga home office guarda todos os ddds de uma vez, e eles servem também aos pedidos por região', () => {
        const storage = fakeStorage();
        expect(cachedAllDdds(1, storage)).toBeNull();
        cacheAllDdds({ '10': [{ id: 'a' }], '11': [{ id: 'a' }, { id: 'b' }], '21': [] }, 1, storage);
        const all = cachedAllDdds(2, storage) as string[];
        expect(all).toEqual(['10', '11', '21']);
        expect(countResumes(all, 2, storage)).toBe(2);
        expect(missingDdds(['11', '21'], 2, storage)).toEqual([]);
        // um ddd vencido faz o pedido de todos voltar ao backend
        cacheResumesOf('21', [], 2 - CACHE_LIFETIME, storage);
        forgetResumesInMemory();
        expect(cachedAllDdds(3, storage)).toBeNull();
        expect(cachedAllDdds(1 + CACHE_LIFETIME, storage)).toBeNull();
    });

    it('conta uma vez o currículo que está em vários ddds', () => {
        const storage = fakeStorage();
        cacheResumesOf('10', [{ id: 'a' }, { id: 'b' }], 1, storage);
        cacheResumesOf('11', [{ id: 'b' }, { id: 'c' }], 1, storage);
        expect(countResumes(['10', '11'], 2, storage)).toBe(3);
        expect(countResumes(['11'], 2, storage)).toBe(2);
        expect(foundResumesMessage(3)).toBe('Foram encontrados 3 currículos');
    });
});
