'use client';
import React, { useEffect, useState } from 'react';
import { ConfirmDialog } from 'primereact/confirmdialog';
import 'primereact/resources/themes/lara-light-cyan/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import JnAjax from '@/app/JnAjax';

// os limites do apelido em vis_viewed_resume
const ALIAS_MIN_LENGTH = 5;
const ALIAS_MAX_LENGTH = 200;

type Situation = 'confirming' | 'opening' | 'opened' | 'saved' | 'canceled' | 'invalidLink' | 'notFound' | 'error';

const messages: Record<Exclude<Situation, 'confirming' | 'opened'>, string> = {
    opening: 'Abrindo o currículo...',
    saved: 'Visualização salva. Nos próximos e-mails este currículo aparecerá com o apelido que você deu.',
    canceled: 'O currículo não foi aberto. Para abri-lo, clique de novo no link do e-mail.',
    invalidLink: 'Este link não é válido. Abra o currículo pelo link do e-mail que você recebeu.',
    notFound: 'Este currículo não está mais ativo.',
    error: 'Não foi possível concluir agora. Tente de novo em alguns instantes.',
};

/** Os parâmetros do link do e-mail de currículos: o e-mail do recrutador, o id do currículo e a assinatura do link. */
export const getLinkParameters = () => {
    const parameters = new URLSearchParams(window.location.search);
    return { email: parameters.get('email') || '', resumeId: parameters.get('resume') || '', token: parameters.get('token') || '' };
};

/**
 * A página aberta pelo link "Ver currículo" (ou pelo apelido) do e-mail de currículos. Antes de tudo pede a confirmação
 * de quem clicou: os robôs dos provedores de e-mail clicam em todos os links, e a visualização só conta quando uma
 * pessoa confirma. Confirmada, abre o LinkedIn do currículo numa aba nova (aberta ainda no clique, para o navegador não
 * bloquear) e grava a visualização; esta página fica com o apelido do currículo, que o recrutador pode trocar.
 */
export const ViewResumeFromEmail = () => {
    const [situation, setSituation] = useState<Situation>('confirming');
    const [alias, setAlias] = useState('');
    const [link, setLink] = useState({ email: '', resumeId: '', token: '' });

    useEffect(() => setLink(getLinkParameters()), []);

    const failWith = (newTab: Window | null, failure: Situation) => () => {
        newTab?.close();
        setSituation(failure);
    };

    const openTheResume = () => {
        // a aba nasce no clique da confirmação: aberta depois da resposta, seria barrada como pop-up
        const newTab = window.open('', '_blank');
        setSituation('opening');
        const callbacks: any = {};
        callbacks[200] = (response: any) => {
            if (newTab) {
                newTab.opener = null;
                newTab.location.href = response.linkedinAddress;
            }
            setAlias(response.alias || '');
            setSituation('opened');
        };
        callbacks[401] = failWith(newTab, 'invalidLink');
        callbacks[404] = failWith(newTab, 'notFound');
        callbacks[422] = failWith(newTab, 'invalidLink');
        callbacks['onUnexpectedHttpStatus'] = failWith(newTab, 'error');
        JnAjax.doAnAjaxRequest('recruiter-email-link/view-resume', callbacks, 'POST', link, {}, 'http://localhost:8081');
    };

    const aliasLength = alias.trim().length;
    const validAlias = aliasLength >= ALIAS_MIN_LENGTH && aliasLength <= ALIAS_MAX_LENGTH;

    const saveTheView = () => {
        const callbacks: any = {};
        callbacks[200] = () => setSituation('saved');
        callbacks[401] = () => setSituation('invalidLink');
        callbacks[404] = () => setSituation('notFound');
        callbacks['onUnexpectedHttpStatus'] = () => setSituation('error');
        const body = { ...link, alias: alias.trim() };
        JnAjax.doAnAjaxRequest('recruiter-email-link/alias', callbacks, 'POST', body, {}, 'http://localhost:8081');
    };

    return (
        <div className="panel mx-auto mt-6 max-w-2xl">
            <ConfirmDialog
                visible={situation == 'confirming'}
                onHide={() => setSituation((current) => (current == 'confirming' ? 'canceled' : current))}
                header="Ver currículo"
                message="Deseja abrir este currículo? Ele será aberto numa nova aba, e esta visualização ficará registrada para você."
                icon="pi pi-eye"
                acceptLabel="Sim, abrir"
                rejectLabel="Não"
                accept={openTheResume}
                reject={() => setSituation('canceled')}
            />
            <h5 className="mb-4 text-lg font-semibold">Currículo do e-mail de currículos</h5>
            {situation == 'opened' && (
                <div className="space-y-3">
                    <p>O currículo foi aberto numa nova aba. Dê a ele um apelido que você reconheça nos próximos e-mails (nós não guardamos dados pessoais de forma legível):</p>
                    <input type="text" className="form-input" value={alias} maxLength={ALIAS_MAX_LENGTH} onChange={(event) => setAlias(event.target.value)} />
                    <p className="text-xs text-white-dark">
                        De {ALIAS_MIN_LENGTH} a {ALIAS_MAX_LENGTH} caracteres ({aliasLength} usados).
                    </p>
                    <button type="button" className="btn btn-primary" disabled={!validAlias} onClick={saveTheView}>
                        Salvar visualização
                    </button>
                </div>
            )}
            {situation != 'opened' && situation != 'confirming' && <p>{messages[situation]}</p>}
        </div>
    );
};
