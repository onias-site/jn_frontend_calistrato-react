'use client';

import React from 'react';
import { create } from 'zustand';

import { InputText } from 'primereact/inputtext';

import { InputTextarea } from 'primereact/inputtextarea';
import { LabelComponent } from '@/presentation/components/source/LabelComponent';
import { NotAllowedCompany } from './NotAllowedCompany';

import { Dropdown } from 'primereact/dropdown';

export interface TabResumeProps {}

export interface ITabResumeStore {
    notAllowedCompany: string[];
    linkedinAddress: string;
    desiredJob: string;
    resumeText: string;
    fieldErrors: any;
    lastJob: string;
    resumeType: any;

    onMoveOnFowardTabs: () => string[];
    setLastJob: (lastJob: string) => void;
    setResumeType: (resumeType: any) => void;
    setFieldErrors: (fieldErrors: any) => void;
    setResumeText: (resumeText: string) => void;
    setDesiredJob: (desiredJob: string) => void;
    setLinkedinAddress: (linkedinAddress: string) => void;
    setNotAllowedCompany: (notAllowedCompany: string[]) => void;
}
const resumeTypes = [
    { id: 1, label: 'Tecnologia da Informação (Com curso técnico ou profissionalizante ou faculdade ou simples experiência comprovada)' },
    { id: 2, label: 'Recrutamento e seleção (Com curso técnico ou profissionalizante ou faculdade ou simples experiência comprovada)' },
    { id: 3, label: 'Outras profissões de nível Superior (Graduação ou Pós Graduação em faculdade e/ou universidade)' },
    { id: 4, label: 'Profissões de nível operacional (Com diploma de ensino médio ou fundamental ou sem escolaridade ou escolaridade incompleta)' },
];

export const TabResumeStore = create<ITabResumeStore>((set, get) => ({
    resumeType:resumeTypes[0],
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
    setResumeType: (resumeType: any) => set({ resumeType }),
    setLinkedinAddress: (linkedinAddress: string) => set({ linkedinAddress }),
    setNotAllowedCompany: (notAllowedCompany: string[]) => set({ notAllowedCompany }),

    onMoveOnFowardTabs: () => {
        const {resumeType, desiredJob, linkedinAddress, resumeText, setFieldErrors } = get();
        let errors: any = [];
        const fieldErrors = {};
        !desiredJob && (fieldErrors['desiredJob'] = true) && errors.push('Deve-se informar a função desejada');
        !linkedinAddress && (fieldErrors['linkedinAddress'] = true) && errors.push('Deve-se informar a endereço (URL do linkedin)');
        (!resumeType || !resumeType.id) && (fieldErrors['resumeType'] = true) && errors.push('Por favor escolha o tipo do currículo');
        resumeType && resumeType.id == 1 && !resumeText && (fieldErrors['resumeText'] = true) && errors.push('Deve-se informar a texto contido no currículo');
        setFieldErrors(fieldErrors);

        return errors;
    },

}));

