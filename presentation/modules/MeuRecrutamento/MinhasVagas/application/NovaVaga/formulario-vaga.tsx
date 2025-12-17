'use client';
import PanelCodeHighlight from '@/presentation/utils/panel-code-highlight';
import React, { useEffect, useState } from 'react';
import ComponentsTablesValorServico from '../../../../../components/meu-recrutamento/minhas-vagas/nova-vaga/components-tables-valor-servico';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useVagas } from '@/presentation/contexts/vagasContex';
import { makeRemoteEditVagas } from '@/main/factories/usecases/vagas/remote-edit-vagas-factory';
import { DadosBasicos } from './components/dados-basicos';
import { items } from './utils/itens-ordenacao';
import { Sortable, ViewVagasModel } from '@/domain/models/view-vagas-model';
import { useQueryClient } from '@tanstack/react-query';
import { FiltroCandidatos } from './components/filtro-candidatos';
import useFiltroCandidatoStore from '../../infra/store/filtro-candidato-store';
import useFiltroRequisitosStore from '../../infra/store/filtro-requisitos-store';
import { FiltroRequisitos } from './components/filtro-requisitos';
import { OrdenarCandidatos } from './components/ordenar-candidatos';
import { NextStepper } from './components/next-stepper';
import { FormData, schema } from '@/domain/schemas/vagas/formulario-vagas-schema';
import { makeRemoteAddVagas } from '@/main/factories/usecases/vagas/remote-add-vagas-factory';


interface FormularioVagaProps {
    vagaId?: string;
}

