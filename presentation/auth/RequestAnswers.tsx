'use client';
import JnAjax from '@/app/JnAjax';
import React, { useEffect } from 'react';
import { ModalLoginStore, IModalLoginStore } from '@/presentation/auth/ModalLogin';
import Select from 'react-select';

export interface RequestAnswersProps {}
export const RequestAnswersClick = (setError: any, showModal: any, callbacks: any, email: string, context: any) => {
    alert(JSON.stringify(context));

    // const openModal = (selectedScreen: string) => showModal(selectedScreen, '');

    // return () => {
    //     setError('');
    //     callbacks['201'] = () => openModal('RequestAnswers');
    //     callbacks['404'] = () => openModal('ConfirmEmail');

    //     JnAjax.doAnAjaxRequest(`login/${email}/token`, callbacks, 'HEAD', {}, {}, 'http://localhost:8080');
    // };
};

export const RequestAnswers: React.FC<RequestAnswersProps> = ({}) => {
    const { context, setContextField } = ModalLoginStore((state: IModalLoginStore) => ({
        ...state,
    }));
    const comoNosConheceu = [
        { value: 'linkedin', label: 'Por alguém ou por anúncio no linkedin' },
        { value: 'telegram', label: 'Grupos de vagas no telegram' },
        { value: 'friends', label: 'Indicação de amigos' },
        { value: 'others', label: 'outros' },
    ];

    const qualObjetivo = [
        { value: 'jobs', label: 'Salários e Empregos' },
        { value: 'recruiting', label: 'Ver currículos' },
    ];

    useEffect(() => {
        setContextField('goal', qualObjetivo[0].value);
        setContextField('channel', comoNosConheceu[0].value);
    }, []);

    const handleComoNosConheceuChange = (newValue: { value: string; label: string } | null) => newValue && setContextField('channel', newValue.value);

    const handleQualObjetivoChange = (newValue: { value: string; label: string } | null) => newValue && setContextField('goal', newValue.value);

    return (
        <div className="relative">
            <h5>Como você nos conheceu?</h5>
            <div className="mb-5 pb-2">
                <Select defaultValue={context.channel || comoNosConheceu[0]} options={comoNosConheceu} isSearchable={false} onChange={handleComoNosConheceuChange} />
            </div>
            <h5>Qual seu objetivo?</h5>
            <div className="mb-12">
                <Select defaultValue={context.goal || qualObjetivo[0]} options={qualObjetivo} isSearchable={false} onChange={handleQualObjetivoChange} />
            </div>
        </div>
    );
};
