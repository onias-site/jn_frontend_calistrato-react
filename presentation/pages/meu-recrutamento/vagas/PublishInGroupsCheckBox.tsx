'use client';

import React, { useEffect, useRef, useState } from 'react';
import JnAjax from '@/app/JnAjax';
import { CheckBoxComponent } from '@/presentation/components/source/CheckBoxComponent';
import { Modal } from '@/presentation/components/source/Modal';

const API = 'http://localhost:8081';

const DEBOUNCE_MILLISECONDS = 400;

const LABEL = 'Permitir que esta vaga seja divulgada diariamente nos seguintes grupos de vagas:';

type Situation = 'incomplete' | 'loading' | 'loaded' | 'error';

type Group = { title: string; link: string };

export interface PublishInGroupsCheckBoxProps {
    value: boolean;
    setValue: (value: boolean) => void;
    // o que escolhe os grupos: a área, as senioridades e as regiões (ddds, com o 10 de home office) da vaga
    resumeType: string;
    seniority: string[];
    ddd: string[];
}

/** O corpo do POST positions/instant-message-groups, ou null enquanto falta área, senioridade ou região. */
export const instantMessageGroupsRequestOf = (resumeType: string, seniority: string[], ddd: string[]) => {
    if (!resumeType || !seniority.length || !ddd.length) return null;
    return { resumeType: Number(resumeType), seniority, ddd: ddd.map(Number) };
};

/**
 * O checkbox "divulgar a vaga nos grupos" da aba Opções (desde 2026-11-23): o rótulo termina num link com o total de grupos
 * de mensagem instantânea, que abre um modal com a lista deles. Os grupos vêm do POST positions/instant-message-groups com a
 * área, as senioridades e as regiões da vaga: pedidos ao abrir o modal e a cada mudança desses campos (para o total do
 * rótulo).
 */
export const PublishInGroupsCheckBox: React.FC<PublishInGroupsCheckBoxProps> = ({ value, setValue, resumeType, seniority, ddd }) => {
    const [groups, setGroups] = useState<Group[]>([]);
    const [situation, setSituation] = useState<Situation>('incomplete');
    const [opened, setOpened] = useState(false);
    const request = instantMessageGroupsRequestOf(resumeType, seniority, ddd);
    const requestKey = JSON.stringify(request);

    // o número do último pedido: uma resposta atrasada de um pedido anterior é descartada
    const lastRequest = useRef(0);

    const load = () => {
        const requestNumber = ++lastRequest.current;
        if (!request) {
            setGroups([]);
            setSituation('incomplete');
            return;
        }
        setSituation('loading');
        const isLast = () => requestNumber == lastRequest.current;
        const callbacks: any = {};
        // o carregamento fica no próprio modal, não na tela inteira
        callbacks['setLoading'] = () => {};
        callbacks['setNotLoading'] = () => {};
        // rota pública: quem ainda não fez login também vê os grupos (o login só é pedido ao salvar a vaga)
        callbacks['withoutSession'] = true;
        callbacks[200] = (response: any) => {
            if (!isLast()) return;
            setGroups(response.groups || []);
            setSituation('loaded');
        };
        const failure = () => isLast() && setSituation('error');
        callbacks[422] = failure;
        callbacks['onUnexpectedHttpStatus'] = failure;
        JnAjax.doAnAjaxRequest('positions/instant-message-groups', callbacks, 'POST', request, {}, API);
    };

    // o total do rótulo acompanha a área, as senioridades e as regiões, com uma espera curta entre uma mudança e outra
    useEffect(() => {
        const timer = setTimeout(load, DEBOUNCE_MILLISECONDS);
        return () => clearTimeout(timer);
    }, [requestKey]);

    // o link fica dentro do <label> do checkbox: sem isto o clique nele também marcaria ou desmarcaria a caixa
    const openGroups = (event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        setOpened(true);
        load();
    };

    const totalGroups = situation == 'loaded' ? `${groups.length} ` : '';
    const labelContent = (
        <span>
            {LABEL}{' '}
            <a href="#" onClick={openGroups} className="text-primary underline hover:no-underline">
                {`${totalGroups}Grupos de mensagem instantânea`}
            </a>
        </span>
    );

    return (
        <>
            <CheckBoxComponent
                explanation="Caso esta opção estiver marcada, a vaga será divulgada uma vez por dia nos grupos de vagas listados no link, escolhidos pela área, pelas senioridades e pelas regiões da vaga."
                checkBoxLabel={LABEL}
                labelContent={labelContent}
                setValue={setValue}
                value={value}
            />
            <Modal title="Grupos de vagas" visible={opened} setVisible={setOpened} size="md" zIndex={210}>
                {situation == 'incomplete' && <div>Escolha a área, ao menos uma senioridade e ao menos uma região da vaga para ver os grupos em que ela será divulgada.</div>}
                {situation == 'loading' && <div>Carregando os grupos...</div>}
                {situation == 'error' && <div>Não foi possível carregar os grupos agora. Tente de novo em alguns instantes.</div>}
                {situation == 'loaded' && !groups.length && <div>Ainda não há grupos de vagas para a área, as senioridades e as regiões desta vaga.</div>}
                {situation == 'loaded' && !!groups.length && (
                    <ol className="max-h-96 list-decimal space-y-1.5 overflow-y-auto pl-5">
                        {groups.map((group) => (
                            <li key={group.link}>
                                <a href={group.link} target="_blank" rel="noopener noreferrer" className="break-all text-primary hover:underline">
                                    {group.title}
                                </a>
                            </li>
                        ))}
                    </ol>
                )}
            </Modal>
        </>
    );
};
