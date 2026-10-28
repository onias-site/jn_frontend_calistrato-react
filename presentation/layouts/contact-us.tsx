'use client';
import React, { useEffect, useState } from 'react';
import PubSub from 'pubsub-js';
import JnAjax from '@/app/JnAjax';
import { ModalLoginStore } from '@/presentation/auth/ModalLogin';
import { CONTACT_US_TYPES, DESCRIPTION_LENGTH, TITLE_LENGTH, contactUsProblem } from './contactUsTypes';
import { getLastStackTrace, listenToUnhandledErrors } from './lastStackTrace';

/**
 * O e-mail de quem escreve: o do login, senão o que o modal de login tem digitado. O "Fale Conosco" não exige sessão
 * (o defeito pode ser justamente na tela de login), então sem nenhum dos dois o usuário digita o e-mail no formulário.
 */
const knownEmail = (): string => {
    const login: any = JnAjax.getLogin() || {};
    return login.email || ModalLoginStore.getState().email || '';
};

/**
 * O "Fale Conosco": painel flutuante presente em todas as páginas do layout padrão, no canto inferior direito, logo acima
 * do botão de voltar ao topo. O botão abre o formulário (tipo, título e mensagem); o X, o Cancelar e a tecla Esc o limpam
 * e fecham. O Enviar grava o ticket (POST /contact-us/{email}, API js) com o último stack trace de JavaScript da aba; o
 * usuário recebe um e-mail e o suporte, o ticket no bot.
 */
const ContactUs = () => {
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [emailIsKnown, setEmailIsKnown] = useState(false);
    const [contactType, setContactType] = useState('');
    const [subject, setSubject] = useState('');
    const [text, setText] = useState('');
    const [problem, setProblem] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(listenToUnhandledErrors, []);

    const openTheForm = () => {
        const email = knownEmail();
        setEmail(email);
        setEmailIsKnown(!!email);
        setOpen(true);
    };

    const clearAndClose = () => {
        setContactType('');
        setSubject('');
        setText('');
        setProblem('');
        setOpen(false);
    };

    // o Esc faz o mesmo que o X: limpa e fecha
    useEffect(() => {
        if (!open) return;
        const closeOnEsc = (e: KeyboardEvent) => e.key == 'Escape' && clearAndClose();
        window.addEventListener('keydown', closeOnEsc);
        return () => window.removeEventListener('keydown', closeOnEsc);
    }, [open]);

    const send = (e: React.FormEvent) => {
        e.preventDefault();
        const found = contactUsProblem(email, contactType, subject, text);
        setProblem(found);
        if (found) return;

        const callbacks: any = {};
        callbacks['setLoading'] = () => setSending(true);
        callbacks['setNotLoading'] = () => setSending(false);
        // sem sessão: o e-mail vai no caminho, e não há 401 a tratar
        callbacks['getLogin'] = () => ({});
        callbacks[200] = () => {
            PubSub.publish('showMessage', { summary: 'Mensagem enviada!', detail: `Enviamos para ${email.trim()} um e-mail com os detalhes; o ticket está em análise.` });
            clearAndClose();
        };
        callbacks[403] = () => setProblem('O suporte não está aceitando novas mensagens deste e-mail.');
        callbacks[429] = () =>
            setProblem(
                contactType == 'clarifyDoubts'
                    ? 'Você já enviou uma dúvida nas últimas 24 horas. Aguarde a resposta ou envie outra quando completar 24 horas do envio anterior.'
                    : 'Você já abriu um ticket nas últimas 24 horas (fale conosco, sugestão de habilidade ou ajuste de hierarquia). Um novo poderá ser aberto quando completar 24 horas do envio anterior; bugs podem ser reportados a qualquer momento.',
            );
        callbacks[400] = () => setProblem('Informe um e-mail válido.');
        callbacks[422] =() => setProblem('Confira os campos: algum deles não foi aceito.');
        callbacks['onUnexpectedHttpStatus'] = () => setProblem('Não foi possível enviar agora. Tente de novo em alguns instantes.');

        const body: any = { type: contactType, title: subject.trim(), description: text.trim() };
        const stackTrace = getLastStackTrace();
        if (stackTrace) body.stackTrace = stackTrace;
        // o e-mail vai cru, como o JnAjax põe o {email}: o filtro do back end lê o caminho sem decodificar o %40
        const path = `contact-us/${email.trim()}`;
        JnAjax.doAnAjaxRequest(path, callbacks, 'POST', body, {}, 'http://localhost:8082');
    };

    return (
        <div className="fixed bottom-20 z-50 ltr:right-6 rtl:left-6">
            {open ? (
                <div className="panel w-80 max-w-[calc(100vw-3rem)] shadow-lg">
                    <div className="mb-4 flex items-center justify-between">
                        <h5 className="text-lg font-semibold">Fale Conosco</h5>
                        <button type="button" className="text-white-dark hover:text-dark" onClick={clearAndClose} title="Fechar">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                        </button>
                    </div>
                    <form className="space-y-3" onSubmit={send}>
                        {emailIsKnown ? (
                            <div className="text-xs text-white-dark">Responderemos para {email}</div>
                        ) : (
                            <input type="email" className="form-input" placeholder="Seu e-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
                        )}
                        <select className="form-select" value={contactType} onChange={(e) => setContactType(e.target.value)}>
                            {/* sem opção escolhida: a vazia não aparece na lista */}
                            <option value="" disabled hidden></option>
                            {CONTACT_US_TYPES.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Título da sua mensagem"
                            maxLength={TITLE_LENGTH.max}
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                        />
                        <textarea
                            className="form-textarea min-h-[120px]"
                            placeholder="Escreva aqui a sua mensagem"
                            maxLength={DESCRIPTION_LENGTH.max}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />
                        {problem && <div className="text-sm text-danger">{problem}</div>}
                        <div className="flex justify-end gap-2">
                            <button type="button" className="btn btn-outline-danger" onClick={clearAndClose}>
                                Cancelar
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={sending}>
                                {sending ? 'Enviando...' : 'Enviar'}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <button type="button" className="btn btn-primary rounded-full shadow-lg" onClick={openTheForm}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="ltr:mr-2 rtl:ml-2">
                        <path
                            d="M21 12c0 4.418-4.03 8-9 8a9.9 9.9 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinejoin="round"
                        />
                    </svg>
                    Fale Conosco
                </button>
            )}
        </div>
    );
};

export default ContactUs;
