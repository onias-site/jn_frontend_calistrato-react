/**
 * Os chamados do usuário logado, lidos do grupo do e-mail no jn_grouper pelo endpoint que traz os dois lados de uma vez
 * (GET /grouper/{email}/jn_login_email/{childName}/{parentId}/bothSides, API js): no lado ativo (jn_grouper) estão os
 * chamados em análise; no inativo (jn_inactive_grouper), os encerrados, cada um com o status (a entidade para onde foi).
 * Cada opção do combo é uma entidade de chamados (childName), às vezes filtrada pelo campo type.
 */
import { CONTACT_US_TYPES } from '@/presentation/layouts/contactUsTypes';

export const ACTIVE_SIDE = 'jn_grouper';
export const INACTIVE_SIDE = 'jn_inactive_grouper';

/** Uma coluna da grade: o título e como tirar o texto do chamado. */
export type Column = { title: string; value: (ticket: any) => string };

/** Uma opção do combo: a entidade dos chamados, o filtro pelo type e as colunas próprias dela. */
export type TicketKind = { value: string; label: string; childName: string; type?: string; columns: Column[] };

const text = (field: string) => (ticket: any) => (ticket[field] == null ? '' : String(ticket[field]));
const list = (field: string) => (ticket: any) => (ticket[field] || []).join(', ');

const contactUsColumns: Column[] = [
    { title: 'Título', value: text('title') },
    { title: 'Mensagem', value: text('description') },
    { title: 'Resposta do suporte', value: text('supportResponse') },
];

const hierarchyColumns: Column[] = [
    { title: 'Habilidade pai', value: text('parent') },
    { title: 'Habilidades', value: list('skill') },
    { title: 'Justificativa', value: text('description') },
    { title: 'Resposta do suporte', value: text('explanation') },
];

const skillSuggestionColumns: Column[] = [
    { title: 'Habilidade', value: text('skill') },
    { title: 'Sinônimos', value: list('synonym') },
    { title: 'Justificativa', value: text('description') },
    { title: 'Resposta do suporte', value: text('explanation') },
];

export const TICKET_KINDS: TicketKind[] = [
    ...CONTACT_US_TYPES.map((type) => ({ value: type.value, label: type.label, childName: 'js_contact_us', type: type.value, columns: contactUsColumns })),
    { value: 'hierarchyAdd', label: 'Associação de hierarquia', childName: 'vis_skill_fix_hierarchy_pending', type: 'add', columns: hierarchyColumns },
    { value: 'hierarchyRemove', label: 'Dissociação de hierarquia', childName: 'vis_skill_fix_hierarchy_pending', type: 'remove', columns: hierarchyColumns },
    { value: 'skillSuggestion', label: 'Sugestão de habilidade', childName: 'vis_skill_pending', columns: skillSuggestionColumns },
];

/** A situação de um chamado encerrado, pela entidade para onde ele foi. */
const CLOSED_SITUATIONS: Record<string, string> = {
    js_contact_us_solved: 'Respondido',
    vis_skill_fix_hierarchy_fulfiled: 'Concluído',
    vis_skill_approved: 'Aprovada',
    vis_skill_rejected: 'Rejeitada',
};

export const IN_ANALYSIS = 'Em análise';

/** Uma linha da grade: o chamado como foi gravado, com a data e a situação. */
export type Ticket = { date: string; situation: string; json: any };

/** A data dd/MM/yyyy HH:mm:ss como texto ordenável (yyyyMMddHHmmss); sem data, fica no fim. */
const sortable = (date: string): string => {
    if (!date) return '';
    const [day, month, rest] = date.split('/');
    const [year, time] = (rest || '').split(' ');
    return year + month + day + (time || '').replace(/:/g, '');
};

const parseAll = (children: string[] | undefined): any[] => (children || []).map((child) => JSON.parse(child));

/**
 * Os chamados de um tipo a partir da resposta do endpoint dos dois lados, do mais recente ao mais antigo.
 * @param groupOnBothSides a resposta, com o grupo de cada lado sob o nome da sua entidade ({} no lado onde não existe)
 */
export const ticketsFromGroups = (groupOnBothSides: any, kind: TicketKind): Ticket[] => {
    const activeGroup = (groupOnBothSides && groupOnBothSides[ACTIVE_SIDE]) || {};
    const inactiveGroup = (groupOnBothSides && groupOnBothSides[INACTIVE_SIDE]) || {};
    const ofThisKind = (json: any) => !kind.type || json.type == kind.type;
    const open = parseAll(activeGroup.child)
        .filter(ofThisKind)
        .map((json) => ({ date: json.date || '', situation: IN_ANALYSIS, json }));
    const closed = parseAll(inactiveGroup.child)
        .filter(ofThisKind)
        .map((json) => ({ date: json.date || '', situation: CLOSED_SITUATIONS[json.status] || 'Encerrado', json }));
    return [...open, ...closed].sort((x, y) => sortable(y.date).localeCompare(sortable(x.date)));
};
