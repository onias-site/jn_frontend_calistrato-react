'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import JnAjax from '@/app/JnAjax';
import { ModalLoginStore } from '@/presentation/auth/ModalLogin';
import { MonthPicker, currentMonth, monthParameter } from '@/presentation/components/month-picker/MonthPicker';
import { Modal } from '@/presentation/components/source/Modal';

// o bot dos usuários de produção: o comando /receberMensagens liga o chat ao e-mail e passa a receber cada visualização nova
const USER_BOT_LINK = 'https://t.me/onias_site_prd_bot';

type Situation = 'loading' | 'loaded' | 'notLogged' | 'error';

type Viewer = { domain: string; views: number };

const messages: Record<Exclude<Situation, 'loaded'>, string> = {
    loading: 'Carregando quem viu o seu currículo...',
    notLogged: 'Entre com o seu e-mail para ver quem viu o seu currículo.',
    error: 'Não foi possível carregar quem viu o seu currículo agora. Tente de novo em alguns instantes.',
};

/**
 * Quem viu o currículo do candidato logado num mês: o domínio do e-mail de cada recrutador que abriu o currículo pela
 * primeira vez naquele mês ("Nome da consultoria") e quantos recrutadores do domínio o fizeram ("Visualizações"), do
 * mais visto ao menos. O mês é escolhido na tela e começa no mês corrente (até 2026-11-11, no anterior). A contagem é lida pelo id do currículo no mês;
 * por isso exige login, e quem não está logado vê o modal de login, que repete a busca ao entrar.
 */
export const ResumeViewersOfTheMonth = () => {
    const [month, setMonth] = useState(currentMonth());
    const [situation, setSituation] = useState<Situation>('loading');
    const [viewers, setViewers] = useState<Viewer[]>([]);
    const [howToVisible, setHowToVisible] = useState(false);
    const router = useRouter();
    // o e-mail é lido ao abrir o modal: quem entra pelo modal de login já aparece com o e-mail certo
    const loggedEmail: string = howToVisible ? (JnAjax.getLogin() as any).email || '' : '';

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
            // fechar o modal sem entrar leva à tela inicial: aqui ficaria só uma tela vazia
            ModalLoginStore.getState().setDismissAction(() => router.push('/'));
            JnAjax.getHandler401(load(chosenMonth))();
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
                <p>
                    Clique no bot{' '}
                    <a href={USER_BOT_LINK} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                        {USER_BOT_LINK}
                    </a>{' '}
                    e então execute o comando <code className="break-all">/receberMensagens {loggedEmail}</code>
                </p>
            </Modal>
            <MonthPicker id="resumeViewersMonth" month={month} onChange={setMonth} />
            {situation != 'loaded' ? (
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
