/**
 * Os currículos ativos de cada região (ddd) da vaga, na aba "Filtros" do formulário de vagas (desde 2026-11-22): o
 * público GET positions/resumes-of-the-ddds/{ddds separados por vírgula} (sem sessão: a tela abre sem login) devolve, por
 * ddd, os filhos do grupo do ddd no jn_grouper (parte do currículo e o id). Na vaga home office a região não importa:
 * o mesmo GET sem ddds devolve todos os ddds de uma vez. Cada ddd fica guardado no navegador por uma hora, e a tela só
 * pede ao backend os que não tem. Um currículo de vários ddds conta uma vez só, pelo id.
 */

export type ResumeOfTheDdd = { id: string; [field: string]: any };

type Cached<T> = { savedAt: number; value: T };

type StorageLike = { getItem: (key: string) => string | null; setItem: (key: string, value: string) => void; removeItem: (key: string) => void };

export const CACHE_LIFETIME = 60 * 60 * 1000;

const KEY_PREFIX = 'positions.resumesOfTheDdd.';

// a marca da resposta com todos os ddds (vaga home office): a lista dos ddds que vieram nela
const ALL_DDDS = 'all';

// a cópia em memória vale quando o localStorage está cheio ou bloqueado (janela anônima, cota estourada)
const memory = new Map<string, Cached<any>>();

const browserStorage = (): StorageLike | null => {
    try {
        return typeof window == 'undefined' ? null : window.localStorage;
    } catch (error) {
        return null;
    }
};

const isFresh = <T,>(cached: Cached<T> | null | undefined, now: number): cached is Cached<T> => !!cached && now - cached.savedAt < CACHE_LIFETIME;

const readFromStorage = <T,>(key: string, storage: StorageLike | null): Cached<T> | null => {
    try {
        const text = storage ? storage.getItem(KEY_PREFIX + key) : null;
        return text ? JSON.parse(text) : null;
    } catch (error) {
        return null;
    }
};

const read = <T,>(key: string, now: number, storage: StorageLike | null): T | null => {
    const inMemory = memory.get(key);
    if (isFresh(inMemory, now)) return inMemory.value;
    const stored = readFromStorage<T>(key, storage);
    if (!isFresh(stored, now)) return null;
    memory.set(key, stored);
    return stored.value;
};

const write = <T,>(key: string, value: T, now: number, storage: StorageLike | null) => {
    const cached: Cached<T> = { savedAt: now, value };
    memory.set(key, cached);
    try {
        storage && storage.setItem(KEY_PREFIX + key, JSON.stringify(cached));
    } catch (error) {
        // cota estourada: fica a cópia em memória
    }
};

/** Os currículos do ddd guardados há menos de uma hora, ou null. */
export const cachedResumesOf = (ddd: string, now: number = Date.now(), storage: StorageLike | null = browserStorage()): ResumeOfTheDdd[] | null =>
    read<ResumeOfTheDdd[]>(ddd, now, storage);

/** Guarda os currículos do ddd por uma hora. */
export const cacheResumesOf = (ddd: string, resumes: ResumeOfTheDdd[], now: number = Date.now(), storage: StorageLike | null = browserStorage()) =>
    write(ddd, resumes, now, storage);

/** Guarda a resposta com todos os ddds (vaga home office): cada ddd, como os pedidos um a um, e a lista deles. */
export const cacheAllDdds = (resumesByDdd: Record<string, ResumeOfTheDdd[]>, now: number = Date.now(), storage: StorageLike | null = browserStorage()) => {
    const ddds = Object.keys(resumesByDdd);
    ddds.forEach((ddd) => cacheResumesOf(ddd, resumesByDdd[ddd] || [], now, storage));
    write(ALL_DDDS, ddds, now, storage);
};

/** Todos os ddds, quando a resposta com todos eles (e cada um deles) foi guardada há menos de uma hora; senão null. */
export const cachedAllDdds = (now: number = Date.now(), storage: StorageLike | null = browserStorage()): string[] | null => {
    const ddds = read<string[]>(ALL_DDDS, now, storage);
    if (!ddds) return null;
    const everyDddCached = ddds.every((ddd) => cachedResumesOf(ddd, now, storage) != null);
    return everyDddCached ? ddds : null;
};

/** Os ddds escolhidos que o navegador ainda não tem (ou que guardou há mais de uma hora): só eles vão ao backend. */
export const missingDdds = (ddds: string[], now: number = Date.now(), storage: StorageLike | null = browserStorage()) =>
    ddds.filter((ddd) => cachedResumesOf(ddd, now, storage) == null);

/** Quantos currículos diferentes há nos ddds escolhidos (um currículo de vários ddds conta uma vez). */
export const countResumes = (ddds: string[], now: number = Date.now(), storage: StorageLike | null = browserStorage()) => {
    const ids = new Set<string>();
    ddds.forEach((ddd) => (cachedResumesOf(ddd, now, storage) || []).forEach((resume) => ids.add(resume.id)));
    return ids.size;
};

export const foundResumesMessage = (resumes: number) => `Foram encontrados ${resumes} currículos`;

/** Só para os testes: esquece a cópia em memória. */
export const forgetResumesInMemory = () => memory.clear();
