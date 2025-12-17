'use client';
import IconLockDots from '../../icons/icon-lock-dots';
import IconLoader from '@/presentation/icons/icon-loader';
import { PasswordStrengthIndicator } from '@/presentation/Login/validators/password-indicator';
import IconEye from '@/presentation/icons/icon-eye';
import { useFormSavePasswordToken } from '@/presentation/Login/validators/useFormSavePasswordToken';
import { useTogglePassword } from '@/presentation/Login/hooks/useTogglePassword';
import Modal from '@/presentation/modules/MeusDados/SobreMim/application/components/modal-composition';
import { useStore } from '@/presentation/Login/store/useStore';

export const ModalSavePasswordToken = () => {
    const { modalState, setModalState } = useStore();
    const { register, handleSubmit, watch, handleFormSubmit, errors, isSubmitting } = useFormSavePasswordToken();
    const password = watch('password', '');
    const { showPassword, togglePasswordVisibility } = useTogglePassword();

    return (
        <Modal isOpen={modalState === 'register'} onClose={() => setModalState(null)} title="Informe o token enviado por e-mail e crie uma senha">
            <form onSubmit={handleSubmit(handleFormSubmit)}>
                <div className="relative mb-4">
                    <span className="absolute top-1/2 -translate-y-1/2 dark:text-white-dark ltr:left-3 rtl:right-3">
                        <IconLockDots fill={true} />
                    </span>
                    <span className="absolute end-4 top-1/2 -translate-y-1/2 cursor-pointer" onClick={togglePasswordVisibility}>
                        {showPassword ? <IconEye /> : <IconEye />}
                    </span>
                    <input {...register('token')} type={showPassword ? "text" : "password"} placeholder="Token Enviado por E-mail" className="form-input ltr:pl-10 rtl:pr-10" id="token" />
                </div>
                {errors.token && <p className="text-red-500">{errors.token.message}</p>}
                <div className="relative mb-2">
                    <span className="absolute top-1/2 -translate-y-1/2 dark:text-white-dark ltr:left-3 rtl:right-3">
                        <IconLockDots fill={true} />
                    </span>
                    <span className="absolute end-4 top-1/2 -translate-y-1/2 cursor-pointer" onClick={togglePasswordVisibility}>
                        {showPassword ? <IconEye /> : <IconEye />}
                    </span>
                    <input {...register('password')} type={showPassword ? "text" : "password"} placeholder="Digite sua Senha" className="form-input ltr:pl-10 rtl:pr-10" id="password" />
                </div>
                {errors.password && <p className="text-red-500">{errors.password.message}</p>}
                <PasswordStrengthIndicator password={password} />
                <div className="relative mb-2">
                    <span className="absolute top-1/2 -translate-y-1/2 dark:text-white-dark ltr:left-3 rtl:right-3">
                        <IconLockDots fill={true} />
                    </span>
                    <span className="absolute end-4 top-1/2 -translate-y-1/2 cursor-pointer" onClick={togglePasswordVisibility}>
                        {showPassword ? <IconEye /> : <IconEye />}
                    </span>
                    <input {...register('confirmPassword')} type={showPassword ? "text" : "password"} placeholder="Confirmar Senha" className="form-input ltr:pl-10 rtl:pr-10" id="confirm_password" />
                </div>
                {errors.confirmPassword && <p className="text-red-500">{errors.confirmPassword.message}</p>}
                <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
                    {isSubmitting ? <IconLoader className="inline-block shrink-0 animate-[spin_2s_linear_infinite] align-middle ltr:mr-2 rtl:ml-2" /> : null}
                    Validar
                </button>
            </form>
            <div className="border-t border-[#ebe9f1] p-5 dark:border-white/10">
                <p className="text-center text-sm text-white-dark dark:text-white-dark/70">
                    Não recebeu o Token?
                    <button type="button" className="text-[#515365] hover:underline dark:text-white-dark ltr:ml-1 rtl:mr-1">
                        reenvie aqui
                    </button>
                </p>
            </div>
        </Modal>
    );
};
