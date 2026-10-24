/**
 * Os tipos de ticket do "Fale Conosco": o valor é o que o back end aceita (os itens de JsContactUsTypes, js) e o texto é o
 * que o usuário vê no combo.
 */
export const CONTACT_US_TYPES = [
    { value: 'reportBug', label: 'Reportar um bug' },
    { value: 'makeCompliment', label: 'Fazer um elogio' },
    { value: 'makeCriticism', label: 'Fazer uma crítica' },
    { value: 'makeSuggestion', label: 'Fazer uma sugestão' },
    { value: 'makeComment', label: 'Fazer um comentário' },
    { value: 'clarifyDoubts', label: 'Esclarecer dúvidas' },
];

/** Os limites de tamanho que o back end valida (JsEntityContactUs). */
export const TITLE_LENGTH = { min: 5, max: 50 };
export const DESCRIPTION_LENGTH = { min: 10, max: 500 };
export const STACK_TRACE_MAX_LENGTH = 50000;

/** O que falta para o formulário poder ser enviado, ou '' quando está tudo certo. */
export const contactUsProblem = (email: string, type: string, title: string, description: string): string => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Informe um e-mail válido.';
    if (!type) return 'Escolha o tipo da mensagem.';
    const titleLength = title.trim().length;
    if (titleLength < TITLE_LENGTH.min || titleLength > TITLE_LENGTH.max) return `O título precisa ter de ${TITLE_LENGTH.min} a ${TITLE_LENGTH.max} caracteres.`;
    const descriptionLength = description.trim().length;
    if (descriptionLength < DESCRIPTION_LENGTH.min || descriptionLength > DESCRIPTION_LENGTH.max)
        return `A mensagem precisa ter de ${DESCRIPTION_LENGTH.min} a ${DESCRIPTION_LENGTH.max} caracteres.`;
    return '';
};
