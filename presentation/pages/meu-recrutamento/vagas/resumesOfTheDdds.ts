/**
 * Os currículos ativos de cada região (ddd) da vaga, na aba "Opções" do formulário de vagas (desde 2026-11-22): o endpoint
 * público GET positions/resumes-of-the-ddds/{ddds separados por vírgula} (sem sessão: a tela abre sem login) devolve, por ddd, os filhos do grupo do ddd no jn_grouper (parte do
 * currículo e o id). Cada ddd fica guardado no navegador por uma hora, e a tela só pede ao backend os que não tem. Um
 * currículo de vários ddds conta uma vez só, pelo id.
 */

export type ResumeOfTheDdd = { id: string; [field: string]: any };

type CachedDdd = { savedAt: number; resumes: ResumeOfTheDdd[] };

type StorageLike = { getItem: (key: string) => string | null; setItem: (key: string, value: string) => void; removeItem: (key: string) => void };

export const CACHE_LIFETIME = 60 * 60 * 1000;

const KEY_PREFIX = 'positions.resumesOfTheDdd.';

// a cópia em memória vale quando o localStorage está cheio ou bloqueado (janela anônima, cota estourada)
const memory = new Map<string, CachedDdd>();

const browserStorage = (): StorageLike | null => {
    try {
        return typeof window == 'undefined' ? null : window.localStorage;
    } catch (error) {
        return null;
    }
};

const isFresh = (cached: CachedDdd | null | undefined, now: number): cached is CachedDdd => !!cached && now - cached.savedAt < CACHE_LIFETIME;

const readFromStorage = (ddd: string, storage: StorageLike | null): CachedDdd | null => {
    try {
        const text = storage ? storage.getItem(KEY_PREFIX + ddd) : null;
        return text ? JSON.parse(text) : null;
    } catch (error) {
        return null;
    }
};

/** Os currículos do ddd guardados há menos de uma hora, ou null. */
export const cachedResumesOf = (ddd: string, now: number = Date.now(), storage: StorageLike | null = browserStorage()): ResumeOfTheDdd[] | null => {
    const inMemory = memory.get(ddd);
    if (isFresh(inMemory, now)) return inMemory.resumes;
    const stored = readFromStorage(ddd, storage);
    if (!isFresh(stored, now)) return null;
    memory.set(ddd, stored);
    return stored.resumes;
};

/** Guarda os currículos do ddd por uma hora. */
export const cacheResumesOf = (ddd: string, resumes: ResumeOfTheDdd[], now: number = Date.now(), storage: StorageLike | null = browserStorage()) => {
    const cached: CachedDdd = { savedAt: now, resumes };
    memory.set(ddd, cached);
    try {
        storage && storage.setItem(KEY_PREFIX + ddd, JSON.stringify(cached));
    } catch (error) {
        // cota estourada: fica a cópia em memória
    }
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
