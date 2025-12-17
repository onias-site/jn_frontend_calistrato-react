'use client';
import IconX from '@/presentation/icons/icon-x';
import { Transition, Dialog } from '@headlessui/react';
import React, { Fragment} from 'react';

type VerMaisGenericProps = {
    modalOpen: boolean;
    setModalOpen: (open: boolean) => void;
    conteudoModal: any;
    title: string;
};

const VerMaisGeneric: React.FC<VerMaisGenericProps> = ({ modalOpen, setModalOpen, conteudoModal, title }) => {

    return (
            <div className="mb-5">
                <Transition appear show={modalOpen} as={Fragment}>
                    <Dialog as="div" open={modalOpen} onClose={() => setModalOpen(false)}>
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0" />
                        </Transition.Child>
                        <div className="fixed inset-0 z-[999] overflow-y-auto bg-[black]/60">
                            <div className="flex min-h-screen items-start justify-center px-4">
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-out duration-300"
                                    enterFrom="opacity-0 scale-95"
                                    enterTo="opacity-100 scale-100"
                                    leave="ease-in duration-200"
                                    leaveFrom="opacity-100 scale-100"
                                    leaveTo="opacity-0 scale-95"
                                >
                                    <Dialog.Panel as="div" className="panel my-8 w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                        <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                            <div className="text-lg font-bold">{title}</div>
                                            <button type="button" className="text-white-dark hover:text-dark" onClick={() => setModalOpen(false)}>
                                                <IconX />
                                            </button>
                                        </div>
                                        <div className="p-5 overflow-auto h-[300px]">
                                          <p>
                                            {conteudoModal}
                                            </p>
                                        </div>
                                            <div className="m-5 flex items-center justify-end">
                                                <button type="button" className="btn btn-outline-danger" onClick={() => setModalOpen(false)}>
                                                    Fechar
                                                </button>
                                            </div>
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </Dialog>
                </Transition>
            </div>
    );
};

export default VerMaisGeneric;
