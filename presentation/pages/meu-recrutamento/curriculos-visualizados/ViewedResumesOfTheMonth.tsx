'use client';
import React, { useEffect, useState } from 'react';
// o modal de login (aberto pelo 401) é um Dialog do PrimeReact: sem o tema ele fica transparente sobre a tela
import 'primereact/resources/themes/lara-light-cyan/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import JnAjax from '@/app/JnAjax';
import { MonthPicker, currentMonth, monthParameter } from '@/presentation/components/month-picker/MonthPicker';
import { ViewedResumeDetails } from './ViewedResumeDetails';

type Situation = 'loading' | 'loaded' | 'notLogged' | 'error';

type ViewedResume = { linkedin: string; alias: string; date: string };

const messages: Record<Exclude<Situation, 'loaded'>, string> = {
    loading: 'Carregando os currículos visualizados...',
    notLogged: 'Entre com o seu e-mail de recrutador para ver os currículos que você visualizou.',
    error: 'Não foi possível carregar os currículos visualizados agora. Tente de novo em alguns instantes.',
};

/** A data dd/MM/yyyy HH:mm:ss como número comparável (yyyyMMddHHmmss), para ordenar da visualização mais recente à mais antiga. */
const sortableDate = (date: string) => {
    const [day, time] = (date || '').split(' ');
    const [dd, mm, yyyy] = (day || '').split('/');
    return `${yyyy}${mm}${dd}${(time || '').replace(/:/g, '')}`;
};

/** Cada item da lista vem como texto JSON (linkedin, alias e date); um item ilegível é descartado. */
const parseViews = (texts: string[]): ViewedResume[] =>
    (texts || [])
        .map((text) => {
            try {
                return JSON.parse(text) as ViewedResume;
            } catch (e) {
                return null;
            }
        })
        .filter((view): view is ViewedResume => view != null)
        .sort((a, b) => sortableDate(b.date).localeCompare(sortableDate(a.date)));

/**
 * Os currículos que o recrutador logado visualizou num mês: um por currículo, com o apelido, o LinkedIn e a data da
 * última visualização no mês. O mês é escolhido na tela e começa no mês corrente. A lista é gravada a cada abertura de
 * currículo (e a cada apelido dado) e lida pelo id do grupo do recrutador no mês; por isso exige login, e quem não está
 * logado vê o modal de login, que repete a busca ao entrar. "ver detalhes" expande a linha com o currículo como o
 * e-mail de currículos o mostra; várias linhas podem ficar expandidas ao mesmo tempo.
 */
export const ViewedResumesOfTheMonth = () => {
    const [month, setMonth] = useState(currentMonth());
    const [situation, setSituation] = useState<Situation>('loading');
    const [views, setViews] = useState<ViewedResume[]>([]);
    const [expanded, setExpanded] = useState<string[]>([]);

    const load = (chosenMonth: string) => () => {
        setSituation('loading');
        const callbacks: any = {};
        callbacks[200] = (response: any) => {
            setViews(parseViews(response.viewedResume));
            setExpanded([]);
            setSituation('loaded');
        };
        callbacks[401] = () => {
            // sem login o JnAjax chama o 401 antes de enviar, e não desliga o carregamento que já ligou
            JnAjax.setNotLoading()();
            setSituation('notLogged');
            JnAjax.getHandler401(load(chosenMonth))();
        };
        callbacks['onUnexpectedHttpStatus'] = () => setSituation('error');
        // GET sem corpo: com {} o jQuery poria "?{}" na URL
        JnAjax.doACachedRequest(`recruiter/{email}/viewed-resumes/${monthParameter(chosenMonth)}`, callbacks, 'GET', null as any, {}, 'http://localhost:8081');
    };

    useEffect(load(month), [month]);

    const toggle = (linkedin: string) =>
        setExpanded((current) => (current.includes(linkedin) ? current.filter((item) => item != linkedin) : [...current, linkedin]));

    return (
        <div className="panel mt-6">
            <MonthPicker id="viewedResumesMonth" month={month} onChange={setMonth} />
            {situation != 'loaded' ? (
                <div>{messages[situation]}</div>
            ) : views.length == 0 ? (
                <div>Você não visualizou nenhum currículo neste mês.</div>
            ) : (
                <>
                    <h5 className="mb-4 text-lg font-semibold">
                        {views.length} {views.length == 1 ? 'currículo visualizado' : 'currículos visualizados'} no mês
                    </h5>
                    <div className="table-responsive">
                        <table className="table-hover">
                            <thead>
                                <tr>
                                    <th>Apelido</th>
                                    <th>LinkedIn</th>
                                    <th>Última visualização</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {views.map((view) => {
                                    const open = expanded.includes(view.linkedin);
                                    return (
                                        <React.Fragment key={view.linkedin}>
                                            <tr>
                                                <td>{view.alias}</td>
                                                <td>
                                                    <a href={view.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                                        {view.linkedin}
                                                    </a>
                                                </td>
                                                <td>{view.date}</td>
                                                <td>
                                                    <button type="button" className="flex items-center gap-1 whitespace-nowrap text-primary hover:underline" aria-expanded={open} onClick={() => toggle(view.linkedin)}>
                                                        <i className={open ? 'pi pi-chevron-down' : 'pi pi-chevron-right'} />
                                                        ver detalhes
                                                    </button>
                                                </td>
                                            </tr>
                                            {open && (
                                                <tr>
                                                    <td colSpan={4} className="bg-gray-50 dark:bg-dark-dark-light">
                                                        <ViewedResumeDetails month={month} linkedin={view.linkedin} />
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};
