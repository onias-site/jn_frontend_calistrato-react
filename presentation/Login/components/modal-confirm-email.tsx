'use client';
import IconUser from '@/presentation/icons/icon-user';
import IconLoader from '@/presentation/icons/icon-loader';

import Modal from '@/presentation/modules/MeusDados/SobreMim/application/components/modal-composition';
import { useStore } from '../store/useStore';
import { useFormConfirmEmail } from '../validators/useFormConfirmEmail';



export const ModalConfirmEmail = () => {
    const modal = useStore(state => state.modalState);
    const setModal = useStore(state => state.setModalState);
    const { register, handleSubmit, errors, isSubmitting, handleFormSubmit } = useFormConfirmEmail();

    return (

            <Modal isOpen={modal === 'confirmLogin'} onClose={() => setModal(null)} title="Confirme o seu email">
            <form onSubmit={handleSubmit(handleFormSubmit)}>
                    <div className="relative mb-4">
                        <span className="absolute top-1/2 -translate-y-1/2 dark:text-white-dark ltr:left-3 rtl:right-3">
                            <IconUser className="h-5 w-5" />
                        </span>
                        <input
                        {...register('email')}
                            type="email"
                            placeholder="Email"
                            className="form-input ltr:pl-10 rtl:pr-10"
                            id="login_email"
                        />
                    </div>
                    {errors.email && <p className="text-red-600">{errors.email.message}</p>}
                    <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
                    {isSubmitting ? <IconLoader className="inline-block shrink-0 animate-[spin_2s_linear_infinite] align-middle ltr:mr-2 rtl:ml-2" /> : null}
                    Confirmar
                </button>
                </form>
                <div className="border-t border-[#ebe9f1] p-5 dark:border-white/10">
                <p className="text-center text-sm text-white-dark dark:text-white-dark/70">
                    <button onClick={() => setModal('login')} type="button" className="text-[#515365] hover:underline ltr:ml-1 rtl:mr-1 dark:text-white-dark">
                        Trocar de e-mail
                    </button>
                </p>
            </div>
            </Modal>

    );
};
