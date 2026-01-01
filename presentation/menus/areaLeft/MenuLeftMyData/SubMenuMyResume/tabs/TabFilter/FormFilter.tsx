'use client';

import React from 'react';
import { create } from 'zustand';
import RegioesComponent from './RegioesComponent';
import { IntegerFieldComponent } from '@/presentation/components/source/IntegerFieldComponent';
import { CheckBoxComponent } from '@/presentation/components/source/CheckBoxComponent';

export interface TabOptionsProps {}

export interface ITabOptionsStore {
    temporallyJobTime: number;
    disponibility: number;
    experience: number;
    travel: boolean;
    pcd: boolean;

    setTemporallyJobTime: (temporallyJobTime: number) => void;
    setDisponibility: (disponibility: number) => void;
    setExperience: (experience: number) => void;
    setTravel: (travel: boolean) => void;
    setPcd: (pcd: boolean) => void;
}

export const TabOptionsStore = create<ITabOptionsStore>((set) => ({
    temporallyJobTime: 0,
    disponibility: 0,
    experience: 0,
    travel: false,
    pcd: false,
    setPcd: (pcd: any) => set({ pcd }),
    setTravel: (travel: any) => set({ travel }),
    setExperience: (experience: number) => set({ experience }),
    setDisponibility: (disponibility: number) => set({ disponibility }),
    setTemporallyJobTime: (temporallyJobTime: number) => set({ temporallyJobTime }),
}));

export const TabOptions: React.FC<TabOptionsProps> = ({}) => {
    const { travel, temporallyJobTime, disponibility, experience, pcd, setTravel, setPcd, setExperience, setDisponibility, setTemporallyJobTime } = TabOptionsStore((state: ITabOptionsStore) => ({
        ...state,
    }));
    return (
        <div>
            <RegioesComponent
                labelOutrasRegioes="Aceito trabalhar presencialmente ou de forma 'híbrida' na região de"
                labelHomeOffice="Aceito somente vagas homeoffice"
                labelTodasAsRegioes="Aceito trabalhar presencialmente ou de forma 'híbrida' em qualquer estado / cidade"
            />
            <IntegerFieldComponent
                explanation="Caso esta opção estiver marcada, seu perfil ficará limitado apenas às vagas de estágio / trainee. caso esta opção não estiver marcada, você deverá informar no campo de texto que será mostrado, quantos anos de experiência comprovada você tem na area de atuação onde está buscando oportunidade"
                textFieldLabel="Anos de experiência"
                maxValue={70}
                checkBoxLabel="Estou pleiteando meu primeiro emprego nesta área"
                defaultValue={1}
                setValue={setExperience}
                value={experience}
            />
            <IntegerFieldComponent
                explanation="Caso esta opção estiver marcada, seu perfil estará à disposição de todas as vagas onde o recrutador tem urgência em contratar. Caso esta opção não estiver marcada, você deverá informar no campo de texto que será mostrado, de quantos dias você precisará para sair do seu emprego atual para a nova oportunidade, caso o seu perfil  for aprovado para alguma oportunidade."
                textFieldLabel="Dias necessários para engajar em um novo emprego"
                maxValue={30}
                checkBoxLabel="Tenho disponibilidade imediata para engajar em um novo emprego"
                defaultValue={7}
                setValue={setDisponibility}
                value={disponibility}
            />
            <IntegerFieldComponent
                maxValue={12}
                explanation="Caso esta opção estiver marcada, seu perfil ficará limitado apenas às vagas de prazo indeterminado (Contratos ou intenções de empregabilidade superiores a 12 meses). Caso esta opção não estiver marcada, você deverá informar no campo de texto que será mostrado, de quantos meses no mínimo, uma oportunidade de emprego te é interessante."
                textFieldLabel="Total mínimo de duração (em meses) do emprego temporário que eu aceitaria"
                checkBoxLabel="Não aceito empregos temporários"
                setValue={setTemporallyJobTime}
                defaultValue={1}
                value={temporallyJobTime}
            />
            <div className="flex flex-row gap-8">
                <CheckBoxComponent
                    explanation="Caso esta opção estiver marcada, seu perfil estará à disposição de todos os recrutadores que tiverem vagas que buscam por perfis de pessoas com deficiência (PCD)."
                    checkBoxLabel="Possuo necessidades especiais (PCD)"
                    setValue={setPcd}
                    value={pcd}
                />
                <CheckBoxComponent
                    explanation="Caso esta opção estiver marcada, seu perfil estará à disposição de todos os recrutadores que tiverem vagas que buscam por perfis de pessoas que estão disponíveis para viagens nacionais ou internacionais."
                    checkBoxLabel="Tenho disponibilidade para viagens nacionais ou internacionais"
                    setValue={setTravel}
                    value={travel}
                />
            </div>
        </div>
    );
};
