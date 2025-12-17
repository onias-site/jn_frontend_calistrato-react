'use client';
import PanelCodeHighlight from '@/presentation/utils/panel-code-highlight';
import React, { useState } from 'react';
import IconHome from '@/presentation/icons/icon-home';
import IconUser from '@/presentation/icons/icon-user';
import { IconListCheck } from '@/presentation/icons';
import CandidatosStore, { ICandidatoStore } from '../store/candidados-store';
import { useFormCandidato } from './hooks/useFormCandidato';
import { AutoComplete } from "primereact/autocomplete";

import RegioesComponent from '../../../../components/commons/Regioes/regioes';

import { MultiSelect } from 'primereact/multiselect';
import 'primereact/resources/primereact.min.css';
import './formulario-candidato.css';

import "primereact/resources/themes/lara-light-cyan/theme.css";

import 'primeicons/primeicons.css';

interface FormularioCandidatoProps {
    candidatoId?: string;
}

const FormularioCandidato: React.FC<FormularioCandidatoProps> = ({ candidatoId }) => {
    const {
        stepper,
        setStepper,
        setIdCandidato: saveIdCandidato,
        minPretensaoPJ,
        maxPretensaoPJ,
        minPretensaoCLT,
        maxPretensaoCLT,
        setMinPretensaoPJ,
        setMaxPretensaoPJ,
        setMinPretensaoCLT,
        setMaxPretensaoCLT,
    } = CandidatosStore((state: ICandidatoStore) => ({
        stepper: state.stepper,
        setStepper: state.setStepper,
        setIdCandidato: state.setIdCandidato,
        minPretensaoPJ: state.minPretensaoPJ,
        maxPretensaoPJ: state.maxPretensaoPJ,
        minPretensaoCLT: state.minPretensaoCLT,
        maxPretensaoCLT: state.maxPretensaoCLT,
        setMinPretensaoPJ: state.setMinPretensaoPJ,
        setMaxPretensaoPJ: state.setMaxPretensaoPJ,
        setMinPretensaoCLT: state.setMinPretensaoCLT,
        setMaxPretensaoCLT: state.setMaxPretensaoCLT
    }));

    saveIdCandidato(candidatoId ?? '');
    const { register, reset, handleSubmit, setValue, errors, nextStep, onSubmit } = useFormCandidato();

    const widthMap = {
        1: 'w-[10%]',
        2: 'w-[50%]',
        3: 'w-[85%]',

        default: 'w-[90%]',
    };

    const width = widthMap[stepper as keyof typeof widthMap] || widthMap.default;

    return (
        <PanelCodeHighlight title="Cadastro Candidato">
            <div className="mb-5">
                <div className="inline-block w-full">
                    <div className="relative z-[1] overflow-x-auto">
                        <div className={`${width} absolute top-[30px] -z-[1] m-auto h-1 w-[15%] bg-primary transition-[width] ltr:left-0 rtl:right-0`}></div>
                        <ul className="mb-5 grid min-w-[500px] grid-cols-3">
                            <li className="mx-auto flex flex-col items-center">
                                <button
                                    type="button"
                                    className={`${stepper === 1 ? '!border-primary !bg-primary text-white' : ''}
                    flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-[#f3f2ee] bg-white dark:border-[#1b2e4b] dark:bg-[#253b5c]`}
                                    onClick={nextStep}
                                >
                                    <IconHome />
                                </button>
                                <span className={`${stepper === 1 ? 'text-primary ' : ''}text-center mt-2 block`}>Dados Gerais</span>
                            </li>
                            <li className="mx-auto flex flex-col items-center">
                                <button
                                    type="button"
                                    className={`${stepper === 2 ? '!border-primary !bg-primary text-white' : ''}
                                                flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-[#f3f2ee] bg-white dark:border-[#1b2e4b] dark:bg-[#253b5c]`}
                                    onClick={nextStep}
                                >
                                    <IconUser className="h-5 w-5" />
                                </button>
                                <span className={`${stepper === 2 ? 'text-primary ' : ''}text-center mt-2 block`}>Dados da Carreira</span>
                            </li>
                            <li className="mx-auto flex flex-col items-center">
                                <button
                                    type="button"
                                    className={`${stepper === 3 ? '!border-primary !bg-primary text-white' : ''}
                                                flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-[#f3f2ee] bg-white dark:border-[#1b2e4b] dark:bg-[#253b5c]`}
                                    onClick={nextStep}
                                >
                                    <IconListCheck className="h-5 w-5" />
                                </button>
                                <span className={`${stepper === 3 ? 'text-primary ' : ''}text-center mt-2 block`}>Dados Salariais</span>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="mb-5">
                                {stepper === 1 && (
                                    <div className="mb-5">
                                        <RegioesComponent onSelectRegiao= {e => {}}/>
                                        <div className="mb-5">
                                            <label htmlFor="empresasExcluidas">Empresas que você não quer que vejam seu currículo</label>
                                            <AutoComplete field="name"  className="form-input"/>
                                        </div>
                                        <div className="mb-5">
                                            <input {...register('empresasExcluidas')} id="empresasExcluidas" type="text" placeholder="Ex. Google" className="form-input" />
                                       </div>
                                        <div className="mb-5">
                                            <div className="mb-5">
                                                <label className="relative mb-2 font-bold checked:bg-none">Vaga exclusiva (PCD)</label>
                                                <div className="relative h-6 w-12">
                                                    <input
                                                        type="checkbox"
                                                        {...register('vagaExclusivaPCD')}
                                                        className="custom_switch peer absolute z-10 h-full w-full cursor-pointer opacity-0"
                                                        id="vagaExclusivaPCD"
                                                    />
                                                    <span className="block h-full rounded-full bg-[#ebedf2] before:absolute before:bottom-1 before:left-1 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-all before:duration-300 peer-checked:bg-primary peer-checked:before:left-7 dark:bg-dark dark:before:bg-white-dark dark:peer-checked:before:bg-white"></span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mb-5">
                                            <label htmlFor="anexoCurriculo">Anexar Currículo</label>
                                            <input id="anexoCurriculo" type="file" className="form-input" />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="mb-5">
                                {stepper === 2 && (
                                    <div>
                                        <div className="mb-5">
                                            <label htmlFor="cargoRecenteAtual">Cargo mais recente ou atual</label>
                                            <input {...register('cargoRecenteAtual')} id="cargoRecenteAtual" type="text" placeholder="Ex. Desenvolvedor Senior C#" className="form-input" />
                                        </div>
                                        <div className="mb-5">
                                            <label htmlFor="cargoDesejado">Cargo Desejado</label>
                                            <input {...register('cargoDesejado')} id="cargoDesejado" type="text" placeholder="Ex. Desenvolvedor Senior C#" className="form-input" />
                                        </div>
                                        <div className="mb-5">
                                            <label htmlFor="anosExperiencia">Anos de Experiência</label>
                                            <input {...register('experiencia')} id="anosExperiencia" type="number" placeholder="Ex. 4" className="form-input" />
                                        </div>
                                        <div className="mt-2">
                                            <label htmlFor="sobreMim" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                                                Sobre Mim
                                            </label>
                                            <textarea
                                                {...register('sobreMim')}
                                                id="sobreMim"
                                                className="block h-[250px] w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-600 focus:ring-blue-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                placeholder="Escreva informações sobre você e sua carreira...."
                                                required
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mb-5">
                                {stepper === 3 && (
                                    <div>
                                        <div className="mb-5">
                                            <label className="relative mb-2 font-bold checked:bg-none">Tipo de Contrato</label>
                                            <div className="flex flex-row gap-8">
                                                <div className="mb-5 text-center">
                                                    <span className="relative text-center text-white-dark checked:bg-none">CLT</span>
                                                    <div className="relative h-6 w-12">
                                                        <input
                                                            {...register('clt')}
                                                            type="checkbox"
                                                            className="custom_switch peer absolute z-10 h-full w-full cursor-pointer opacity-0"
                                                            id="custom_switch_checkbox1"
                                                        />
                                                        <span className="block h-full rounded-full bg-[#ebedf2] before:absolute before:bottom-1 before:left-1 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-all before:duration-300 peer-checked:bg-primary peer-checked:before:left-7 dark:bg-dark dark:before:bg-white-dark dark:peer-checked:before:bg-white"></span>
                                                    </div>
                                                </div>
                                                <div className="mb-5 text-center">
                                                    <span className="relative text-white-dark checked:bg-none">PJ</span>
                                                    <div className="relative h-6 w-12">
                                                        <input
                                                            {...register('pj')}
                                                            type="checkbox"
                                                            className="custom_switch peer absolute z-10 h-full w-full cursor-pointer opacity-0"
                                                            id="custom_switch_checkbox1"
                                                        />
                                                        <span className="block h-full rounded-full bg-[#ebedf2] before:absolute before:bottom-1 before:left-1 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-all before:duration-300 peer-checked:bg-primary peer-checked:before:left-7 dark:bg-dark dark:before:bg-white-dark dark:peer-checked:before:bg-white"></span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mb-10">
                                                <p className="font-bold">Minha pretensão PJ</p>
                                            </div>
                                            <div className="mb-5">
                                                <div className="mb-4 mt-9 grid grid-cols-1 gap-8 lg:grid-cols-2">
                                                    <div className="mb-3">
                                                        <span>Min.</span>
                                                        <input
                                                            type="number"
                                                            className="form-input"
                                                            value={minPretensaoPJ}
                                                            onChange={(e) => {
                                                                setMinPretensaoPJ(e.target.value);
                                                                setValue('pretensaoPJ', `${e.target.value} - ${maxPretensaoPJ}`);
                                                            }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <span>Máx.</span>
                                                        <input
                                                            type="number"
                                                            className="form-input"
                                                            min="0"
                                                            disabled={true}
                                                            max="100000"
                                                            value={maxPretensaoPJ}
                                                            onChange={(e) => {
                                                                setMaxPretensaoPJ(e.target.value);
                                                                setValue('pretensaoPJ', `${minPretensaoPJ} - ${e.target.value}`);
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mb-10">
                                                <p className="font-bold">Minha pretensão CLT</p>
                                            </div>
                                            <div className="mb-5">
                                                <div className="mb-4 mt-9 grid grid-cols-1 gap-8 lg:grid-cols-2">
                                                    <div className="mb-3">
                                                        <span>Min.</span>
                                                        <input
                                                            type="number"
                                                            className="form-input"
                                                            min="0"
                                                            max="100000"
                                                            value={minPretensaoCLT}
                                                            onChange={(e) => {
                                                                setMinPretensaoCLT(e.target.value);
                                                                setValue('pretensaoCLT', `${e.target.value} - ${maxPretensaoCLT}`);
                                                            }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <span>Máx.</span>
                                                        <input
                                                            type="number"
                                                            className="form-input"
                                                            min="0"
                                                            max="100000"
                                                            value={maxPretensaoCLT}
                                                            onChange={(e) => {
                                                                setMaxPretensaoCLT(e.target.value);
                                                                setValue('pretensaoCLT', `${minPretensaoCLT} - ${e.target.value}`);
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mb-5">
                                            <div className="flex flex-row items-center gap-2">
                                                <p className="font-bold">Aceita receber pagamento em Bitcoin?</p>
                                            </div>
                                            <div className="mb-5 flex flex-row gap-2">
                                                <div className="relative h-6 w-12">
                                                    <input {...register('btc')} type="checkbox" className="custom_switch peer absolute z-10 h-full w-full cursor-pointer opacity-0" id="pagamentoBtc" />
                                                    <span className="block h-full rounded-full bg-[#ebedf2] before:absolute before:bottom-1 before:left-1 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-all before:duration-300 peer-checked:bg-primary peer-checked:before:left-7 dark:bg-dark dark:before:bg-white-dark dark:peer-checked:before:bg-white"></span>
                                                </div>
                                            </div>
                                            <div className="mb-5">
                                                <input name="valorBtc" type="text" placeholder="Ex. 0,039฿ " className="form-input" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-between">
                                <button type="button" className={`btn btn-primary ${stepper === 1 ? 'hidden' : ''}`} onClick={() => setStepper(stepper > 1 ? stepper - 1 : 1)}>
                                    Voltar
                                </button>
                                {stepper < 3 ? (
                                    <button type="button" className="btn btn-primary ltr:ml-auto rtl:mr-auto" onClick={nextStep}>
                                        Avançar
                                    </button>
                                ) : null}
                                {stepper === 3 ? (
                                    <button type="submit" className="btn btn-primary">
                                        Salvar Curriculo
                                    </button>
                                ) : null}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </PanelCodeHighlight>
    );
};

export default FormularioCandidato;
