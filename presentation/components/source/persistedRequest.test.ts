jest.mock('jquery', () => ({ ajax: jest.fn() }));
jest.mock('pubsub-js', () => ({ publish: jest.fn() }));

import JnAjax from '@/app/JnAjax';

const API = 'http://localhost:8081';

const fakeStorage = (limit = Infinity) => {
    const items = new Map<string, string>();
    return {
        get length() {
            return items.size;
        },
        key: (index: number) => [...items.keys()][index],
        getItem: (key: string) => (items.has(key) ? items.get(key) : null),
        removeItem: (key: string) => items.delete(key),
        setItem: (key: string, value: string) => {
            if (items.size >= limit) throw new Error('QuotaExceededError');
            items.set(key, value);
        },
    };
};

describe('JnAjax.doAPersistedRequest', () => {
    let requests: any[];
    let received: any[];

    const load = (uri: string) => {
        const callbacks: any = {};
        callbacks[200] = (body: any) => received.push(body);
        JnAjax.doAPersistedRequest(uri, callbacks, API);
    };

    const useStorage = (storage: any) => Object.defineProperty(global, 'localStorage', { value: storage, configurable: true, writable: true });

    beforeEach(() => {
        requests = [];
        received = [];
        useStorage(fakeStorage());
        (JnAjax as any).doAnAjaxRequest = (uri: string, callbacks: any) => requests.push({ uri, callbacks });
    });

    afterEach(() => jest.restoreAllMocks());

    it('vai ao backend só na primeira vez; depois responde do localStorage', () => {
        load('statistics/skills/202610/pleno/10');
        requests[0].callbacks[200]({ total: 91 }, 200);
        load('statistics/skills/202610/pleno/10');

        expect(requests).toHaveLength(1);
        expect(received).toEqual([{ total: 91 }, { total: 91 }]);
    });

    it('cada filtro é uma pesquisa separada', () => {
        load('statistics/skills/202610/pleno/10');
        requests[0].callbacks[200]({ total: 91 }, 200);
        load('statistics/skills/202610/senior/10');

        expect(requests.map((request) => request.uri)).toEqual(['statistics/skills/202610/pleno/10', 'statistics/skills/202610/senior/10']);
    });

    it('não guarda erro: depois de um 500 a tela vai de novo ao backend', () => {
        load('statistics/skills/202610/pleno/10');
        load('statistics/skills/202610/pleno/10');

        expect(requests).toHaveLength(2);
    });

    it('a resposta vence em 24 horas', () => {
        load('statistics/skills/202610/pleno/10');
        requests[0].callbacks[200]({ total: 91 }, 200);
        const now = new Date().getTime();
        jest.spyOn(Date.prototype, 'getTime').mockReturnValue(now + JnAjax.PERSISTED_REQUEST_LIFETIME + 1);

        load('statistics/skills/202610/pleno/10');

        expect(requests).toHaveLength(2);
    });

    it('com o prazo de um ano, a resposta vale depois de 24 horas e vence só após um ano', () => {
        const loadForAYear = () => {
            const callbacks: any = {};
            callbacks[200] = (body: any) => received.push(body);
            JnAjax.doAPersistedRequest('statistics/skills/202610/pleno/10', callbacks, API, JnAjax.PERSISTED_REQUEST_ONE_YEAR);
        };
        loadForAYear();
        requests[0].callbacks[200]({ total: 91 }, 200);
        const now = new Date().getTime();
        const getTime = jest.spyOn(Date.prototype, 'getTime');

        getTime.mockReturnValue(now + JnAjax.PERSISTED_REQUEST_LIFETIME + 1);
        loadForAYear();
        expect(requests).toHaveLength(1);

        getTime.mockReturnValue(now + JnAjax.PERSISTED_REQUEST_ONE_YEAR + 1);
        loadForAYear();
        expect(requests).toHaveLength(2);
    });

    it('sem espaço, descarta só o que ela guardou e grava a resposta nova', () => {
        const storage = fakeStorage(2);
        useStorage(storage);
        storage.setItem('logins', '{}');
        load('statistics/skills/202610/pleno/10');
        requests[0].callbacks[200]({ total: 91 }, 200);
        load('statistics/skills/202610/senior/10');
        requests[1].callbacks[200]({ total: 7 }, 200);

        load('statistics/skills/202610/senior/10');

        expect(requests).toHaveLength(2);
        expect(storage.getItem('logins')).toBe('{}');
    });

    it('sem localStorage, a tela funciona indo ao backend', () => {
        useStorage({
            getItem: () => {
                throw new Error('bloqueado');
            },
        });
        load('statistics/skills/202610/pleno/10');
        requests[0].callbacks[200]({ total: 91 }, 200);

        expect(received).toEqual([{ total: 91 }]);
    });
});
