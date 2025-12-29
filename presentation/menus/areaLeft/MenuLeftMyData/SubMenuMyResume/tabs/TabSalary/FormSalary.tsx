'use client';

import React from 'react';
import { create } from 'zustand';
import { IntegerFieldComponent } from '@/presentation/components/source/IntegerFieldComponent';

export interface FormSalaryProps {}

export interface IFormSalaryStore {
    pj: number;
    clt: number;
    btc: number;

    setPj: (pj: number) => void;
    setClt: (clt: number) => void;
    setBtc: (btc: number) => void;
}

export const FormSalaryStore = create<IFormSalaryStore>((set) => ({
    pj: 0,
    clt: 0,
    btc: 0,
    setPj: (pj: number) => set({ pj }),
    setClt: (clt: number) => set({ clt }),
    setBtc: (btc: number) => set({ btc }),
}));

export const FormSalary: React.FC<FormSalaryProps> = ({}) => {
    const { pj, clt, btc, setPj, setClt, setBtc} = FormSalaryStore((state: IFormSalaryStore) => ({ ...state }));
    return (
        <div>
            <IntegerFieldComponent
                textFieldLabel="Minha pretensão CLT"
                checkBoxLabel="Não analiso propostas CLT"
                defaultValue={1500}
                setValue={(e) => setClt(e)}
                value={clt}
            />
            <IntegerFieldComponent
                textFieldLabel="Minha pretensão PJ"
                checkBoxLabel="Não analiso propostas PJ"
                defaultValue={2500}
                setValue={(e) => setPj(e)}
                value={pj}
            />
            <IntegerFieldComponent
                textFieldLabel="Minha pretensão em bitcoin (Valor equivalente em reais)"
                checkBoxLabel="Não analiso freelancer em bitcoin"
                defaultValue={1000}
                setValue={(e) => setBtc(e)}
                value={btc}
            />
        </div>
    );
};
