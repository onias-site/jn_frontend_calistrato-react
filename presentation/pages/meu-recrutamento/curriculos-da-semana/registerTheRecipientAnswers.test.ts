jest.mock('@/app/JnAjax', () => ({ __esModule: true, default: { doAnAjaxRequest: jest.fn(), removeAllCachedStatus: jest.fn() } }));

import JnAjax from '@/app/JnAjax';
import { registerTheRecipientAnswers, RECIPIENT_ANSWERS } from './registerTheRecipientAnswers';

const request = JnAjax.doAnAjaxRequest as jest.Mock;

// 2026-11-16: quem clica em "Ver todos" ganha as respostas do pré-cadastro goal = recruiting e channel = others
describe('tela Ver todos: respostas do pré-cadastro do destinatário', () => {
    beforeEach(() => jest.clearAllMocks());

    it('registra o e-mail de login e, faltando as respostas (201), grava recruiting e others', () => {
        registerTheRecipientAnswers('recrutador@empresa.com.br');
        expect(request).toHaveBeenCalledTimes(1);
        const [url, callbacks, method] = request.mock.calls[0];
        expect(url).toBe('login/recrutador@empresa.com.br/token');
        expect(method).toBe('POST');

        callbacks[201]();
        expect(request).toHaveBeenCalledTimes(2);
        const [answersUrl, answersCallbacks, answersMethod, body] = request.mock.calls[1];
        expect(answersUrl).toBe('login/recrutador@empresa.com.br/pre-registration');
        expect(answersMethod).toBe('POST');
        expect(body).toEqual({ goal: 'recruiting', channel: 'others' });
        expect(body).toBe(RECIPIENT_ANSWERS);

        answersCallbacks[202]();
        expect(JnAjax.removeAllCachedStatus).toHaveBeenCalledWith('201');
    });

    it('com as respostas já gravadas (200 ou 202 no e-mail), não grava de novo', () => {
        registerTheRecipientAnswers('recrutador@empresa.com.br');
        const [, callbacks] = request.mock.calls[0];
        expect(callbacks[200]).toBeUndefined();
        expect(callbacks[202]).toBeUndefined();
        expect(request).toHaveBeenCalledTimes(1);
    });

    it('não abre o login nem a capa de carregamento', () => {
        registerTheRecipientAnswers('recrutador@empresa.com.br');
        const [, callbacks] = request.mock.calls[0];
        expect(() => callbacks[401]()).not.toThrow();
        expect(() => callbacks.setLoading()).not.toThrow();
        expect(() => callbacks.onUnexpectedHttpStatus()).not.toThrow();
    });

    it('link sem destinatário: nenhuma requisição', () => {
        registerTheRecipientAnswers('');
        expect(request).not.toHaveBeenCalled();
    });
});
