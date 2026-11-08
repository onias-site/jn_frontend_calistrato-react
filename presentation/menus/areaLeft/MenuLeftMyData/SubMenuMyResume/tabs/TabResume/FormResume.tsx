'use client';

import React from 'react';
import { create } from 'zustand';

import { Select, TextInput, Textarea } from '@mantine/core';
import { LabelComponent } from '@/presentation/components/source/LabelComponent';
import { NotAllowedCompany } from './NotAllowedCompany';

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
    // já existe currículo gravado (de qualquer tipo): o memo vem vazio e o placeholder explica por quê
    savedResume: boolean;

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
    savedResume: false,
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
            savedResume: true,
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
// o perfil não termina em hífen: é o endereço cortado na quebra de linha do PDF (desde 2026-10-14)
const linkedinAddressRegex = /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-_%]*[a-zA-Z0-9_%]\/?$/;
const isOutOfLength = (text: string, minLength: number, maxLength: number) => text.length < minLength || text.length > maxLength;

// sem efeitos colaterais: serve tanto para destacar os campos ao avançar quanto para desabilitar o botão de avançar.
// fieldErrors guarda a mensagem de cada campo, mostrada embaixo dele (até 2026-11-08 era só true, e as mensagens
// apareciam juntas no rodapé da aba)
const validateResume = ({ resumeType, desiredJob, lastJob, linkedinAddress, notAllowedCompany, resumeText, savedTechResume }: ITabResumeStore) => {
    const errors: string[] = [];
    const fieldErrors: any = {};
    const fail = (field: string, message: string) => {
        fieldErrors[field] = fieldErrors[field] || message;
        errors.push(message);
    };
    !desiredJob && fail('desiredJob', 'Deve-se informar a função desejada');
    desiredJob && isOutOfLength(desiredJob, 2, 50) && fail('desiredJob', 'A função desejada deve ter de 2 a 50 caracteres');
    lastJob && isOutOfLength(lastJob, 2, 50) && fail('lastJob', 'A última função deve ter de 2 a 50 caracteres');
    !linkedinAddress && fail('linkedinAddress', 'Deve-se informar o endereço (URL do linkedin)');
    linkedinAddress && !linkedinAddressRegex.test(linkedinAddress) && fail('linkedinAddress', 'O endereço do linkedin deve ter o formato https://www.linkedin.com/in/seu-perfil');
    const companiesOutOfLength = notAllowedCompany.filter((company: string) => isOutOfLength(company, 2, 50));
    companiesOutOfLength.length && fail('notAllowedCompany', 'Cada empresa / consultoria deve ter de 2 a 50 caracteres');
    (!resumeType || !resumeType.id) && fail('resumeType', 'Por favor escolha o tipo do currículo');
    // o currículo de tecnologia já salvo dispensa o texto: as habilidades gravadas continuam valendo até que se cole um texto novo
    resumeType && resumeType.id == 1 && !resumeText && !savedTechResume && fail('resumeText', 'Deve-se informar o texto contido no currículo');
    return { errors, fieldErrors };
};

const emptyResumeTextPlaceholder = 'Copie o texto do seu currículo e cole aqui.';
const savedResumeTextPlaceholder =
    'Seu currículo já está cadastrado, mas o texto dele não aparece aqui porque não o guardamos: para nos resguardar da LGPD (Lei Geral de Proteção de Dados), gravamos somente o link do seu linkedin. Copie o texto do seu currículo e cole aqui.';
const savedTechResumeTextPlaceholder =
    'Seu currículo já está cadastrado, mas o texto dele não aparece aqui porque não o guardamos: para nos resguardar da LGPD (Lei Geral de Proteção de Dados), gravamos somente o link do seu linkedin e as habilidades encontradas no texto. As habilidades gravadas continuam valendo; cole aqui o texto do seu currículo somente se ele mudou.';

const getResumeTextPlaceholder = (savedResume: boolean, savedTechResume: boolean) => {
    if (savedTechResume) {
        return savedTechResumeTextPlaceholder;
    }
    return savedResume ? savedResumeTextPlaceholder : emptyResumeTextPlaceholder;
};

