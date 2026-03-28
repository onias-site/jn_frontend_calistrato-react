'use client';
import JnAjax from '@/app/JnAjax';
import React, { useEffect } from 'react';
import { ModalLoginStore, IModalLoginStore } from '@/presentation/auth/ModalLogin';
import Select from 'react-select';

export interface RequestAnswersProps {}
export const RequestAnswersClick = (setError: any, showModal: any, callbacks: any, email: string, context: any) => {
    const openModal = (selectedScreen: string) => showModal(selectedScreen, '');
    callbacks['202'] = () => openModal('SavePassword');
    callbacks['404'] = () => showModal('RequestEmail', '', null, 'O seu login não foi encontrado, por favor, informe um e-mail');
    JnAjax.doAnAjaxRequest(`login/${email}/pre-registration`, callbacks, 'POST', context, {}, 'http://localhost:8080');
};

export const RequestAnswers: React.FC<RequestAnswersProps> = ({}) => {
    const { context, setContextField } = ModalLoginStore((state: IModalLoginStore) => ({
        ...state,
    }));
    const channels = [
        { value: 'linkedin', label: 'Por alguém ou por anúncio no linkedin' },
        { value: 'telegram', label: 'Grupos de vagas no telegram' },
        { value: 'friends', label: 'Indicação de amigos' },
        { value: 'others', label: 'outros' },
    ];

    const goals = [
        { value: 'jobs', label: 'Salários e Empregos' },
        { value: 'recruiting', label: 'Ver currículos' },
    ];

    useEffect(() => {
        setContextField('goal', goals[0].value);
        setContextField('channel', channels[0].value);
    }, []);

    const hadleChannel = (newValue: { value: string; label: string } | null) => newValue && setContextField('channel', newValue.value);

    const handleGoal = (newValue: { value: string; label: string } | null) => newValue && setContextField('goal', newValue.value);

    return (
        <div className="relative">
            <h5>Como você nos conheceu?</h5>
            <div className="mb-5 pb-2">
                <Select defaultValue={context.channel || channels[0]} options={channels} isSearchable={false} onChange={hadleChannel} />
            </div>
            <h5>Qual seu objetivo?</h5>
            <div className="mb-12">
                <Select defaultValue={context.goal || goals[0]} options={goals} isSearchable={false} onChange={handleGoal} />
            </div>
        </div>
    );
};
