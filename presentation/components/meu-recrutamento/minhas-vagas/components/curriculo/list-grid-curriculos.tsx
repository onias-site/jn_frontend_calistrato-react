import IconFolderPlus from '@/presentation/icons/icon-folder-plus';
import IconListCheck from '@/presentation/icons/icon-list-check';
import IconNotes from '@/presentation/icons/icon-notes';
import IconNotesEdit from '@/presentation/icons/icon-notes-edit';
import IconTrashLines from '@/presentation/icons/icon-trash-lines';
import IconUsersGroup from '@/presentation/icons/icon-users-group';
import formatDate from '@/presentation/utils/format-date';
import Link from 'next/link';
import { RowData } from '../../../../../interfaces/vagas';
import useListVagas from '../../hooks/useListVagas';
import Modal from '@/presentation/modules/MeusDados/SobreMim/application/components/modal-composition';
import { Curriculo } from '@/presentation/interfaces/curriculos';
import useListCurriculo from '../../hooks/useListCurriculo';


export const ListGridCurriculo = ({curriculo}: {curriculo: Curriculo[]}) => {

    const currentDate = new Date();
    const {abrirModalComRequesitos,
        listaRequisitos,
        modalOpen,setModalOpen} = useListCurriculo()

        const conteudo = listaRequisitos.map((requisitos) => <p>{requisitos}</p>);
    return (
        <>
            <div className="mt-5 grid w-full grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {curriculo.map((item: Curriculo) => {
                    return (
                        <div className="relative overflow-hidden rounded-md bg-white text-center shadow dark:bg-[#1c232f]" key={item.id}>
                            <div className="relative overflow-hidden rounded-md bg-white text-center shadow dark:bg-[#1c232f]">
                                <div className="rounded-t-md bg-white/40 bg-[url('/assets/images/notification-bg.png')] bg-cover bg-center p-6 pb-0"></div>
                                <div className="relative -mt-10 px-6 pb-24">
                                    <div className={`h-64 rounded-md bg-white px-2 py-6 shadow-md dark:bg-gray-900 md:py-4`}>
                                        <div className="h-8 text-xl">{item.nome}</div>
                                        <div className={`relative mt-10 flex-auto md:mt-4`}>
                                        <div className="h-12 text-xl">{item.email}</div>

                                            <div className="relative flex items-center justify-center">
                                                <div className={currentDate > new Date(item.dataVisAlt) ? 'text-danger' : 'text-info'}>{formatDate(item.dataVisAlt)}</div>
                                                {currentDate > new Date(item.dataVisAlt) && (
                                                    <div className="ml-2 cursor-pointer">
                                                        {/* <span className="badge badge-outline-danger absolute -bottom-1 right-2 md:right-12">Renovar</span> */}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-6 flex flex-wrap items-center justify-around gap-3">
                                            <div className="flex-auto">
                                                <div>Sobre o candidato</div>
                                            </div>
                                            <div className="flex-auto">
                                                <div>Requisitos</div>
                                            </div>
                                            {/* <div className="flex-auto">
                                                <div>Ordenação</div>
                                            </div> */}
                                        </div>
                                        <div className="mt-4">
                                            <ul className="flex items-center justify-around space-x-4 rtl:space-x-reverse">
                                                <li>
                                                    <button  type="button" className="btn btn-outline-primary h-7 w-7 rounded-full p-0">
                                                        <IconFolderPlus />
                                                    </button>
                                                </li>
                                                {/* <li>
                                                    <button type="button" className="btn btn-outline-primary h-7 w-7 rounded-full p-0">
                                                        <IconNotes />
                                                    </button>
                                                </li> */}
                                                <li>
                                                    <button onClick={() => abrirModalComRequesitos(item.requesitosDesejaveis)}  type="button" className="btn btn-outline-primary h-7 w-7 rounded-full p-0">
                                                        <IconListCheck />
                                                    </button>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="relative mb-2 mt-6 grid grid-cols-1 gap-4 ltr:text-left rtl:text-right">
                                        <div className="flex items-center">
                                            <h2 className="flex-none ltr:mr-2 rtl:ml-2">Preferência por Vaga:</h2>
                                            <div className="flex flex-row items-center justify-between">
                                                <p className="truncate text-white-dark">{item.tipo ? 'Remoto' : 'Hibrido'}</p>
                                                <span className="badge badge-outline-info absolute right-3 flex flex-col justify-center"><p>Reputação</p> {item.reputacao}</span>
                                            </div>
                                        </div>
                                       <div className="flex items-center">
                                             <h2 className="flex-none ltr:mr-2 rtl:ml-2">Senioridade:</h2>
                                            <p className="text-white-dark">{item.senioridade}</p>
                                        </div>
                                         <div className="flex items-center">
                                             <h2 className="flex-none ltr:mr-2 rtl:ml-2">Experiência:</h2>
                                            <p className="text-white-dark">{item.experiencia}</p>
                                        </div>
                                        <div className="flex items-center">
                                            <h2 className="flex-none ltr:mr-2 rtl:ml-2">Pretensão Salarial:</h2>
                                            <p className="text-white-dark">{item.pretensoes}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute -bottom-4 flex w-full flex-col gap-2 p-6 ltr:left-0 rtl:right-0">
                                    <div className="flex flex-row gap-2">
                                        <div className="btn btn-outline-primary w-1/2">
                                            <Link href={`/meu-recrutamento/minhas-vagas/editar/${item.id}`} className="flex flex-row gap-2">
                                                <IconNotesEdit className="h-4.5 w-4.5" />
                                                Download
                                            </Link>
                                        </div>
                                        <button type="button" className="btn btn-outline-secondary flex w-1/2 gap-2">
                                            <IconNotesEdit />
                                            Avaliar
                                        </button>
                                    </div>
                                    <div>
                                        <Link href="/meu-recrutamento/minhas-vagas/curriculo" className="btn btn-outline-success flex w-full gap-2">
                                            <IconUsersGroup className="h-4.5 w-4.5" />
                                           Ver detalhes
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Descrição da vaga">
                <div className="max-h-[400px] min-h-[100px] overflow-auto p-5">{conteudo}</div>
                <div className="flex items-center justify-end border-t border-[#ebe9f1] p-5 dark:border-white/10">
                    <button onClick={() => setModalOpen(false)} type="button" className="btn btn-outline-danger">
                        Fechar
                    </button>
                </div>
            </Modal>
            {/* <Modal isOpen={modalOpenSortable} onClose={() => setModalOpenSortable(false)} title="Ordenar critérios candidatos">
                <div className="max-h-[400px] min-h-[100px] overflow-auto p-5">
                    <div className="mb-5">
                        <div className="gap-x-12 sm:grid-cols-2">
                            {sortable.map((sortableItem) => (
                                <div key={sortableItem.id} className="mb-2.5">
                                    <div className="items-md-center flex flex-col rounded-md border border-white-light bg-white px-6 py-3.5 text-center dark:border-dark dark:bg-[#1b2e4b] md:flex-row ltr:md:text-left rtl:md:text-right">
                                        <div className="flex flex-1 flex-col items-center justify-between md:flex-row">
                                            <div className="my-3 font-semibold md:my-0">
                                                <div className="text-base text-dark dark:text-[#bfc9d4]">{sortableItem.text}</div>
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
            </Modal> */}
        </>
    );
};
