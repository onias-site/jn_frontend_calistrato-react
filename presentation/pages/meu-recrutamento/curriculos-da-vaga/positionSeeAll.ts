/**
 * A tela "Ver todos" do e-mail "{n} Cvs recebidos para a vaga {título}" (desde 2026-11-24): a mesma tela dos currículos
 * da semana, com a lista da vaga. O link do e-mail leva o destinatário (`?email=`) e o título da vaga (`?vaga=`); a
 * lista é lida pelo e-mail da conta logada e pelo título.
 */

/** O título da vaga do link (`?vaga=`), já decodificado; vazio quando o link não o traz. */
export const getPositionTitleFromQuery = (search: string): string => {
    const params = new URLSearchParams(search || '');
    return (params.get('vaga') || '').trim();
};

/** A rota da lista da vaga na API vis; o {email} é trocado pela conta logada. */
export const getResumesOfThePositionPath = (positionTitle: string): string =>
    `recruiter/{email}/resumes-of-the-position?title=${encodeURIComponent(positionTitle)}`;

/** O título da tela: a vaga e, quando conhecido, o recrutador dono da lista. */
export const getResumesOfThePositionTitle = (positionTitle: string, owner: string): string => {
    const position = positionTitle ? `Currículos da vaga ${positionTitle}` : 'Currículos da vaga';
    return owner ? `${position} do recrutador ${owner}` : position;
};

/** O título do grid: quantos currículos a lista tem e, com o filtro, quantos ainda não foram vistos. */
export const getResumesOfThePositionGridTitle = (total: number, shown: number, onlyNotViewed: boolean): string => {
    const all = `${total} ${total == 1 ? 'currículo recebido' : 'currículos recebidos'} no último e-mail da vaga`;
    if (!onlyNotViewed) return all;
    return `${all}, ${shown} ${shown == 1 ? 'ainda não visto' : 'ainda não vistos'}`;
};
