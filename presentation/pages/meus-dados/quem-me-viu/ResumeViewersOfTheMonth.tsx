'use client';
import React, { useEffect, useState } from 'react';
import JnAjax from '@/app/JnAjax';
import { NotLoggedMessage } from '@/presentation/components/not-logged/NotLoggedMessage';
import { MonthPicker, currentMonth, monthParameter } from '@/presentation/components/month-picker/MonthPicker';
import { Modal } from '@/presentation/components/source/Modal';
import { notify } from '@/presentation/components/source/notify';
import IconCopy from '@/presentation/icons/icon-copy';

// o bot dos usuários de produção: o comando /receberMensagens liga o chat ao e-mail e passa a receber cada visualização nova
const USER_BOT_NAME = 'onias_site_user_prd_bot';
const USER_BOT_LINK = `https://t.me/${USER_BOT_NAME}`;

type Situation = 'loading' | 'loaded' | 'notLogged' | 'error';

type Viewer = { domain: string; views: number };

const messages: Record<Exclude<Situation, 'loaded' | 'notLogged'>, string> = {
    loading: 'Carregando quem viu o seu currículo...',
    error: 'Não foi possível carregar quem viu o seu currículo agora. Tente de novo em alguns instantes.',
};

/**
 * Quem viu o currículo do candidato logado num mês: o domínio do e-mail de cada recrutador que abriu o currículo pela
 * primeira vez naquele mês ("Nome da consultoria") e quantos recrutadores do domínio o fizeram ("Visualizações"), do
 * mais visto ao menos. O mês é escolhido na tela e começa no mês corrente (até 2026-11-11, no anterior). A contagem é lida pelo id do currículo no mês;
 * por isso exige login: quem não está logado vê a faixa com o link que abre o modal de login (desde 2026-11-23; antes o
 * modal abria sozinho), e a busca é repetida ao entrar.
 */
export const ResumeViewersOfTheMonth = () => {
    const [month, setMonth] = useState(currentMonth());
    const [situation, setSituation] = useState<Situation>('loading');
    const [viewers, setViewers] = useState<Viewer[]>([]);
    const [howToVisible, setHowToVisible] = useState(false);
    // o e-mail é lido ao abrir o modal: quem entra pelo modal de login já aparece com o e-mail certo
    const loggedEmail: string = howToVisible ? (JnAjax.getLogin() as any).email || '' : '';
    const botCommand = `/receberMensagens ${loggedEmail}`;
    const copy = (text: string, summary: string, detail: string) => () => {
        const copied = () => notify({ summary, detail, life: 4000 });
        const failed = () => notify({ summary: 'Não foi possível copiar', detail: 'Selecione o texto e copie-o manualmente.', severity: 'warn' });
        // o clipboard só existe em contexto seguro (https ou localhost)
        if (!navigator.clipboard) return failed();
        navigator.clipboard.writeText(text).then(copied, failed);
    };
    const copyBotName = copy(USER_BOT_NAME, 'Nome do bot copiado', 'Cole-o na busca do Telegram.');
    const copyBotCommand = copy(botCommand, 'Comando copiado', 'Cole-o na conversa com o bot no Telegram.');

    const load = (chosenMonth: string) => () => {
        setSituation('loading');
        const callbacks: any = {};
        callbacks[200] = (response: any) => {
            setViewers(response.viewers || []);
            setSituation('loaded');
        };
        callbacks[401] = () => {
            // sem login o JnAjax chama o 401 antes de enviar, e não desliga o carregamento que já ligou
            JnAjax.setNotLoading()();
            setSituation('notLogged');
        };
        callbacks['onUnexpectedHttpStatus'] = () => setSituation('error');
        // GET sem corpo: com {} o jQuery poria "?{}" na URL
        JnAjax.doACachedRequest(`resume/{email}/viewers/${monthParameter(chosenMonth)}`, callbacks, 'GET', null as any, {}, 'http://localhost:8081');
    };

    useEffect(load(month), [month]);

    const totalViews = viewers.reduce((total, viewer) => total + viewer.views, 0);

    return (
        <div className="panel mt-6">
            <button type="button" className="mb-4 text-primary underline hover:no-underline" onClick={() => setHowToVisible(true)}>
                Receber notificações instantâneas de nova visualização no celular
            </button>
            <Modal visible={howToVisible} setVisible={setHowToVisible} title="Como fazer?">
                <ol className="list-none space-y-2">
                    <li>
                        <span>
                            1) Clique no bot{' '}
                            <a href={USER_BOT_LINK} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                                {USER_BOT_LINK}
                            </a>{' '}
                            (ou abra o telegram e procure o bot {USER_BOT_NAME})
                        </span>
                        <button type="button" className="btn btn-outline-dark btn-sm ml-2 inline-flex gap-2 align-middle" onClick={copyBotName}>
                            <IconCopy className="h-4 w-4" />
                            Copiar nome do bot
                        </button>
                    </li>
                    <li>
                        <span>
                            2) Execute o comando <code className="break-all">{botCommand}</code>
                        </span>
                        <button type="button" className="btn btn-outline-dark btn-sm ml-2 inline-flex gap-2 align-middle" onClick={copyBotCommand}>
                            <IconCopy className="h-4 w-4" />
                            Copiar comando
                        </button>
                    </li>
                </ol>
            </Modal>
            <MonthPicker id="resumeViewersMonth" month={month} onChange={setMonth} />
            {situation == 'notLogged' ? (
                <NotLoggedMessage before="Você não está logado! Caso tenha cadastrado currículo conosco," after="para ver quem viu o seu currículo." onLoggedIn={load(month)} />
            ) : situation != 'loaded' ? (
                <div>{messages[situation]}</div>
            ) : viewers.length == 0 ? (
                <div>Nenhum recrutador viu o seu currículo neste mês.</div>
            ) : (
                <>
                    <h5 className="mb-4 text-lg font-semibold">
                        {totalViews} {totalViews == 1 ? 'visualização' : 'visualizações'} no mês
                    </h5>
                    <div className="table-responsive">
                        <table className="table-hover">
                            <thead>
                                <tr>
                                    <th>Nome da consultoria</th>
                                    <th>Visualizações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {viewers.map((viewer) => (
                                    <tr key={viewer.domain}>
                                        <td>{viewer.domain}</td>
                                        <td>{viewer.views}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};
