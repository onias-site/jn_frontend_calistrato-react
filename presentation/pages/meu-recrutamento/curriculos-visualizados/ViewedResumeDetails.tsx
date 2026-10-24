'use client';
import React, { useEffect, useState } from 'react';
import JnAjax from '@/app/JnAjax';
import { monthParameter } from '@/presentation/components/month-picker/MonthPicker';
import { ResumeRowCells, ResumeRowHeaders } from '../ResumeRowCells';

type Situation = 'loading' | 'loaded' | 'notViewed' | 'notLogged' | 'error';

const messages: Record<Exclude<Situation, 'loaded'>, string> = {
    loading: 'Carregando os detalhes do currículo...',
    notViewed: 'Este currículo não está entre os que você visualizou neste mês.',
    notLogged: 'Entre com o seu e-mail de recrutador para ver os detalhes do currículo.',
    error: 'Não foi possível carregar os detalhes do currículo agora. Tente de novo em alguns instantes.',
};

/**
 * Os detalhes de um currículo visualizado no mês, na linha expandida da lista: o currículo como o e-mail de currículos
 * o mostra (o que importa e regiões, idiomas e habilidades, função e outras informações), achado pelo LinkedIn da
 * visualização. As datas de inserção e de última alteração não aparecem: só o histórico do currículo as tem, e ele não
 * é consultado numa requisição online.
 */
export const ViewedResumeDetails = ({ month, linkedin }: { month: string; linkedin: string }) => {
    const [situation, setSituation] = useState<Situation>('loading');
    const [resumes, setResumes] = useState<any[]>([]);

    const load = () => {
        setSituation('loading');
        const callbacks: any = {};
        callbacks[200] = (response: any) => {
            setResumes(response.resumes || []);
            setSituation('loaded');
        };
        callbacks[404] = () => setSituation('notViewed');
        callbacks[401] = () => {
            // sem login o JnAjax chama o 401 antes de enviar, e não desliga o carregamento que já ligou
            JnAjax.setNotLoading()();
            setSituation('notLogged');
            JnAjax.getHandler401(load)();
        };
        callbacks['onUnexpectedHttpStatus'] = () => setSituation('error');
        JnAjax.doACachedRequest(`recruiter/{email}/viewed-resumes/${monthParameter(month)}/details`, callbacks, 'POST', { linkedin }, {}, 'http://localhost:8081');
    };

    useEffect(load, [month, linkedin]);

    if (situation != 'loaded') {
        return <div>{messages[situation]}</div>;
    }

    if (resumes.length == 0) {
        return <div>O currículo deste LinkedIn não está mais ativo.</div>;
    }

    return (
        <div className="table-responsive">
            <table>
                <thead>
                    <tr>
                        <ResumeRowHeaders />
                    </tr>
                </thead>
                <tbody>
                    {resumes.map((resume) => (
                        <tr key={resume.resumeId}>
                            <ResumeRowCells resume={resume} />
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
