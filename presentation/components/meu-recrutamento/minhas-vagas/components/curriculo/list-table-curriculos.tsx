import { DataTable } from 'mantine-datatable';
import formatDate from '@/presentation/utils/format-date';
import Tippy from '@tippyjs/react';
import Link from 'next/link';
import IconNotesEdit from '@/presentation/icons/icon-notes-edit';
import IconPencil from '@/presentation/icons/icon-pencil';
import IconTrashLines from '@/presentation/icons/icon-trash-lines';
import Modal from '@/presentation/modules/MeusDados/SobreMim/application/components/modal-composition';
import Dropdown from '@/presentation/utils/dropdown';
import IconStar from '@/presentation/icons/icon-star';
import IconLink from '@/presentation/icons/icon-link';
import IconEye from '@/presentation/icons/icon-eye';
import { IRootState } from '@/store';
import { useSelector } from 'react-redux';
import useListCurriculo from '../../hooks/useListCurriculo';
import { Curriculo } from '@/presentation/interfaces/curriculos';

const ListTableCurriculo = ({curriculos}: {curriculos: Curriculo[]}) => {

    const { abrirModalComRequesitos,
        listaRequisitos,
        modalOpen,setModalOpen,getRandomNumber,isRtl,menuLinks, initialRecords, pageSize, page,setSortStatus, sortStatus, setPageSize, setPage, PAGE_SIZES } =useListCurriculo()

        const conteudo = listaRequisitos.map((requisitos) => <p>{requisitos}</p>);
    return (
        <>
            <div className="datatables">
            <DataTable
                    highlightOnHover
                    className="table-hover whitespace-nowrap"
                    records={curriculos}
                    columns={[
                        { accessor: 'id', title: '#', sortable: true },
                        { accessor: 'email', sortable: true },
                        { accessor: 'pretensoes', sortable: true },
                        { accessor: 'tipo', sortable: true },
                        {
                            accessor: 'requesitosDesejaveis',
                            title: 'Requesitos Desejáveis',
                            sortable: true,
                            render: ({ requesitosDesejaveis }) => (
                                <div className="flex flex-row">
                                    {requesitosDesejaveis.join(', ').substring(0, 40)}...
                                    <h3 className="cursor-pointer font-extrabold text-primary" onClick={() => abrirModalComRequesitos(requesitosDesejaveis)}>
                                    {/* <h3 className="cursor-pointer font-extrabold text-primary" > */}

                                        Ver Mais
                                    </h3>
                                </div>
                            ),
                        },
                        {
                            accessor: 'reputacao',
                            title: 'Reputacao',
                            sortable: true,
                            titleClassName: '!text-center',
                            render: ({ id }) => (
                                <div className="flex items-center justify-center text-warning">
                                    {Array.from(Array(getRandomNumber(1, 5)).keys()).map((i) => {
                                        return <IconStar key={i + id} className=" fill-warning" />;
                                    })}
                                </div>
                            ),
                        },
                        {
                            accessor: 'dataVisAlt',
                            title: 'Data Limite',
                            sortable: true,
                            render: ({ dataVisAlt }) => <div>{formatDate(dataVisAlt)}</div>,
                        },
                        {
                            accessor: 'action',
                            title: 'Ações',
                            sortable: false,
                            textAlignment: 'center',
                            render: ({ id }) => (
                                <div className="mx-auto flex w-max items-center gap-4">
                                    <Tippy content="Links" delay={[1000, 0]}>
                                        <div className="dropdown">
                                            <Dropdown placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`} button={<IconLink className="h-5 w-5" />}>
                                                <ul className="!min-w-[170px]">
                                                    {menuLinks.map((link) => (
                                                        <li key={link}>
                                                            <button type="button">{link}</button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </Dropdown>
                                        </div>
                                    </Tippy>

                                    <Tippy content="Visualizar" delay={[1000, 0]}>
                                        <Link href={`/meu-recrutamento/minhas-vagas/curriculo/preview-candidato`} className="flex hover:text-primary">
                                            <IconEye />
                                        </Link>
                                    </Tippy>
                                    <Tippy content="Negativar" delay={[1000, 0]}>
                                        <button type="button" className="flex hover:text-danger">
                                            <IconTrashLines />
                                        </button>
                                    </Tippy>
                                    <Tippy content="Avaliar" delay={[1000, 0]}>
                                        <button type="button">
                                            <IconPencil  />
                                        </button>
                                    </Tippy>
                                </div>
                            ),
                        },
                    ]}
                    totalRecords={initialRecords.length}
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
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Descrição da vaga">
                <div className="max-h-[400px] min-h-[100px] overflow-auto p-5">{conteudo}</div>
                <div className="flex items-center justify-end border-t border-[#ebe9f1] p-5 dark:border-white/10">
                    <button onClick={() => setModalOpen(false)} type="button" className="btn btn-outline-danger">
                        Fechar
                    </button>
                </div>
            </Modal>
        </>
    );
};

export default ListTableCurriculo;