const FormularioVaga: React.FC<FormularioVagaProps> = ({ vagaId }) => {
    const [stepper, setStepper] = useState<any>(1);
    const idVaga = vagaId ?? '';
    const [sortable, setSortable] = useState<Sortable[]>(items);
    const {obrigatorios, setObrigatorios, desejaveis, setDesejaveis} = useFiltroRequisitosStore()
    const {isRemoto,isPresencial,isHibrido,isPcd,isClt,isPj,isBtc,estados,estadoSelecionadoId,setStatus,setRemoto, setHibrido, setPresencial, setClt, setPj, setBtc, setEstadoSelecionadoId} = useFiltroCandidatoStore()
    const router = useRouter();
    const { findVagaById } = useVagas();
    const [descricaoAnterior, setDescricaoAnterior] = useState<string>('');

    const {
        register,
        reset,
        handleSubmit,
        getValues,
        setValue,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        mode: 'onChange',
    });


    useEffect(() => {
        if (idVaga) {
            const vagaData = findVagaById(idVaga);
            if (vagaData) {
                (Object.keys(vagaData) as Array<keyof FormData>).forEach((key) => {
                    setValue(key, vagaData[key]);
                });
                setClt(vagaData.clt);
                setPj(vagaData.pj);
                setBtc(vagaData.btc);
                setStatus(vagaData.status);
                setRemoto(vagaData.remoto);
                setHibrido(vagaData.hibrido);
                setPresencial(vagaData.presencial);
                setSortable(vagaData.sortable);
                setObrigatorios(vagaData.obrigatorios);
                setDesejaveis(vagaData.desejaveis);
                setDescricaoAnterior(vagaData.descricao || '');

                setEstadoSelecionadoId(vagaData.estados.find(estado => estado.selected)?.id ?? '');
            }
        }
    }, [idVaga, setValue, findVagaById,useFiltroCandidatoStore]);


    const resetFilters = () => {
        setRemoto(false);
        setPresencial(false);
        setHibrido(false);
        setClt(false);
        setPj(false);
        setBtc(false);
        setEstadoSelecionadoId('');
        setObrigatorios([]);
        setDesejaveis([]);
        setSortable([]);
    };



    const queryClient = useQueryClient();
    const onSubmit = async (data: FormData) => {
        if (stepper < 5) {
            return;
          }
        const estadosComSelecao = estados.map(estado => ({
            ...estado,
            selected: estado.id === estadoSelecionadoId
        }));
        const formData = {
            id: idVaga,
            vaga: data.vaga,
            datelimite: data.datelimite,
            status: data.status,
            descricao: data.descricao,
            pagamentopj: data.pagamentopj ?? '',
            pagamentoclt: data.pagamentoclt ?? '',
            pagamentobtc: data.pagamentobtc ?? '',
            remoto: isRemoto,
            presencial: isPresencial,
            hibrido: isHibrido,
            estados: estadosComSelecao,
            pcd: isPcd,
            clt: isClt,
            pj: isPj,
            btc: isBtc,
            obrigatorios: obrigatorios,
            desejaveis: desejaveis,
            sortable: sortable,
        };

        let response;

        const editarVaga = makeRemoteEditVagas(idVaga);
        const addVaga = makeRemoteAddVagas();
        if (vagaId) {
            response = await editarVaga.edit(formData);
        } else {
            response = await addVaga.add(formData);
        }


        // Atualiza o cache do React Query
        queryClient.setQueryData(['vagas'], (oldData: ViewVagasModel[] | undefined) => {
            if (oldData) {
                if (vagaId) {
                    // Atualiza a vaga existente no cache
                    return oldData.map((vaga) => (vaga.id === response.id ? response : vaga));
                } else {
                    // Adiciona a nova vaga ao cache
                    return [...oldData, response];
                }
            }


            return [response];
        });

        reset();
        resetFilters();

        router.push('/meu-recrutamento/minhas-vagas');
        return response;
    };

    const nextStep = async () => {
    const obtemValorDaDescricao = getValues('descricao');
    if (stepper === 1 && obtemValorDaDescricao !== descricaoAnterior) {
        const descricaoSemPontuacao = obtemValorDaDescricao.replace(/[.,]/g, ' ');
        const descricaoEmPalavrasIndividuais = descricaoSemPontuacao.split(/\s+/);
        const palavrasDescricaoMinusculasESemAcentos = descricaoEmPalavrasIndividuais.map((word) =>
            word.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
        );

        let obtemPalavrasChaveLocalStorage = localStorage.getItem('techKeywords') || '[]';
        const palavrasChavesArray = JSON.parse(obtemPalavrasChaveLocalStorage);
        const palavrasChavesMinusculasESemAcentos = palavrasChavesArray
            .map((keyword:any) =>
                keyword.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
            );

        const filtraPalavrasChaves = palavrasDescricaoMinusculasESemAcentos.filter((word) => palavrasChavesMinusculasESemAcentos.includes(word));
        const removeDuplicatasERetornaArray = Array.from(new Set(filtraPalavrasChaves));
        const desejaveisUpdated = removeDuplicatasERetornaArray.map((keyword, index) => ({ id: index + 1, text: keyword }));
        setDesejaveis(desejaveisUpdated);
    }

    setDescricaoAnterior(obtemValorDaDescricao);
    setStepper(stepper + 1);
};

    return (
        <PanelCodeHighlight title="Cadastro de vaga">
            <div className="mb-5">
                <div className="inline-block w-full">
                <NextStepper stepper={stepper} nextStep={nextStep} />
                    <div>
                    <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="mb-5">
                                {stepper === 1 &&
                                (<DadosBasicos register={register} errors={errors} />
                                )}
                            </div>
                            <div className="mb-5">
                                {stepper === 2 && (
                                <FiltroCandidatos register={register} errors={errors} />
                                )}
                            </div>

                            <div className="mb-5">
                                {stepper === 3 && (
                                <FiltroRequisitos  />
                                )}
                            </div>
                            <div className="mb-5">
                                {stepper === 4 && (
                            <OrdenarCandidatos sortable={sortable} setSortable={setSortable} />
                                )}
                            </div>

                            <div className="mb-5">
                                {stepper === 5 &&(
                                <ComponentsTablesValorServico />
                                )}
                            </div>

                            <div className="flex justify-between">
                                <button type="button" className={`btn btn-primary ${stepper === 1 ? 'hidden' : ''}`} onClick={() => setStepper(stepper > 1 ? stepper - 1 : 1)}>
                                    Voltar
                                </button>
                                {stepper < 5 ? (
                                    <button type="button" className="btn btn-primary ltr:ml-auto rtl:mr-auto" onClick={nextStep}>
                                        Avançar
                                    </button>
                                ) : null}
                                {stepper === 5 ? (
                                    <button type="submit" className="btn btn-primary">
                                        Salvar Vaga
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

export default FormularioVaga;