export const TabResume: React.FC<TabResumeProps> = ({}) => {
    const {
        fieldErrors,
        resumeType,
        linkedinAddress,
        resumeText,
        notAllowedCompany,
        desiredJob,
        lastJob,
        setResumeText,
        setLastJob,
        setDesiredJob,
        setNotAllowedCompany,
        setLinkedinAddress,
        setResumeType,
    } = TabResumeStore((state: ITabResumeStore) => ({ ...state }));


    return (
        <div>
            <LabelComponent
                explanation="Esta informação será útil para orientar o recrutador que visualizar o seu perfil a respeito do seu objetivo profissional."
                labelValue="Função / papel / emprego / ocupação que estou buscando:"
                property="desiredJob"
                errors={fieldErrors}
            >
                <InputText invalid={fieldErrors.desiredJob} id="desiredJob" style={{ width: '75%' }} value={desiredJob} onChange={(e) => setDesiredJob(e.target.value)} />
            </LabelComponent>
            <LabelComponent
                explanation="Esta informação é uma das mais importantes aos recrutadores, porém, somente deve ser preenchida se você não estiver pleiteando estágio / primeira oportunidade."
                labelValue="A última função / papel / emprego / ocupação que atuei ou que estou atuando atualmente:"
                errors={fieldErrors}
                property="lastJob"
            >
                <InputText invalid={fieldErrors.lastJob} style={{ width: '75%' }} id="lastJob" value={lastJob} onChange={(e) => setLastJob(e.target.value)} />
            </LabelComponent>
            <LabelComponent
                explanation="Para nos resguardar da LGPD (Lei Geral de Proteção de Dados), não guardamos o seu currículo e nem nada sobre ele (como texto, por exemplo) em nossa base de dados, sendo assim, você precisa, preferencialmente, informar seu endereço do linkedin ou de algum site que sirva como seu currículo, neste site, tem de haver um meio para te contactar (e-mail, telefone, etc). Na falta de linkedin ou de site que sirva para currículo, você deve informar neste campo, um modo para te contactar (telefone, e-mail, etc), mas, para a sua própria segurança, aconselhamos, que este campo seja usado para guardar seu endereço do linkedin."
                labelValue="Endereço (URL) para encontrar o meu linkedin:"
                property="linkedinAddress"
                errors={fieldErrors}
            >
                <InputText invalid={fieldErrors.linkedinAddress} style={{ width: '75%' }} value={linkedinAddress} onChange={(e) => setLinkedinAddress(e.target.value)} />
            </LabelComponent>
            <LabelComponent
                explanation="Recrutadores cujo os domínios de e-mail das empresas / consultorias mencionados aqui neste campo não poderão ver o seu endereço de linkedin / contato. Cabe ressaltar que se o recrutador estiver logado por outro e-mail com um domínio que não estiver mencionado aqui neste campo ou se ele estiver usando e-mails pessoais (gmail, outlook e afins), este recrutador poderá ter acesso ao seu link de linkedin / contato."
                labelValue="Empresas / consultorias que não podem receber o meu linkedin:"
                property="notAllowedCompany"
                errors={fieldErrors}
            >
                <NotAllowedCompany setNotAllowedCompany={(e) => setNotAllowedCompany(e)} invalid={fieldErrors.notAllowedCompany} notAllowedCompany={notAllowedCompany} />
            </LabelComponent>

            <LabelComponent
                explanation="Se você trabalha ou tem pretensão de trabalhar na área de tecnologia da informação (TI), independentemente de você ter o nível superior (graduação ou pós graduação), selecione esta opção, nossa plataforma está mais preparada (nas primeiras versões) para este tipo de currículo. Você receberá mais vagas se seu currículo for de tecnologia, porém, precisará preencher mais informações."
                labelValue="Tipo do currículo:"
                property="resumeType"
                errors={fieldErrors}
            >
                <Dropdown
                    style={{ width: '75%' }}
                    value={resumeType}
                    invalid={fieldErrors.resumeType}
                    onChange={(e) => setResumeType(e.value)}
                    options={resumeTypes}
                    optionLabel="label"
                    placeholder="Escolha o tipo do seu currículo"
                    className="md:w-14rem w-full"
                />
            </LabelComponent>
            {
            resumeType.id == 1 && <LabelComponent
                explanation="Para evitar problemas com a LGPD (Lei Geral de Proteção de Dados), não guardamos o texto do seu currículo. A cada nova atualização no seu currículo, você precisará copiar o texto de dentro dele e colar aqui novamente. O texto aqui colado é usado para alimentar as listas de habilidade da aba 'Habilidades' mais à frente."
                labelValue="Todo o texto que copiei do meu currículo:"
                property="resumeText"
                errors={fieldErrors}
            >
                <InputTextarea
                    placeholder="Copie o texto do seu currículo e cole aqui."
                    invalid={fieldErrors.resumeText}
                    style={{ width: '75%' }}
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    rows={15}
                    cols={100}
                />
            </LabelComponent>

            }
        </div>
    );
};
