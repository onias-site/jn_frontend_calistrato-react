'use client';
import React, { useEffect } from 'react';
import { ModalLoginStore, IModalLoginStore } from '@/presentation/auth/ModalLogin';
import Select from 'react-select';

export interface RequestAnswersProps {}
export const RequestAnswersClick = 'requestAnswers';

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
