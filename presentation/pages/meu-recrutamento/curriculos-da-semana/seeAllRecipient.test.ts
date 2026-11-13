import { decideSeeAll, getRecipientFromQuery, getSeeAllTitle } from './seeAllRecipient';

describe('tela Ver todos: título com o recrutador', () => {
    it('com a lista carregada: o e-mail da lista', () => {
        expect(getSeeAllTitle('Onias85@gmail.com', 'onias85@gmail.com')).toBe('Currículos da semana do recrutador onias85@gmail.com');
    });

    it('antes de carregar: o destinatário do link', () => {
        expect(getSeeAllTitle('', 'onias85@gmail.com')).toBe('Currículos da semana do recrutador onias85@gmail.com');
    });

    it('sem e-mail nenhum: só o título', () => {
        expect(getSeeAllTitle('', '')).toBe('Currículos da semana');
    });
});

// bug de 2026-11-12: o e-mail foi para onias85@..., o navegador estava logado como onias86@... e a tela "Ver todos"
// abria vazia, porque lê a lista da conta logada
describe('tela Ver todos: destinatário do link x conta logada', () => {
    it('lê o destinatário do link, decodificado e em minúsculas', () => {
        expect(getRecipientFromQuery('?email=Recrutador%2Bvagas%40Empresa.com.br')).toBe('recrutador+vagas@empresa.com.br');
    });

    it('link antigo, sem destinatário: vazio', () => {
        expect(getRecipientFromQuery('')).toBe('');
        expect(getRecipientFromQuery('?outro=1')).toBe('');
    });

    it('outra conta logada: pede o login do destinatário em vez de abrir vazia', () => {
        expect(decideSeeAll('onias85@gmail.com', 'onias86@gmail.com')).toBe('wrongAccount');
    });

    it('a conta do destinatário logada: carrega, sem diferenciar maiúsculas', () => {
        expect(decideSeeAll('onias85@gmail.com', 'Onias85@Gmail.com ')).toBe('load');
    });

    it('ninguém logado: carrega (o 401 abre o login)', () => {
        expect(decideSeeAll('onias85@gmail.com', '')).toBe('load');
        expect(decideSeeAll('onias85@gmail.com', undefined)).toBe('load');
    });

    it('link sem destinatário: carrega a lista da conta logada, como antes', () => {
        expect(decideSeeAll('', 'onias86@gmail.com')).toBe('load');
    });
});
