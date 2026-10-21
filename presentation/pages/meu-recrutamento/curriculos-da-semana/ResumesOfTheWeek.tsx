'use client';
import React, { useEffect, useState } from 'react';
import JnAjax from '@/app/JnAjax';

// quantas regiões aparecem antes do "+N regiões", como no e-mail (VisBusinessBuildResumeRow.VISIBLE_REGIONS)
const VISIBLE_REGIONS = 3;

type Situation = 'loading' | 'loaded' | 'noEmail' | 'notLogged' | 'error';

const messages: Record<Exclude<Situation, 'loaded'>, string> = {
    loading: 'Carregando os currículos...',
    noEmail: 'Não há e-mail de currículos seu do último dia. A lista completa fica disponível por um dia após cada e-mail.',
    notLogged: 'Entre com o e-mail em que você recebe os currículos para ver a lista completa.',
    error: 'Não foi possível carregar os currículos agora. Tente de novo em alguns instantes.',
};

const Lines = ({ lines }: { lines: string[] }) => (
    <>
        {(lines || []).map((line, index) => (
            <div key={index}>{line}</div>
        ))}
    </>
);

/** As regiões: as três primeiras à vista, as demais atrás de "+N regiões". */
const Regions = ({ regions }: { regions: string[] }) => {
    const visible = (regions || []).slice(0, VISIBLE_REGIONS);
    const folded = (regions || []).slice(VISIBLE_REGIONS);
    return (
        <>
            <Lines lines={visible} />
            {folded.length > 0 && (
                <details>
                    <summary className="cursor-pointer text-primary">+{folded.length} regiões</summary>
                    <Lines lines={folded} />
                </details>
            )}
        </>
    );
};

/**
 * A tela "Ver todos" do e-mail de currículos: todos os currículos do último e-mail do recrutador logado, na ordem e com
 * os textos do e-mail (que mostra só os 40 primeiros). A lista foi gravada antes do envio e é lida pelo id, o e-mail do
 * recrutador; por isso exige login, e quem não está logado vê o modal de login, que repete a busca ao entrar.
 */
export const ResumesOfTheWeek = () => {
    const [situation, setSituation] = useState<Situation>('loading');
    const [resumes, setResumes] = useState<any[]>([]);
    const [email, setEmail] = useState('');

    const load = () => {
        setSituation('loading');
        const callbacks: any = {};
        callbacks[200] = (response: any) => {
            setResumes(response.resumes || []);
            setEmail((JnAjax.getLogin() as any).email || '');
            setSituation('loaded');
        };
        callbacks[404] = () => setSituation('noEmail');
        callbacks[401] = () => {
            // sem login o JnAjax chama o 401 antes de enviar, e não desliga o carregamento que já ligou
            JnAjax.setNotLoading()();
            setSituation('notLogged');
            JnAjax.getHandler401(load)();
        };
        callbacks['onUnexpectedHttpStatus'] = () => setSituation('error');
        // GET sem corpo: com {} o jQuery poria "?{}" na URL
        JnAjax.doAnAjaxRequest('recruiter/{email}/resumes-of-the-week', callbacks, 'GET', null as any, {}, 'http://localhost:8081');
    };

    useEffect(load, []);

    const viewLink = (resume: any) =>
        `/recrutador/ver-curriculo?email=${encodeURIComponent(email)}&resume=${encodeURIComponent(resume.resumeId)}&token=${encodeURIComponent(resume.token)}`;

    if (situation != 'loaded') {
        return <div className="panel mt-6">{messages[situation]}</div>;
    }

    return (
        <div className="panel mt-6">
            <h5 className="mb-4 text-lg font-semibold">{resumes.length} currículos inseridos ou alterados nos últimos 7 dias</h5>
            <div className="table-responsive">
                <table className="table-hover">
                    <thead>
                        <tr>
                            <th>O que importa</th>
                            <th>Idiomas e habilidades</th>
                            <th>Função / papel / emprego / ocupação</th>
                            <th>Outras Informações</th>
                            <th>Datas e visualização</th>
                        </tr>
                    </thead>
                    <tbody>
                        {resumes.map((resume) => (
                            <tr key={resume.resumeId}>
                                <td className="align-top">
                                    <Lines lines={resume.whatMatters} />
                                    <Regions regions={resume.regions} />
                                </td>
                                <td className="align-top">
                                    <Lines lines={resume.languagesAndSkills} />
                                </td>
                                <td className="align-top">
                                    <Lines lines={resume.job} />
                                </td>
                                <td className="align-top">
                                    <Lines lines={resume.otherInformation} />
                                </td>
                                <td className="align-top">
                                    <div className={resume.viewed ? '' : 'font-semibold text-danger'}>{resume.lastView}</div>
                                    <a href={viewLink(resume)} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                        {resume.viewLabel}
                                    </a>
                                    <div>{resume.insertion}</div>
                                    <div>{resume.lastChange}</div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
