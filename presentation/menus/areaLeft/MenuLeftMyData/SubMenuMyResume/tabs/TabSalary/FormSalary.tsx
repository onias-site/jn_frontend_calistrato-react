'use client';

import React, { useState } from 'react';
import { create } from 'zustand';
import { IntegerFieldComponent } from '@/presentation/components/source/IntegerFieldComponent';
import { CheckBoxComponent } from '@/presentation/components/source/CheckBoxComponent';

export interface TabSalaryProps {}

export interface ITabSalaryStore {
    pj: number;
    clt: number;
    btc: number;
    negotiableClaim: boolean;

    setPj: (pj: number) => void;
    setClt: (clt: number) => void;
    setBtc: (btc: number) => void;
    onMoveOnFowardTabs: () => string[];
    getPendingRequirements: () => string[];
    setNegotiableClaim: (negotiableClaim: boolean) => void;
    loadFromSavedResume: (resume: any) => void;
}

export const TabSalaryStore = create<ITabSalaryStore>((set, get) => ({
    pj: 0,
    clt: 0,
    btc: 0,
    negotiableClaim: true,
    setPj: (pj: number) => set({ pj }),
    setClt: (clt: number) => set({ clt }),
    setBtc: (btc: number) => set({ btc }),
    setNegotiableClaim: (negotiableClaim: boolean) => set({ negotiableClaim }),
    // a pretensão que não foi gravada é a que o candidato não aceita (0)
    loadFromSavedResume: (resume: any) => set({ pj: resume.pj || 0, clt: resume.clt || 0, btc: resume.btc || 0, negotiableClaim: !!resume.negotiableClaim }),
    onMoveOnFowardTabs: () => get().getPendingRequirements(),
    getPendingRequirements: () => {
        const { clt, pj, btc } = get();
        const errors: string[] = [];

        !Number(clt) && !Number(pj) && errors.push('Deve se escolher ao menos uma das pretensões (PJ ou CLT)');
        isOutOfSalaryRange(clt) && errors.push(`A pretensão CLT deve estar entre ${minSalary} e ${maxSalary} reais`);
        isOutOfSalaryRange(pj) && errors.push(`A pretensão PJ deve estar entre ${minSalary} e ${maxSalary} reais`);
        isOutOfSalaryRange(btc) && errors.push(`A pretensão em bitcoin deve estar entre ${minSalary} e ${maxSalary} reais`);

        return errors;
    },
}));

// mesmas regras de btc, clt e pj em JnJsonCommonsFields no backend; 0 quer dizer "não aceito" e não é enviado
const minSalary = 1000;
const maxSalary = 100000;
const isOutOfSalaryRange = (value: any) => {
    const salary = Number(value);
    return salary != 0 && (salary < minSalary || salary > maxSalary);
};

export const TabSalary: React.FC<TabSalaryProps> = ({}) => {
    const { negotiableClaim, pj, clt, btc, setPj, setClt, setBtc, setNegotiableClaim } = TabSalaryStore((state: ITabSalaryStore) => ({ ...state }));
    return (
        <div>
            <IntegerFieldComponent
                explanation="Caso esta opção estiver marcada, seu perfil não será selecionado para vagas de contrato CLT. Caso esta opção não estiver marcada, você deverá informar no campo de texto que será mostrado, o total em reais que te é interessante receber mensalmente."
                textFieldLabel="Minha pretensão salarial mensal CLT (número inteiro em reais)"
                checkBoxLabel="Não aceito empregos CLT"
                defaultValue={1500}
                minValue={minSalary}
                maxValue={maxSalary}
                setValue={setClt}
                value={clt}
            />
            <IntegerFieldComponent
                explanation="Caso esta opção estiver marcada, seu perfil não será selecionado para vagas de contrato PJ. Caso esta opção não estiver marcada, você deverá informar no campo de texto que será mostrado, o total em reais que te é interessante receber mensalmente."
                textFieldLabel="Minha pretensão salarial mensal PJ (número inteiro em reais)"
                checkBoxLabel="Não aceito empregos PJ"
                defaultValue={2500}
                minValue={minSalary}
                maxValue={maxSalary}
                setValue={setPj}
                value={pj}
            />
            <IntegerFieldComponent
                explanation="Caso esta opção estiver marcada, seu perfil não será selecionado para vagas que paguem em bitcoin. Caso esta opção não estiver marcada, você deverá informar no campo de texto que será mostrado, o total em reais que te é interessante receber mensalmente."
                textFieldLabel="Minha pretensão em bitcoin (Valor equivalente em reais)"
                checkBoxLabel="Não aceito eventuais freelancers em bitcoin"
                defaultValue={1000}
                setValue={setBtc}
                minValue={minSalary}
                maxValue={maxSalary}
                value={btc}
            />
            <CheckBoxComponent
                explanation="Caso esta opção estiver marcada, seu perfil estará à disposição de todos os recrutadores que tiverem vagas que buscam por perfis que negociam pretensão salarial (geralmente para baixo). Cabe ressaltar que esta opção é somente interessante, caso a oportunidade oferecida tiver benefícios (Plano de saúde, vale alimentação e varios outros) interessantes ou localização boa, ou home office ou qualquer outra coisa que compense receber salário menor."
                checkBoxLabel="Minhas pretensões salariais são negociáveis"
                setValue={setNegotiableClaim}
                value={negotiableClaim}
            />
        </div>
    );
};
