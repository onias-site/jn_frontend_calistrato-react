'use client'

import React from 'react';

import { InputTextarea } from 'primereact/inputtextarea';
import { InputText } from 'primereact/inputtext';
import PanelCodeHighlight from '@/presentation/utils/panel-code-highlight';
import { AutoComplete } from 'primereact/autocomplete';
import FileResume from './FileResume';
import { Tooltip } from 'primereact/tooltip';
import { create } from 'zustand';

export interface FormResumeProps {}

export interface IResumeStore {
    notAllowedCompanies: string[];
    observations: string;
    desiredJob: string;
    lastJob: string;

    setNotAllowedCompanies: (notAllowedCompanies: string[]) => void;
    setObservations: (observations: string) => void;
    setDesiredJob: (desiredJob: string) => void;
    setLastJob: (lastJob: string) => void;
}

export const ResumeStore = create<IResumeStore>((set) => ({
    notAllowedCompanies: [],
    observations: '',
    desiredJob: '',
    lastJob: '',

    setLastJob: (lastJob: string) => set({ lastJob }),
    setDesiredJob: (desiredJob: string) => set({ desiredJob }),
    setObservations: (observations: string) => set({ observations }),
    setNotAllowedCompanies: (notAllowedCompanies: string[]) => set({ notAllowedCompanies }),
}));

export const FormResume: React.FC<FormResumeProps> = ({}) => {
    const { notAllowedCompanies, observations, desiredJob, lastJob, setLastJob, setDesiredJob, setObservations, setNotAllowedCompanies } = ResumeStore((state: IResumeStore) => ({ ...state }));
    return (
        <PanelCodeHighlight>
            <Tooltip target="#desiredJob" content="Esta informação será visualizada pelo recrutador que filtrar o seu perfil" position="bottom" />
            <Tooltip
                target="#lastJob"
                content="Esta informação é uma das mais importantes aos recrutadores, porém, só deve ser preenchida se você não estiver pleiteando estágio / primeira oportunidade"
                position="bottom"
            />
            <Tooltip
                target="#notAllowedCompanies"
                content="Digite o nome da empresa, cujo os recrutadores você não quer que recebam ou vejam o seu curriculo, dê enter. Ressaltamos que não há como impedir um recrutador indesejado de ver o seu perfil, caso ele estiver usando um e-mail de uma empresa diferente da que você previu aqui nas seleções de empresas / consultorias indesejadas."
                position="top"
            />
            <Tooltip
                target="#observations"
                content="Esta informação será exibida ao recrutador que for ver o seu perfil, no momento em que ele seleciona o seu perfil para detalhar melhor, se trata de uma informação opcional e que se refere a alguma informação que os nossos formulários não foram capazes de capturar de você e que você gostaria que o recrutador soubesse"
                position="top"
            />
            <Tooltip
                target="#btnGoToLanguages"
                content="Este botão somente funcionará quando o currículo for selecionado e enviado e, quando o campo da função desejada for preenchido"
                position="top"
            />
            <div className="mb-5 text-center">
                <div className="flex-column flex">
                    <label htmlFor="desiredJob" style={{ width: '25%' }} className="letraPequena">
                        Nova função / papel / emprego que eu atuaria:
                    </label>
                    <InputText id="desiredJob" style={{ width: '75%' }} value={desiredJob} onChange={(e) => setDesiredJob(e.target.value)} />
                </div>
            </div>
            <div className="mb-5 text-center">
                <div className="flex-column flex">
                    <label htmlFor="lastJob" style={{ width: '25%' }} className="letraPequena">
                        A última função / papel / emprego que eu atuei:
                    </label>
                    <InputText style={{ width: '75%' }} id="lastJob" value={lastJob} onChange={(e) => setLastJob(e.target.value)} />
                </div>
            </div>
            <div className="mb-5 text-center">
                <div className="flex-column flex gap-2">
                    <label htmlFor="notAllowedCompanies" style={{ width: '25%' }} className="letraPequena" id="notAllowedCompanies">
                        Empresas / consultorias que não devem ver o meu currículo:
                    </label>
                    <AutoComplete field="name" className="form-input" style={{ width: '75%' }} value={notAllowedCompanies} onChange={(e) => setNotAllowedCompanies(e.value)} />
                </div>
            </div>
            <div className="row">
                <div className="col col-md-12">
                    <div className="mb-5">
                        <label id="observations" className="letraPequena">
                            Minha mensagem aos recrutadores que forem ver o meu perfil:
                        </label>
                        <InputTextarea rows={10} cols={96} style={{ width: '100%' }} value={observations} onChange={(e) => setObservations(e.target.value)} />
                    </div>
                </div>
            </div>
            <FileResume />
            <div className="mb-5 text-center">
                <div className="flex-column flex">
                    <label htmlFor="username" style={{ width: '85%' }} className="letraPequena">
                        &nbsp;
                    </label>
                    <button id="btnGoToLanguages" type="button" className="btn btn-primary ltr:ml-auto rtl:mr-auto">
                        Adicionar idiomas
                    </button>
                </div>
            </div>
        </PanelCodeHighlight>
    );
};
