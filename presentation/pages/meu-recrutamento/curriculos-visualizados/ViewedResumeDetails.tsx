'use client';
import React, { useEffect, useState } from 'react';
import JnAjax from '@/app/JnAjax';
import { monthParameter } from '@/presentation/components/month-picker/MonthPicker';
import { ResumePreview, previewDataFromSavedResume } from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/ResumePreview';

type Situation = 'loading' | 'loaded' | 'notViewed' | 'notLogged' | 'error';

const messages: Record<Exclude<Situation, 'loaded'>, string> = {
    loading: 'Carregando os detalhes do currículo...',
    notViewed: 'Este currículo não está entre os que você visualizou neste mês.',
    notLogged: 'Entre com o seu e-mail de recrutador para ver os detalhes do currículo.',
    error: 'Não foi possível carregar os detalhes do currículo agora. Tente de novo em alguns instantes.',
};

/**
 * Os detalhes de um currículo visualizado no mês, no modal da lista: o currículo como a prévia do currículo do candidato
 * o mostra (a mesma tela de "meus-dados/sobre-mim/previa"), sem as empresas que não recebem o LinkedIn nem o texto do
 * currículo, achado pelo hash do LinkedIn da visualização. Desde 2026-11-14 o back end manda, em cada linha, os campos
 * da prévia em {@code preview}; até então a linha expandida mostrava o currículo como o e-mail de currículos. Se o
 * candidato bloqueou a empresa do recrutador, o back end não devolve o currículo nem o LinkedIn.
 */
export const ViewedResumeDetails = ({ month, linkedinHash }: { month: string; linkedinHash: string }) => {
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
        JnAjax.doACachedRequest(`recruiter/{email}/viewed-resumes/${monthParameter(month)}/details`, callbacks, 'POST', { linkedinHash }, {}, 'http://localhost:8081');
    };

    useEffect(load, [month, linkedinHash]);

    if (situation != 'loaded') {
        return <div>{messages[situation]}</div>;
    }

    if (resumes.length == 0) {
        return <div>O currículo deste LinkedIn não está mais ativo.</div>;
    }

    // normalmente um; mais de um quando o LinkedIn está no currículo de mais de um e-mail
    return (
        <div className="flex flex-col gap-8">
            {resumes.map((resume) => (
                <ResumePreview key={resume.resumeId} data={previewDataFromSavedResume(resume.preview || {})} />
            ))}
        </div>
    );
};
