'use client';
import React, { useEffect, useState } from 'react';
import { ConfirmDialog } from 'primereact/confirmdialog';
import 'primereact/resources/themes/lara-light-cyan/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import JnAjax from '@/app/JnAjax';
import { getLinkParameters } from '@/presentation/pages/recrutador/ViewResumeFromEmail';

type Situation = 'confirming' | 'sending' | 'unsubscribed' | 'canceled' | 'invalidLink' | 'error';

const messages: Record<Exclude<Situation, 'confirming'>, string> = {
    sending: 'Descadastrando...',
    unsubscribed: 'Pronto: você não receberá mais o e-mail de currículos.',
    canceled: 'Nada mudou: você continuará recebendo o e-mail de currículos.',
    invalidLink: 'Este link não é válido. Use o link do e-mail que você recebeu.',
    error: 'Não foi possível concluir agora. Tente de novo em alguns instantes.',
};

/**
 * A página aberta pelo "clique aqui" da pergunta sobre não receber mais o e-mail de currículos. Pede a confirmação antes
 * de descadastrar (os robôs dos provedores de e-mail clicam em todos os links); confirmada, o recrutador passa aos
 * recrutadores inativos.
 */
export const UnsubscribeFromResumesEmail = () => {
    const [situation, setSituation] = useState<Situation>('confirming');
    const [link, setLink] = useState({ email: '', token: '' });

    useEffect(() => {
        const { email, token } = getLinkParameters();
        setLink({ email, token });
    }, []);

    const unsubscribe = () => {
        setSituation('sending');
        const callbacks: any = {};
        callbacks[200] = () => setSituation('unsubscribed');
        callbacks[401] = () => setSituation('invalidLink');
        callbacks[422] = () => setSituation('invalidLink');
        callbacks['onUnexpectedHttpStatus'] = () => setSituation('error');
        JnAjax.doAnAjaxRequest('recruiter-email-link/unsubscribe', callbacks, 'POST', link, {}, 'http://localhost:8081');
    };

    return (
        <div className="panel mx-auto mt-6 max-w-2xl">
            <ConfirmDialog
                visible={situation == 'confirming'}
                onHide={() => setSituation((current) => (current == 'confirming' ? 'canceled' : current))}
                header="Não receber mais o e-mail de currículos"
                message={`Deseja mesmo deixar de receber o e-mail de currículos em ${link.email}?`}
                icon="pi pi-exclamation-triangle"
                acceptLabel="Sim, descadastrar"
                rejectLabel="Não"
                accept={unsubscribe}
                reject={() => setSituation('canceled')}
            />
            <h5 className="mb-4 text-lg font-semibold">E-mail de currículos</h5>
            {situation != 'confirming' && <p>{messages[situation]}</p>}
        </div>
    );
};
