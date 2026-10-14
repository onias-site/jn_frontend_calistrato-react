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
    // o currículo de tecnologia já salvo traz as habilidades gravadas: sem texto novo, elas são mantidas
    savedTechResume: boolean;

    loadFromSavedResume: (resume: any) => void;
    onMoveOnFowardTabs: () => string[];
    getPendingRequirements: () => string[];
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
    resumeType: resumeTypes[0],
    notAllowedCompany: [],
    linkedinAddress: '',
    fieldErrors: {},
    desiredJob: '',
    resumeText: '',
    lastJob: '',
    savedTechResume: false,
    // o texto do currículo não é gravado (LGPD): volta vazio
    loadFromSavedResume: (resume: any) => {
        const resumeType = resumeTypes.filter((type) => type.id == resume.resumeType)[0] || resumeTypes[0];
        set({
            resumeType,
            desiredJob: resume.desiredJob || '',
            lastJob: resume.lastJob || '',
            linkedinAddress: resume.linkedinAddress || '',
            notAllowedCompany: resume.notAllowedCompany || [],
            resumeText: '',
            savedTechResume: resumeType.id == 1,
            fieldErrors: {},
        });
    },
    setLastJob: (lastJob: string) => set({ lastJob }),
    setFieldErrors: (fieldErrors: any) => set({ fieldErrors }),
    setDesiredJob: (desiredJob: string) => set({ desiredJob }),
    setResumeText: (resumeText: string) => set({ resumeText }),
    setResumeType: (resumeType: any) => set({ resumeType }),
    setLinkedinAddress: (linkedinAddress: string) => set({ linkedinAddress }),
    setNotAllowedCompany: (notAllowedCompany: string[]) => set({ notAllowedCompany }),

    getPendingRequirements: () => {
        const { errors } = validateResume(get());
        return errors;
    },

    onMoveOnFowardTabs: () => {
        const { errors, fieldErrors } = validateResume(get());
        get().setFieldErrors(fieldErrors);
        return errors;
    },
}));

// mesmas regras de VisEntityResume.Fields no backend
const linkedinAddressRegex = /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-_%]+\/?$/;
const isOutOfLength = (text: string, minLength: number, maxLength: number) => text.length < minLength || text.length > maxLength;

// sem efeitos colaterais: serve tanto para destacar os campos ao avançar quanto para desabilitar o botão de avançar
const validateResume = ({ resumeType, desiredJob, lastJob, linkedinAddress, notAllowedCompany, resumeText, savedTechResume }: ITabResumeStore) => {
    const errors: string[] = [];
    const fieldErrors: any = {};
    !desiredJob && (fieldErrors['desiredJob'] = true) && errors.push('Deve-se informar a função desejada');
    desiredJob && isOutOfLength(desiredJob, 2, 50) && (fieldErrors['desiredJob'] = true) && errors.push('A função desejada deve ter de 2 a 50 caracteres');
    lastJob && isOutOfLength(lastJob, 2, 50) && (fieldErrors['lastJob'] = true) && errors.push('A última função deve ter de 2 a 50 caracteres');
    !linkedinAddress && (fieldErrors['linkedinAddress'] = true) && errors.push('Deve-se informar a endereço (URL do linkedin)');
    linkedinAddress && !linkedinAddressRegex.test(linkedinAddress) && (fieldErrors['linkedinAddress'] = true) && errors.push('O endereço do linkedin deve ter o formato https://www.linkedin.com/in/seu-perfil');
    const companiesOutOfLength = notAllowedCompany.filter((company: string) => isOutOfLength(company, 2, 20));
    companiesOutOfLength.length && (fieldErrors['notAllowedCompany'] = true) && errors.push('Cada empresa / consultoria deve ter de 2 a 20 caracteres');
    (!resumeType || !resumeType.id) && (fieldErrors['resumeType'] = true) && errors.push('Por favor escolha o tipo do currículo');
    // o currículo de tecnologia já salvo dispensa o texto: as habilidades gravadas continuam valendo até que se cole um texto novo
    resumeType && resumeType.id == 1 && !resumeText && !savedTechResume && (fieldErrors['resumeText'] = true) && errors.push('Deve-se informar a texto contido no currículo');
    return { errors, fieldErrors };
};

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
                explanation="Para nos resguardar da LGPD (Lei Geral de Proteção de Dados), não guardamos o seu currículo e nem nada sobre ele (como texto, por exemplo) em nossa base de dados, sendo assim, você precisa informar o endereço do seu perfil no linkedin (no formato https://www.linkedin.com/in/seu-perfil). É por ele que o recrutador vai te contactar, então mantenha no seu linkedin um meio de contato (e-mail, telefone, etc). Somente endereços do linkedin são aceitos neste campo."
                labelValue="Endereço (URL) para encontrar o meu linkedin:"
                property="linkedinAddress"
                errors={fieldErrors}
            >
                <InputText id= "linkedinAddress" invalid={fieldErrors.linkedinAddress} style={{ width: '75%' }} value={linkedinAddress} onChange={(e) => setLinkedinAddress(e.target.value)} />
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
                    id = "resumeType"
                    style={{ width: '75%' }}
                    value={resumeType}
                    invalid={fieldErrors.resumeType}
                    onChange={(e) => {
                        resumeType.id != 1 && setResumeText('');
                        setResumeType(e.value);
                    }}
                    options={resumeTypes}
                    optionLabel="label"
                    placeholder="Escolha o tipo do seu currículo"
                    className="md:w-14rem w-full"
                />
            </LabelComponent>
            {resumeType.id == 1 && (
                <LabelComponent
                    explanation="Para evitar problemas com a LGPD (Lei Geral de Proteção de Dados), não guardamos o texto do seu currículo, em vez disso, guardamos o link do seu linkedin. A cada nova atualização no seu currículo, você precisará copiar o texto de dentro dele e colar aqui novamente. O texto aqui colado é usado para alimentar as listas de habilidade da aba 'Habilidades' mais à frente."
                    labelValue="Todo o texto que copiei do meu currículo:"
                    property="resumeText"
                    errors={fieldErrors}
                >
                    <InputTextarea
                        id = "resumeText"
                        placeholder="Copie o texto do seu currículo e cole aqui."
                        invalid={fieldErrors.resumeText}
                        style={{ width: '75%' }}
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        rows={15}
                        cols={100}
                    />
                </LabelComponent>
            )}
        </div>
    );
};
