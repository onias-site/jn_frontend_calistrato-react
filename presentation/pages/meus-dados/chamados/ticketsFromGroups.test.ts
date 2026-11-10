import { CELL_MAX_CHARACTERS, IN_ANALYSIS, TICKET_KINDS, abbreviate, ticketsFromGroups } from './ticketsFromGroups';
import { contactUsProblem } from '@/presentation/layouts/contactUsTypes';

const kind = (value: string) => TICKET_KINDS.find((k) => k.value == value)!;

describe('rótulos do combo de tipo de chamado', () => {
    it('nomeiam o tipo do chamado já aberto, e não a ação de abrir um', () => {
        expect(TICKET_KINDS.map((k) => k.label)).toEqual([
            'Bug',
            'Elogio',
            'Crítica',
            'Sugestão',
            'Comentário',
            'Dúvida',
            'Associação de hierarquia',
            'Dissociação de hierarquia',
            'Sugestão de habilidade',
        ]);
    });
});

describe('ticketsFromGroups', () => {
    it('junta os dois lados, do mais recente ao mais antigo, com a situação de cada um', () => {
        const response = {
            jn_grouper: { child: [JSON.stringify({ type: 'reportBug', title: 'Erro novo', date: '02/10/2026 10:00:00' })] },
            jn_inactive_grouper: { child: [JSON.stringify({ type: 'reportBug', title: 'Erro velho', date: '01/10/2026 10:00:00', status: 'js_contact_us_solved', supportResponse: 'Corrigido' })] },
        };

        const tickets = ticketsFromGroups(response, kind('reportBug'));

        expect(tickets.map((t) => t.json.title)).toEqual(['Erro novo', 'Erro velho']);
        expect(tickets.map((t) => t.situation)).toEqual([IN_ANALYSIS, 'Respondido']);
    });

    it('filtra pelo type: o combo separa os tipos do fale conosco e as associações das dissociações', () => {
        const response = {
            jn_grouper: { child: [JSON.stringify({ type: 'add', parent: 'go', skill: ['gin'] }), JSON.stringify({ type: 'remove', parent: 'scala', skill: ['akka'] })] },
        };

        const tickets = ticketsFromGroups(response, kind('hierarchyRemove'));

        expect(tickets).toHaveLength(1);
        expect(tickets[0].json.parent).toBe('scala');
        expect(kind('hierarchyRemove').columns[1].value(tickets[0].json)).toBe('akka');
    });

    it('a sugestão de habilidade não tem type: vem tudo, e a rejeitada aparece como tal', () => {
        const response = { jn_inactive_grouper: { child: [JSON.stringify({ skill: 'KTOR', status: 'vis_skill_rejected' })] } };

        expect(ticketsFromGroups(response, kind('skillSuggestion'))[0].situation).toBe('Rejeitada');
    });

    it('sem grupo em nenhum dos lados não há chamados', () => {
        expect(ticketsFromGroups({}, kind('clarifyDoubts'))).toEqual([]);
    });
});

describe('abbreviate', () => {
    it('mostra inteiro o texto que cabe na célula', () => {
        expect(abbreviate('Corrigido, obrigado.')).toEqual({ shown: 'Corrigido, obrigado.', truncated: false });
        expect(abbreviate('')).toEqual({ shown: '', truncated: false });
    });

    it('corta o texto comprido no último espaço, com reticências', () => {
        const longText = 'palavra '.repeat(40).trim();

        const { shown, truncated } = abbreviate(longText);

        expect(truncated).toBe(true);
        expect(shown.endsWith('palavra…')).toBe(true);
        expect(shown.length).toBeLessThanOrEqual(CELL_MAX_CHARACTERS + 1);
    });

    it('corta nas 3 primeiras linhas o texto de muitas linhas curtas', () => {
        const { shown, truncated } = abbreviate('a\nb\nc\nd');

        expect(truncated).toBe(true);
        expect(shown).toBe('a\nb\nc…');
    });

    it('corta no limite exato a palavra que não tem espaço', () => {
        const { shown, truncated } = abbreviate('x'.repeat(CELL_MAX_CHARACTERS + 10));

        expect(truncated).toBe(true);
        expect(shown).toBe('x'.repeat(CELL_MAX_CHARACTERS) + '…');
    });
});

describe('contactUsProblem', () => {
    it('aceita o formulário completo', () => {
        expect(contactUsProblem('a@b.com', 'reportBug', 'Tela travou', 'A tela travou ao salvar')).toBe('');
    });

    it('recusa título e mensagem fora dos limites do back end', () => {
        expect(contactUsProblem('a@b.com', 'reportBug', 'Oi', 'A tela travou ao salvar')).toContain('título');
        expect(contactUsProblem('a@b.com', 'reportBug', 'Tela travou', 'curta')).toContain('mensagem');
    });

    it('recusa e-mail inválido e tipo vazio', () => {
        expect(contactUsProblem('nao-e-email', 'reportBug', 'Tela travou', 'A tela travou ao salvar')).toContain('e-mail');
        expect(contactUsProblem('a@b.com', '', 'Tela travou', 'A tela travou ao salvar')).toContain('tipo');
    });
});