const resumeTypeOptions = resumeTypes.map((type) => ({ value: String(type.id), label: type.label }));

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
        savedResume,
        savedTechResume,
    } = TabResumeStore((state: ITabResumeStore) => ({ ...state }));

    return (
        // largura limitada: em tela cheia, um campo de uma linha com 1300px é desconfortável de ler e de preencher
        <div className="max-w-4xl">
            <LabelComponent
                explanation="Esta informação será útil para orientar o recrutador que visualizar o seu perfil a respeito do seu objetivo profissional."
                labelValue="Função / papel / emprego / ocupação que estou buscando:"
                property="desiredJob"
                errors={fieldErrors}
            >
                <TextInput error={!!fieldErrors.desiredJob} id="desiredJob" maxLength={50} value={desiredJob} onChange={(e) => setDesiredJob(e.currentTarget.value)} />
            </LabelComponent>
            <LabelComponent
                explanation="Esta informação é uma das mais importantes aos recrutadores, porém, somente deve ser preenchida se você não estiver pleiteando estágio / primeira oportunidade."
                labelValue="A última função / papel / emprego / ocupação que atuei ou que estou atuando atualmente:"
                errors={fieldErrors}
                property="lastJob"
            >
                <TextInput error={!!fieldErrors.lastJob} id="lastJob" maxLength={50} value={lastJob} onChange={(e) => setLastJob(e.currentTarget.value)} />
            </LabelComponent>
            <LabelComponent
                explanation="Para nos resguardar da LGPD (Lei Geral de Proteção de Dados), não guardamos o seu currículo e nem nada sobre ele (como texto, por exemplo) em nossa base de dados, sendo assim, você precisa informar o endereço do seu perfil no linkedin (no formato https://www.linkedin.com/in/seu-perfil). É por ele que o recrutador vai te contactar, então mantenha no seu linkedin um meio de contato (e-mail, telefone, etc). Somente endereços do linkedin são aceitos neste campo."
                labelValue="Endereço (URL) para encontrar o meu linkedin:"
                property="linkedinAddress"
                errors={fieldErrors}
            >
                <TextInput
                    id="linkedinAddress"
                    error={!!fieldErrors.linkedinAddress}
                    placeholder="https://www.linkedin.com/in/seu-perfil"
                    value={linkedinAddress}
                    onChange={(e) => setLinkedinAddress(e.currentTarget.value)}
                />
            </LabelComponent>
            <LabelComponent
                explanation="Recrutadores cujo os domínios de e-mail das empresas / consultorias mencionados aqui neste campo não poderão ver o seu endereço de linkedin / contato. Cabe ressaltar que se o recrutador estiver logado por outro e-mail com um domínio que não estiver mencionado aqui neste campo ou se ele estiver usando e-mails pessoais (gmail, outlook e afins), este recrutador poderá ter acesso ao seu link de linkedin / contato."
                labelValue="Empresas / consultorias que não podem receber o meu linkedin:"
                property="notAllowedCompany"
                errors={fieldErrors}
            >
                <NotAllowedCompany setNotAllowedCompany={(e) => setNotAllowedCompany(e)} invalid={!!fieldErrors.notAllowedCompany} notAllowedCompany={notAllowedCompany} />
            </LabelComponent>

            <LabelComponent
                explanation="Se você trabalha ou tem pretensão de trabalhar na área de tecnologia da informação (TI), independentemente de você ter o nível superior (graduação ou pós graduação), selecione esta opção, nossa plataforma está mais preparada (nas primeiras versões) para este tipo de currículo. Você receberá mais vagas se seu currículo for de tecnologia, porém, precisará preencher mais informações."
                labelValue="Tipo do currículo:"
                property="resumeType"
                errors={fieldErrors}
            >
                <Select
                    id="resumeType"
                    value={resumeType && resumeType.id ? String(resumeType.id) : null}
                    error={!!fieldErrors.resumeType}
                    onChange={(value) => {
                        const chosen = resumeTypes.filter((type) => String(type.id) == value)[0];
                        if (!chosen) return;
                        resumeType.id != 1 && setResumeText('');
                        setResumeType(chosen);
                    }}
                    data={resumeTypeOptions}
                    placeholder="Escolha o tipo do seu currículo"
                    allowDeselect={false}
                    comboboxProps={{ withinPortal: false }}
                />
            </LabelComponent>
            {resumeType.id == 1 && (
                <LabelComponent
                    explanation="Para evitar problemas com a LGPD (Lei Geral de Proteção de Dados), não guardamos o texto do seu currículo, em vez disso, guardamos o link do seu linkedin. A cada nova atualização no seu currículo, você precisará copiar o texto de dentro dele e colar aqui novamente. O texto aqui colado é usado para alimentar as listas de habilidade da aba 'Habilidades' mais à frente."
                    labelValue="Todo o texto que copiei do meu currículo:"
                    property="resumeText"
                    errors={fieldErrors}
                >
                    <Textarea
                        id="resumeText"
                        placeholder={getResumeTextPlaceholder(savedResume, savedTechResume)}
                        error={!!fieldErrors.resumeText}
                        value={resumeText}
                        onChange={(e) => setResumeText(e.currentTarget.value)}
                        autosize
                        minRows={10}
                        maxRows={25}
                    />
                </LabelComponent>
            )}
        </div>
    );
};
