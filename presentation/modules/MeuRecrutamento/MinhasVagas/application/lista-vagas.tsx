'use client';
import Link from 'next/link';
import Tippy from '@tippyjs/react';
import { DataTable } from 'mantine-datatable';
import { ViewVagasModel } from '@/domain/models/view-vagas-model';
import Modal from '@/presentation/modules/MeusDados/SobreMim/application/components/modal-composition';
import { exportTable } from '@/presentation/utils/export-table';
import Dropdown from '@/presentation/utils/dropdown';
import formatDate from '@/presentation/utils/format-date';
import usePagination from '../../../../components/meu-recrutamento/minhas-vagas/hooks/usePagination';
import useSort from '../../../../components/meu-recrutamento/minhas-vagas/hooks/useSort';
import useListVagas from '../../../../components/meu-recrutamento/minhas-vagas/hooks/useListVagas';
import { IconLayoutGrid, IconListCheck, IconPencil, IconTrashLines, IconNotesEdit, IconFolderPlus, IconUsersGroup, IconNotes, IconFile, IconCircleCheck, IconPrinter } from '@/presentation/icons';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InativarVagasModel } from '@/domain/models/inativar-vagas-model';
import { makeRemoteDeletarVagas } from '@/main/factories/usecases/vagas/remote-deletar-vagas-factory';
import { makeRemoteInativarVagas } from '@/main/factories/usecases/vagas/remote-inativar-vagas-factory';
import IconMinusCircle from '@/presentation/icons/icon-minus-circle';
import IconPlusCircle from '@/presentation/icons/icon-plus-circle';
import { useRouter } from 'next/navigation';
import IconArrowBackward from '@/presentation/icons/icon-arrow-backward';
import { useStepperStore } from '../infra/store/stepper-store';

interface ListaVagasProps {
    vagas: ViewVagasModel[];
    tipo: 'ativas' | 'encerradas';
}

