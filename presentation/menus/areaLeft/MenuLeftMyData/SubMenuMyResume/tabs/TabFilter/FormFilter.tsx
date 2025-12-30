'use client';

import React from 'react';
import { create } from 'zustand';
import { Checkbox } from 'primereact/checkbox';
import RegioesComponent from './RegioesComponent';
import { IntegerFieldComponent } from '@/presentation/components/source/IntegerFieldComponent';

export interface FormFilterProps {}

export interface IFormFilterStore {
    negotiableClaim: boolean;
    disponibility: number;
    experience: number;
    pcd: boolean;

    setNegotiableClaim: (negotiableClaim: boolean) => void;
    setDisponibility: (disponibility: number) => void;
    setExperience: (experience: number) => void;
    setPcd: (pcd: boolean) => void;
}

export const FormFilterStore = create<IFormFilterStore>((set) => ({
    negotiableClaim: true,
    disponibility: 0,
    experience: 0,
    pcd: false,
    setPcd: (pcd: boolean) => set({ pcd }),
    setExperience: (experience: number) => set({ experience }),
    setDisponibility: (disponibility: number) => set({ disponibility }),
    setNegotiableClaim: (negotiableClaim: boolean) => set({ negotiableClaim }),
}));

export const FormFilterComponent: React.FC<FormFilterProps> = ({}) => {
    const { negotiableClaim, disponibility, experience, pcd, setPcd, setExperience, setDisponibility, setNegotiableClaim } = FormFilterStore((state: IFormFilterStore) => ({ ...state }));
    return (
        <div>
            <RegioesComponent />
            <IntegerFieldComponent
                textFieldLabel="Anos de experiência"
                checkBoxLabel="Estou pleiteando minha primeira oportunidade na área"
                defaultValue={1}
                setValue={(e) => setExperience(e)}
                value={experience}
            />
            <IntegerFieldComponent
                textFieldLabel="Dias necessários para engajar em um novo emprego"
                checkBoxLabel="Tenho disponibilidade imediata"
                defaultValue={7}
                setValue={(e) => setDisponibility(e)}
                value={disponibility}
            />
            <div className="flex flex-row gap-8">
                <div className="mb-5 text-center">
                    <div className="align-items-center flex">
                        <Checkbox checked={negotiableClaim} onChange={(e) => setNegotiableClaim(e.checked)} />
                        <label htmlFor="ingredient3" className="letraPequena ml-2">
                            Negocio minhas pretensões salariais
                        </label>
                    </div>
                </div>
                <div className="mb-5 text-center">&nbsp;</div>
                <div className="mb-5 text-center">&nbsp;</div>

                <div className="mb-5 text-center">
                    <div className="align-items-center flex">
                        <Checkbox checked={pcd} onChange={(e) => setPcd(e.checked)} />
                        <label htmlFor="ingredient3" className="letraPequena">
                            Possuo necessidades especiais (PCD)
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};
