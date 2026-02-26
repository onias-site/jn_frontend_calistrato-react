'use client';

import IconUser from '@/presentation/icons/icon-user';
import Modal from '@/presentation/modules/MeusDados/SobreMim/application/components/modal-composition';
import { useStore } from '../store/useStore';
import { useFormEmail } from '../validators/useFormEmail';
import JnAjax from '@/app/JnAjax';
import React, { useState } from 'react';
import IconLoader from '@/presentation/icons/icon-loader';

export interface ModalExistsEmailProps {
    title: string
}



export const ModalExistsEmail: React.FC<ModalExistsEmailProps> = ({title}) => {
    const { register, handleSubmit, errors, isSubmitting, handleFormSubmit } = useFormEmail();
    const { modalState, setModalState } = useStore();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const sendEmailToBackEnd = () => {
        const callbacks = {};
        callbacks['setLoading'] = () => setLoading(true);
        callbacks['setNotLoading'] = () => setLoading(false);

        JnAjax.doAnAjaxRequest(`login/${email}/token`, callbacks, 'HEAD', {}, {}, 'http://localhost:8080');
    }


    return (
        <Modal isOpen={modalState === "login"} onClose={() => setModalState(null)} title={title || "Informe o seu e-mail"}>
                <form>
                    <div className="relative mb-4">
                        <div className="relative">
                            <span className="absolute top-1/2 -translate-y-1/2 dark:text-white-dark ltr:left-3 rtl:right-3">
                                <IconUser className="h-5 w-5" />
                            </span>
                            <input onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" className="form-input ltr:pl-10 rtl:pr-10"/>
                        </div>
                        {errors.email && <p className="text-red-600">{errors.email.message}</p>}
                    </div>
                    <button type="button" className="btn btn-primary w-full" onClick = {() => sendEmailToBackEnd()}>
                    {loading ? <IconLoader className="inline-block shrink-0 animate-[spin_2s_linear_infinite] align-middle ltr:mr-2 rtl:ml-2" /> : null}
                        Avançar
                    </button>
                </form>
                <div className="border-t border-[#ebe9f1] p-5 dark:border-white/10">
                    <p className="cursor-pointer text-center text-sm text-white-dark dark:text-white-dark/70">Informe o seu e-mail, mesmo que seja seu primeiro acesso</p>
                </div>
            </Modal>
    );
};
