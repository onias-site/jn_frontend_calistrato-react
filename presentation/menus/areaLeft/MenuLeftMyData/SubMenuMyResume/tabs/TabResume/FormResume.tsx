'use client';

import React from 'react';

import { InputText } from 'primereact/inputtext';
import { AutoComplete } from 'primereact/autocomplete';
import { create } from 'zustand';

import { InputTextarea } from 'primereact/inputtextarea';
import { LabelComponent } from '@/presentation/components/source/LabelComponent';

export interface TabResumeProps {}

export interface ITabResumeStore {
    notAllowedCompany: string[];
    linkedinAddress: string;
    desiredJob: string;
    resumeText: string;
    fieldErrors: any;
    lastJob: string;

    onMoveOnFowardTabs: () => string[];
    setLastJob: (lastJob: string) => void;
    setFieldErrors: (fieldErrors: any) => void;
    setResumeText: (resumeText: string) => void;
    setDesiredJob: (desiredJob: string) => void;
    setLinkedinAddress: (linkedinAddress: string) => void;
    setNotAllowedCompany: (notAllowedCompany: string[]) => void;
}

export const TabResumeStore = create<ITabResumeStore>((set, get) => ({
    notAllowedCompany: [],
    linkedinAddress: '',
    fieldErrors: {},
    desiredJob: '',
    resumeText: '',
    lastJob: '',
    setLastJob: (lastJob: string) => set({ lastJob }),
    setFieldErrors: (fieldErrors: any) => set({ fieldErrors }),
    setDesiredJob: (desiredJob: string) => set({ desiredJob }),
    setResumeText: (resumeText: string) => set({ resumeText }),
    setLinkedinAddress: (linkedinAddress: string) => set({ linkedinAddress }),
    setNotAllowedCompany: (notAllowedCompany: string[]) => set({ notAllowedCompany }),

    onMoveOnFowardTabs: () => {
        const { desiredJob, linkedinAddress, resumeText, setFieldErrors } = get();
        let errors: any = [];
        const fieldErrors = {};
        !desiredJob && (fieldErrors['desiredJob'] = true) && errors.push('Deve-se informar a função desejada');
        !resumeText && (fieldErrors['resumeText'] = true) && errors.push('Deve-se informar a texto contido no currículo');
        !linkedinAddress && (fieldErrors['linkedinAddress'] = true) && errors.push('Deve-se informar a endereço (URL do linkedin)');
        setFieldErrors(fieldErrors);
        return errors;
    },
}));

export const TabResume: React.FC<TabResumeProps> = ({}) => {
    const { fieldErrors, linkedinAddress, resumeText, notAllowedCompany, desiredJob, lastJob, setResumeText, setLastJob, setDesiredJob, setNotAllowedCompany, setLinkedinAddress } = TabResumeStore(
        (state: ITabResumeStore) => ({ ...state })
    );
    return (
        <div>
            <LabelComponent
                explanation="Esta informação será útil para orientar o recrutador que visualizar o seu perfil a respeito do seu objetivo profissional."
                property="desiredJob"
                errors={fieldErrors}
                labelValue="Nova função / papel / emprego que eu atuaria:"
            >
                <InputText invalid={fieldErrors.desiredJob} id="desiredJob" style={{ width: '75%' }} value={desiredJob} onChange={(e) => setDesiredJob(e.target.value)} />
            </LabelComponent>
            <LabelComponent
                explanation="Esta informação é uma das mais importantes aos recrutadores, porém, somente deve ser preenchida se você não estiver pleiteando estágio / primeira oportunidade."
                property="lastJob"
                errors={fieldErrors}
                labelValue="A última função / papel / emprego que eu atuei ou que estou atuando:"
            >
                <InputText invalid={fieldErrors.lastJob} style={{ width: '75%' }} id="lastJob" value={lastJob} onChange={(e) => setLastJob(e.target.value)} />
            </LabelComponent>
            <LabelComponent
                explanation="Para nos resguardar da LGPD (Lei Geral de Proteção de Dados), não guardamos o seu currículo e nem nada sobre ele (como texto, por exemplo) em nossa base de dados, sendo assim, você precisa, preferencialmente, informar seu endereço do linkedin ou de algum site que sirva como seu currículo, neste site, tem de haver um meio para te contactar (e-mail, telefone, etc). Na falta de linkedin ou de site que sirva para currículo, você deve informar neste campo, um modo para te contactar (telefone, e-mail, etc), mas, para a sua própria segurança, aconselhamos, que este campo seja usado para guardar seu endereço do linkedin."
                property="linkedinAddress"
                errors={fieldErrors}
                labelValue="Endereço (URL) para encontrar o meu linkedin:"
            >
                <InputText invalid={fieldErrors.linkedinAddress} style={{ width: '75%' }} value={linkedinAddress} onChange={(e) => setLinkedinAddress(e.target.value)} />
            </LabelComponent>
            <LabelComponent
                explanation="Recrutadores cujo os domínios de e-mail das empresas / consultorias mencionados aqui neste campo não poderão ver o seu endereço de linkedin / contato. Cabe ressaltar que se o recrutador estiver logado por outro e-mail com um domínio que não estiver mencionado aqui neste campo ou se ele estiver usando e-mails pessoais (gmail, outlook e afins), este recrutador poderá ter acesso ao seu link de linkedin / contato."
                property="notAllowedCompany"
                errors={fieldErrors}
                labelValue="Empresas / consultorias que não podem receber o meu linkedin:"
            >
                <AutoComplete
                    invalid={fieldErrors.notAllowedCompany}
                    field="name"
                    className="form-input"
                    style={{ width: '75%' }}
                    value={notAllowedCompany}
                    onChange={(e) => setNotAllowedCompany(e.value)}
                />
            </LabelComponent>
            <LabelComponent
                explanation="Para evitar problemas com a LGPD (Lei Geral de Proteção de Dados), não guardamos o texto do seu currículo. A cada nova atualização no seu currículo, você precisará copiar o texto de dentro dele e colar aqui novamente. O texto aqui colado é usado para alimentar as listas de habilidade da aba 'Habilidades' mais à frente."
                property="resumeText"
                errors={fieldErrors}
                labelValue="Todo o texto que copiei do meu currículo:"
            >
                <InputTextarea
                    invalid={fieldErrors.resumeText}
                    style={{ width: '75%' }}
                    placeholder="Copie o texto do seu currículo e cole aqui."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    rows={15}
                    cols={100}
                />
            </LabelComponent>
        </div>
    );
};
