import { ReactSortable } from 'react-sortablejs';
import { useRecoilState, useSetRecoilState } from "recoil";

// import { useFilterRequisitos } from "../hooks/useFilterRequisitos";
import { IconTrashLines } from '@/presentation/icons';
// import { filtroRequisitosDesejaveis, filtroRequisitosObrigatorios } from '../atom/atom';
import useFiltroRequisitosStore from '../../../infra/store/filtro-requisitos-store';
import { useState } from 'react';

export const FiltroRequisitos = () => {

    const {obrigatorios, desejaveis,setObrigatorios,setDesejaveis,moverParaDesejaveis,moverParaObrigatorios,removerDaListaDesejaveis,removerDaListaObrigatorios} = useFiltroRequisitosStore()
    const [newItem, setNewItem] = useState('');

    const handleNewItemChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNewItem(event.target.value);
    };

    const handleNewItemSubmit = () => {
        const item = {
            id: Math.random(),
            text: newItem,
        };

        moverParaDesejaveis(item)
        setNewItem('');
    };

    return (
        <>
        <div className="text-center">
            <label htmlFor="new-item">Insira uma Tecnologia que não está na lista e que gostaria que entrasse</label>
            <div className="mx-2 flex flex-row items-center">
                <input id="new-item" type="text" placeholder="+ java" className="form-input" value={newItem} onChange={handleNewItemChange} />
                <button type="button" className="btn btn-primary my-2 rounded border px-4 py-2" onClick={handleNewItemSubmit}>
                    {'Adicionar'}
                </button>
            </div>
        </div>
        <div>
            <div className="panel" style={{ maxHeight: '1000px', overflow: 'auto' }}>
                <div>
                    <div className="mb-5 text-lg font-semibold">Obrigatórios</div>
                    <div className="panel mb-3" style={{ maxHeight: '400px', overflow: 'auto', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)' }}>
                        <div className="gap-x-12 sm:grid-cols-2">
                            <ul id="obrigatorios-list">
                                <ReactSortable
                                    list={obrigatorios}
                                    setList={setObrigatorios}
                                    animation={200}
                                    delay={1}
                                    ghostClass="gu-transit"
                                    group="shared"
                                    onAdd={(evt) => moverParaDesejaveis(evt.item)}
                                >
                                    {obrigatorios.length > 0 ? (
                                        obrigatorios.map((item) => {
                                            return (
                                                <li key={item.id} className="mb-2.5 cursor-grab">
                                                    <div className="items-md-center flex flex-col rounded-md border border-white-light bg-white px-6 py-3.5 text-center dark:border-dark dark:bg-[#1b2e4b] md:flex-row ltr:md:text-left rtl:md:text-right">
                                                        <div className="flex flex-1 flex-col items-center justify-between md:flex-row">
                                                            <div className="my-3 font-semibold md:my-0">
                                                                <div className="text-base text-dark dark:text-[#bfc9d4]">{item.text}</div>
                                                            </div>
                                                            <div>
                                                                <button onClick={() => removerDaListaObrigatorios(item.id)}>
                                                                    <IconTrashLines />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </li>
                                            );
                                        })
                                    ) : (
                                        <li className="mb-2.5 cursor-grab">
                                            <div className="flex items-center justify-center md:flex-row">
                                                <div className="my-3 font-semibold md:my-0">
                                                    <div className="text-base text-dark dark:text-[#bfc9d4] ">Arraste e solte aqui para adicionar.</div>
                                                </div>
                                                <div></div>
                                            </div>
                                        </li>
                                    )}
                                </ReactSortable>
                            </ul>
                        </div>
                    </div>
                </div>
                <div>
                    <div className="mb-5 text-lg font-semibold">Desejáveis</div>
                    <div className="panel" style={{ maxHeight: '400px', overflow: 'auto', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)' }}>
                        <div className="gap-x-12 sm:grid-cols-2">
                            <ul id="desejaveis-list">
                                <ReactSortable
                                    list={desejaveis}
                                    setList={setDesejaveis}
                                    animation={200}
                                    delay={1}
                                    ghostClass="gu-transit"
                                    group="shared"
                                    onAdd={(evt) => moverParaObrigatorios(evt.item)}
                                >
                                    {desejaveis.map((item) => {
                                        return (
                                            <li key={item.id} className="mb-2.5 cursor-grab">
                                                <div className="items-md-center flex flex-col rounded-md border border-white-light bg-white px-6 py-3.5 text-center dark:border-dark dark:bg-[#1b2e4b] md:flex-row ltr:md:text-left rtl:md:text-right">
                                                    <div className="flex flex-1 flex-col items-center justify-between md:flex-row">
                                                        <div className="my-3 font-semibold md:my-0">
                                                            <div className="text-base text-dark dark:text-[#bfc9d4]">{item.text}</div>
                                                        </div>
                                                        <div>
                                                            <button onClick={() => removerDaListaDesejaveis(item.id)}>
                                                                <IconTrashLines />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ReactSortable>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
    );
};
