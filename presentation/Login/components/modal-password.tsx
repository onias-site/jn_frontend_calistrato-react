'use client'
import IconLockDots from "../../icons/icon-lock-dots";
import IconLoader from "../../icons/icon-loader";
import IconEye from "@/presentation/icons/icon-eye";
import { useTogglePassword } from "@/presentation/Login/hooks/useTogglePassword";
import Modal from "@/presentation/modules/MeusDados/SobreMim/application/components/modal-composition";
import { useStore } from "../store/useStore";
import { useSendTokenLanguage } from "@/presentation/Login/hooks/useSendTokenLanguage";
import { useFormPassword } from "../validators/useFormPassword";

export const ModalPassword = () => {
    const { modalState, setModalState, emailUsuarioState } = useStore();
    const { register, handleSubmit, errors, isSubmitting, handleFormSubmit } = useFormPassword();
    const { showPassword, togglePasswordVisibility } = useTogglePassword();
    const { handleTokenLanguageSubmission } = useSendTokenLanguage();

    return (
      <Modal isOpen={modalState === 'password'} onClose={() => setModalState(null)} title="Password">
      <form onSubmit={handleSubmit(handleFormSubmit)}>
                <div className="relative mb-2">
                    <input {...register('password')} type={showPassword ? "text" : "password"} placeholder="Password" className="form-input ltr:pl-10 rtl:pr-10" id="login_password" />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2">
                        <IconLockDots fill={true} />
                    </span>
                    <span className="absolute end-4 top-1/2 -translate-y-1/2 cursor-pointer" onClick={togglePasswordVisibility}>
                        {showPassword ? <IconEye /> : <IconEye />}
                    </span>
                </div>
                {errors.password && <p className="text-red-500">{errors.password.message}</p>}
                <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                    <IconLoader className="inline-block shrink-0 animate-[spin_2s_linear_infinite] align-middle ltr:mr-2 rtl:ml-2" />
                ) : null}
                Login
            </button>
            </form>
            <div className="border-t border-[#ebe9f1] p-5 dark:border-white/10">
                <p className="text-center text-sm text-white-dark dark:text-white-dark/70">
                    Esqueceu a senha?
                    <button onClick={() => handleTokenLanguageSubmission(emailUsuarioState, 'portuguese')} type="button" className="text-[#515365] hover:underline ltr:ml-1 rtl:mr-1 dark:text-white-dark">
                        Cadastre uma nova aqui
                    </button>
                </p>
            </div>
      </Modal>
  )
}
