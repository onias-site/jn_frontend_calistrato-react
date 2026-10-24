jest.mock('jquery', () => ({ ajax: jest.fn() }));
jest.mock('pubsub-js', () => ({ publish: jest.fn() }));

import JnAjax from '@/app/JnAjax';

const login = () => ({ email: 'cache@teste.com', sessionToken: 'S' });

describe('JnAjax.doACachedRequest', () => {
    let requests: any[];

    beforeEach(() => {
        JnAjax.clearScreenCache();
        requests = [];
        (JnAjax as any).doAnAjaxRequest = (uri: string, callbacks: any) => requests.push({ uri, callbacks });
    });

    const load = (uri: string, onLoaded: (body: any, status: number) => void) => {
        const callbacks: any = { getLogin: login };
        callbacks[200] = onLoaded;
        callbacks[404] = onLoaded;
        JnAjax.doACachedRequest(uri, callbacks, 'GET', null as any, {}, 'http://localhost:8082');
    };

    it('vai ao backend só na primeira vez; depois responde da memória', () => {
        const received: any[] = [];
        load('grouper/{email}/x/js_contact_us/1/bothSides', (body) => received.push(body));
        requests[0].callbacks[200]({ itens: 1 }, 200);
        load('grouper/{email}/x/js_contact_us/1/bothSides', (body) => received.push(body));

        expect(requests).toHaveLength(1);
        expect(received).toEqual([{ itens: 1 }, { itens: 1 }]);
    });

    it('guarda também o 404 (nada cadastrado) e cada item do combo separadamente', () => {
        const statuses: number[] = [];
        load('grouper/{email}/x/js_contact_us/1/bothSides', (_, status) => statuses.push(status));
        requests[0].callbacks[404]('', 404);
        load('grouper/{email}/x/vis_skill_pending/1/bothSides', () => {});
        load('grouper/{email}/x/js_contact_us/1/bothSides', (_, status) => statuses.push(status));

        expect(requests.map((r) => r.uri)).toEqual(['grouper/{email}/x/js_contact_us/1/bothSides', 'grouper/{email}/x/vis_skill_pending/1/bothSides']);
        expect(statuses).toEqual([404, 404]);
    });

    it('não guarda erro: depois de um 500 a tela vai de novo ao backend', () => {
        load('resume/{email}/viewers/2026-10', () => {});
        load('resume/{email}/viewers/2026-10', () => {});

        expect(requests).toHaveLength(2);
    });

    it('uma escrita de chamado bem-sucedida descarta só a lista daquele tipo de chamado', () => {
        load('grouper/{email}/x/js_contact_us/1/bothSides', () => {});
        requests[0].callbacks[200]({}, 200);
        load('grouper/{email}/x/vis_skill_pending/1/bothSides', () => {});
        requests[1].callbacks[200]({}, 200);

        JnAjax.forgetWhatThisWriteChanged('contact-us/cache@teste.com', 'POST', 200);
        load('grouper/{email}/x/js_contact_us/1/bothSides', () => {});
        load('grouper/{email}/x/vis_skill_pending/1/bothSides', () => {});

        expect(requests).toHaveLength(3);
        expect(requests[2].uri).toContain('js_contact_us');
    });

    it('uma escrita recusada não descarta nada', () => {
        load('grouper/{email}/x/vis_skill_pending/1/bothSides', () => {});
        requests[0].callbacks[200]({}, 200);

        JnAjax.forgetWhatThisWriteChanged('resume/{email}/skills/suggestion', 'POST', 429);
        load('grouper/{email}/x/vis_skill_pending/1/bothSides', () => {});

        expect(requests).toHaveLength(1);
    });
});
