import { Dialog, Transition } from '@headlessui/react';
import { Fragment, ReactNode } from 'react';
import IconX from '@/presentation/icons/icon-x';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    closeOnOverlayClick?: boolean;
}

const Modal = ({ isOpen, onClose, title, children,closeOnOverlayClick }: ModalProps) => {
    const handleOverlayClick = () => {
        if (closeOnOverlayClick) {
          onClose();
        }
      };
    return (
                <Transition appear show={isOpen} as={Fragment}>
                    <Dialog as="div" open={isOpen} onClose={closeOnOverlayClick ? onClose : () => {}}>
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0"  onClick={handleOverlayClick}/>
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
                                            <button type="button" className="text-white-dark hover:text-dark" onClick={onClose}>
                                                <IconX />
                                            </button>
                                        </div>
                                        <div className="p-5">{children}</div>
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </Dialog>
                </Transition>
    );
};

export default Modal;