const ListaDeVagas: React.FC<ListaVagasProps> = ({ tipo }) => {
    const { page, setPage, pageSize, setPageSize, PAGE_SIZES } = usePagination();
    const { sortStatus, setSortStatus } = useSort();
    const {
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
        abrirModalDescricaoVaga,
        sortable,
        modalOpenSortable,
        setModalOpenSortable,
        abrirModalSortable,
    } = useListVagas();
    const records = tipo === 'ativas' ? vagasFiltradasAtivas : vagasFiltradasEncerradas;

    const [modalAction, setModalAction] = useState<'inativar' | 'deletar' | 'ativar' | null>(null);
    const [openModal, setOpenModal] = useState(false);
    const [idVaga, setIdVaga] = useState<string>('');

    const queryClient = useQueryClient();
    const mutationKey = ['inativarVaga', 'deletarVaga'];

    const inativarVaga = async (idVaga: string): Promise<InativarVagasModel> => {
        const inativar = makeRemoteInativarVagas(idVaga);
        return await inativar.inativarVaga({ idVaga });
    };

    const inativarVagaMutation = useMutation({
        mutationKey,
        mutationFn: inativarVaga,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vagas'] });
            setOpenModal(false);
        },
        onError: (error: InativarVagasModel) => {
            console.error('Erro ao excluir vaga:', error);
            setOpenModal(false);
        },
    });

    const deletarVaga = async (idVaga: string): Promise<InativarVagasModel> => {
        const deletar = makeRemoteDeletarVagas(idVaga);
        return await deletar.deleteVaga({ idVaga });
    };

    const deletarVagaMutation = useMutation({
        mutationKey,
        mutationFn: deletarVaga,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vagas'] });
            setOpenModal(false);
        },
        onError: (error: InativarVagasModel) => {
            console.error('Erro ao excluir vaga:', error);
            setOpenModal(false);
        },
    });

    const handleOpenModal = (id: string, action: 'inativar' | 'deletar' | 'ativar') => {
        setIdVaga(id);
        setModalAction(action);
        setOpenModal(true);
    };

    const handleConfirmAction = () => {
        if (modalAction === 'inativar') {
            inativarVagaMutation.mutate(idVaga);
        } else if (modalAction === 'deletar') {
            deletarVagaMutation.mutate(idVaga);
        }
    };

    const modalMessages = {
        inativar: {
            title: 'Confirmar Inativação Vaga',
            content: 'Tem certeza que deseja inativar esta vaga?',
        },
        deletar: {
            title: 'Confirmar Deletar Vaga',
            content: 'Tem certeza que deseja deletar esta vaga permanentemente?',
        },
        ativar: {
            title: 'Confirmar Ativação Vaga',
            content: 'Tem certeza que deseja ativar esta vaga?',
        },
    };

    const modalTitle = modalAction ? modalMessages[modalAction].title : '';
    const modalContent = modalAction ? modalMessages[modalAction].content : '';

    const currentDate = new Date();
    const { goToStep } = useStepperStore();
    const getTitulo = () => {
        return tipo === 'ativas' ? 'Lista de Vagas Ativas' : 'Lista de Vagas Encerradas';
      };

      const getDescricao = () => {
        if (tipo === 'ativas') {
          return 'Aqui está a lista de vagas ativas que encontramos com base na sua pesquisa.';
        } else {
          return 'Aqui está a lista de vagas encerradas que encontramos com base na sua pesquisa.';
        }
      };

    return (
        <div className="w-full">
        <div>
        <button
          onClick={() => goToStep(0)}
          className="w-20 flex items-center text-suflex text-base font-bold space-x-2 whitespace-nowrap group hover:text-suflex-black"
        >
          <IconArrowBackward className="h-4 w-4 current-color group-hover:text-suflex-black" />
          <span className="font-bold text-base">Voltar</span>
        </button>
      </div>
      <div className="flex justify-between items-start mt-[12px]">
        <div>
          <p className="text-[24px] font-barlow leading-[32px] tracking-tight font-bold text-gray-900">
          {getTitulo()}
          </p>
          <p className="text-[14px] mt-[12px] font-barlow leading-[24px] font-normal text-gray-500">
          {getDescricao()}
          </p>

        </div>
      </div>
        <div className="panel mt-6 ">
            <div className="mb-4.5 flex flex-col justify-between gap-5 md:flex-row md:items-center">
                <div className="flex w-full flex-wrap items-center">
                    <Link href="/meu-recrutamento/minhas-vagas/nova-vaga">
                        <button type="button" className="btn btn-primary btn-sm m-1">
                            <IconCircleCheck className="ltr:mr-2 rtl:ml-2" />
                            Nova Vaga
                        </button>
                    </Link>
                    <div className="inline-flex">
                        <button className="btn btn-primary ltr:rounded-r-none rtl:rounded-l-none">Exportar</button>
                        <div className="dropdown">
                            <Dropdown
                                placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                btnClassName="btn dropdown-toggle btn-primary ltr:rounded-l-none rtl:rounded-r-none border-l-[#4468fd] before:border-[5px] before:border-l-transparent before:border-r-transparent before:border-t-inherit before:border-b-0 before:inline-block before:border-t-white-light h-full"
                                button={<span className="sr-only">Toggle dropdown</span>}
                            >
                                <ul className="!min-w-[170px]">
                                    <li>
                                        <button type="button" onClick={() => exportTable('csv', col, records)}>
                                            <IconFile className="h-5 w-5 ltr:mr-2 rtl:ml-2" />
                                            Exportar CSV
                                        </button>
                                    </li>
                                    <li>
                                        <button type="button" onClick={() => exportTable('print', col, records)}>
                                            <IconPrinter className="ltr:mr-2 rtl:ml-2" />
                                            Imprimir
                                        </button>
                                    </li>
                                </ul>
                            </Dropdown>
                        </div>
                    </div>
                </div>
                <div className="flex flex-row gap-4">
                    <div className="flex flex-row gap-1">
                        <button type="button" className={`btn btn-outline-primary p-2 ${viewType === 'grid' && 'bg-primary text-white'}`} onClick={() => setViewType('grid')}>
                            <IconLayoutGrid />
                        </button>
                        <button type="button" className={`btn btn-outline-primary p-2 ${viewType === 'list' && 'bg-primary text-white'}`} onClick={() => setViewType('list')}>
                            <IconListCheck />
                        </button>
                    </div>

                    <input type="text" className="form-input w-auto" placeholder="Filtro..." value={filtro} onChange={(e) => setFiltro(e.target.value)} />
                </div>
            </div>

            {viewType === 'list' && (
                <div className="datatables">
                    <DataTable
                        highlightOnHover
                        className="table-hover whitespace-nowrap"
                        records={records}
                        columns={[
                            { accessor: 'vaga', sortable: true },
                            {
                                accessor: 'descricao',
                                title: 'Descrição',
                                sortable: true,
                                render: ({ descricao }) => (
                                    <div className="flex flex-row">
                                        {descricao.substring(0, 80)}...
                                        <h3 className="cursor-pointer font-extrabold text-primary" onClick={() => abrirModalDescricaoVaga(descricao)}>
                                            Ver Mais
                                        </h3>
                                    </div>
                                ),
                            },
                            {
                                accessor: 'datelimite',
                                title: 'Data Limite',
                                sortable: true,
                                render: ({ datelimite }) => <div>{formatDate(datelimite)}</div>,
                            },
                            {
                                accessor: 'action',
                                title: 'Ações',
                                sortable: false,
                                textAlignment: 'center',
                                render: ({ id }) => (
                                    <div className="mx-auto flex w-max items-center gap-4">
                                        <Tippy content="Ver currículos" delay={[1000, 0]}>
                                            <Link href="/meu-recrutamento/minhas-vagas/curriculo" className="flex hover:text-info">
                                                <IconNotesEdit className="h-4.5 w-4.5" />
                                            </Link>
                                        </Tippy>
                                        <Tippy content="Editar vaga" delay={[1000, 0]}>
                                            <Link href={`/meu-recrutamento/minhas-vagas/editar/${id}`} className="flex hover:text-primary">
                                                <IconPencil />
                                            </Link>
                                        </Tippy>
                                        {tipo === 'ativas' ? (
                                            <Tippy content="Inativar Vaga" delay={[1000, 0]}>
                                                <button onClick={() => handleOpenModal(id, 'inativar')} type="button" className="flex hover:text-danger">
                                                    <IconMinusCircle />
                                                </button>
                                            </Tippy>
                                        ) : (
                                            <Tippy content="Ativar Vaga" delay={[1000, 0]}>
                                                <button onClick={() => handleOpenModal(id, 'ativar')} type="button" className="flex hover:text-success">
                                                    <IconPlusCircle />
                                                </button>
                                            </Tippy>
                                        )}
                                        <Tippy content="Deletar Vaga" delay={[1000, 0]}>
                                            <button onClick={() => handleOpenModal(id, 'deletar')} type="button" className="flex hover:text-danger">
                                                <IconTrashLines />
                                            </button>
                                        </Tippy>
                                    </div>
                                ),
                            },
                        ]}
                        totalRecords={records.length}
                        recordsPerPage={pageSize}
                        page={page}
                        onPageChange={(p) => setPage(p)}
                        recordsPerPageOptions={PAGE_SIZES}
                        onRecordsPerPageChange={setPageSize}
                        sortStatus={sortStatus}
                        onSortStatusChange={setSortStatus}
                        minHeight={200}
                        paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                    />
                </div>
            )}
            {viewType === 'grid' && (
                <div className="mt-5 grid w-full grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {records.map((item: ViewVagasModel) => {
                        return (
                            <div className="relative overflow-hidden rounded-md bg-white text-center shadow dark:bg-[#1c232f]" key={item.id}>
                                <div className="relative overflow-hidden rounded-md bg-white text-center shadow dark:bg-[#1c232f]">
                                    <div className="rounded-t-md bg-white/40 bg-[url('/assets/images/notification-bg.png')] bg-cover bg-center p-6 pb-0"></div>
                                    <div className="relative -mt-10 px-6 pb-24">
                                        <div className={`h-64 rounded-md flex flex-col items-center justify-between bg-white px-2 py-6 shadow-md dark:bg-gray-900 `}>
                                            <div >
                                            <h3 className="flex h-[96px] items-center justify-center text-xl">{item.vaga}</h3>
                                            <span>Data Limite:</span>
                                            <div className={currentDate > new Date(item.datelimite + 'T00:00:00') ? 'text-danger' : 'text-info'}>
                                                {formatDate(new Date(item.datelimite + 'T00:00:00'))}
                                            </div>
                                            </div>

                                            <div className=''>
                                                <ul className="flex items-center justify-around space-x-4 rtl:space-x-reverse">
                                                    <li>
                                                        <button onClick={() => abrirModalDescricaoVaga(item.descricao)} type="button" className="btn btn-outline-primary h-7 w-7 rounded-full p-0">
                                                            <IconFolderPlus />
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <button type="button" className="btn btn-outline-primary h-7 w-7 rounded-full p-0">
                                                            <IconNotes />
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <button onClick={() => abrirModalSortable(item.sortable)} type="button" className="btn btn-outline-primary h-7 w-7 rounded-full p-0">
                                                            <IconListCheck />
                                                        </button>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                        <div className="relative mb-2 mt-6 grid grid-cols-1 gap-4 ltr:text-left rtl:text-right">
                                            <div className="flex items-center">
                                                <h2 className="flex-none ltr:mr-2 rtl:ml-2">Sistema da Vaga:</h2>
                                                <div className="flex flex-row items-center justify-between">
                                                    <p className="truncate text-white-dark">{item.remoto ? 'Remoto' : 'Hibrido'}</p>
                                                    <span className="badge badge-outline-info absolute right-3">{item.clt ? 'CLT' : 'PJ'}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <h2 className="flex-none ltr:mr-2 rtl:ml-2">Pretensão Salarial:</h2>
                                                <p className="text-white-dark">{item.pagamentoclt ? item.pagamentoclt : item.pagamentopj}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-4 flex w-full flex-col gap-2 p-6 ltr:left-0 rtl:right-0">
                                        <div className="flex flex-row gap-2">
                                            <div className="btn btn-outline-primary w-1/2">
                                                <Link href={`/meu-recrutamento/minhas-vagas/editar/${item.id}`} className="flex flex-row gap-2">
                                                    <IconNotesEdit className="h-4.5 w-4.5" />
                                                    Editar
                                                </Link>
                                            </div>
                                            <div className="btn btn-outline-success w-1/2">
                                                <Link href="/meu-recrutamento/minhas-vagas/curriculo" className="flex flex-row gap-1">
                                                    <IconUsersGroup className="h-4.5 w-4.5" />
                                                    Candidatos
                                                </Link>
                                            </div>
                                        </div>
                                        <div className="flex flex-row gap-2">
                                            {tipo === 'ativas' ? (
                                                <button onClick={() => handleOpenModal(item.id, 'inativar')} type="button" className="btn btn-outline-danger flex w-1/2 gap-2">
                                                    <IconMinusCircle />
                                                    Inativar
                                                </button>
                                            ) : (
                                                <button onClick={() => handleOpenModal(item.id, 'ativar')} type="button" className="btn btn-outline-success flex w-1/2 gap-2">
                                                    <IconPlusCircle />
                                                    Ativar
                                                </button>
                                            )}
                                            <button onClick={() => handleOpenModal(item.id, 'deletar')} type="button" className="btn btn-outline-danger flex w-1/2 gap-2">
                                                <IconTrashLines />
                                                Deletar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            <Modal isOpen={modalOpenDescricao} onClose={() => setModalOpenDescricao(false)} title="Descrição da vaga">
                <div className="max-h-[400px] min-h-[100px] overflow-auto p-5">{descricaoVaga}</div>
                <div className="flex items-center justify-end border-t border-[#ebe9f1] p-5 dark:border-white/10">
                    <button onClick={() => setModalOpenDescricao(false)} type="button" className="btn btn-outline-danger">
                        Fechar
                    </button>
                </div>
            </Modal>
            <Modal isOpen={modalOpenSortable} onClose={() => setModalOpenSortable(false)} title="Ordenar critérios candidatos">
                <div className="max-h-[400px] min-h-[100px] overflow-auto p-5">
                    <div className="mb-5">
                        <div className="gap-x-12 sm:grid-cols-2">
                            {sortable.map((item) => (
                                <div key={item.id} className="mb-2.5">
                                    <div className="items-md-center flex flex-col rounded-md border border-white-light bg-white px-6 py-3.5 text-center dark:border-dark dark:bg-[#1b2e4b] md:flex-row ltr:md:text-left rtl:md:text-right">
                                        <div className="flex flex-1 flex-col items-center justify-between md:flex-row">
                                            <div className="my-3 font-semibold md:my-0">
                                                <div className="text-base text-dark dark:text-[#bfc9d4]">{item.text}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-end border-t border-[#ebe9f1] p-5 dark:border-white/10">
                    <button onClick={() => setModalOpenSortable(false)} type="button" className="btn btn-outline-danger">
                        Fechar
                    </button>
                </div>
            </Modal>
            <Modal isOpen={openModal} onClose={() => setOpenModal(false)} title={modalTitle}>
                <div className="max-h-[400px] min-h-[100px] overflow-auto p-5">{modalContent}</div>
                <div className="flex items-center justify-end gap-4 border-t border-[#ebe9f1] p-5 dark:border-white/10">
                    <button onClick={handleConfirmAction} type="button" className="btn btn-outline-info">
                        Sim
                    </button>
                    <button onClick={() => setOpenModal(false)} type="button" className="btn btn-outline-danger">
                        Não
                    </button>
                </div>
            </Modal>
        </div>
        </div>
    );
};

export default ListaDeVagas;
