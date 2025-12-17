
import { useSelector } from "react-redux";
import { IRootState } from "@/store";
import { useVagas } from "@/presentation/contexts/vagasContex";
import { useState } from "react";
import { Sortable, ViewVagasModel } from "@/domain/models/view-vagas-model";


const useListVagas = () => {
    const [filtro, setFiltro] = useState('');
    const { recordsData } = useVagas();
    const [viewType, setViewType] = useState<'list' | 'grid'>('grid');
    const col = ['vaga', 'descricao', 'datelimite'];
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';

    const filtrarVagas = (vagas: ViewVagasModel[], filtro: string) => {
        return vagas.filter((vaga: ViewVagasModel) => {
            const descricaoFiltro = vaga.descricao.toLowerCase().includes(filtro.toLowerCase());
            const dataFiltro = vaga.datelimite.toLowerCase().includes(filtro.toLowerCase());
            const vagaFiltro = vaga.vaga.toLowerCase().includes(filtro.toLowerCase());
            return descricaoFiltro || dataFiltro || vagaFiltro;
        });
    };
    const vagasFiltradasAtivas = filtrarVagas(recordsData.ativas, filtro);
    const vagasFiltradasEncerradas = filtrarVagas(recordsData.encerradas, filtro);


    const [modalOpenDescricao, setModalOpenDescricao] = useState(false);
    const [descricaoVaga, setDescricaoVaga] = useState('');

    const abrirModalDescricaoVaga = (descricaoVaga: string) => {
        setDescricaoVaga(descricaoVaga);
        setModalOpenDescricao(true);
    };

    const [sortable, setSortable] = useState<Sortable[]>([]);
    const [modalOpenSortable, setModalOpenSortable] = useState(false);

    const abrirModalSortable = (sortable: Sortable[]) => {
        setSortable(sortable);
        setModalOpenSortable(true);
    };


    return {
    filtro,
    setFiltro,
    viewType,
    setViewType,
    col,
    isRtl,
    vagasFiltradasAtivas,
    vagasFiltradasEncerradas,
    modalOpenDescricao,
    setModalOpenDescricao,
    descricaoVaga,
    setDescricaoVaga,
    abrirModalDescricaoVaga,
    sortable,
    setSortable,
    modalOpenSortable,
    setModalOpenSortable,
    abrirModalSortable,
    };
};

export default useListVagas;

