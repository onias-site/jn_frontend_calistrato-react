import { HttpStatusCode } from "@/data/protocols/http/http-client";
import { makeRemoteConfirmEmail } from "@/main/factories/usecases/login/remote-confirm-email-factory";
import { useStore } from "@/presentation/Login/store/useStore";

export const useConfirmEmail = () => {
    const { setModalState, setEmailUsuarioState } = useStore();

    const handleConfirmEmailSubmission = async (email: string | null) => {
        const confirmEmailRepository = makeRemoteConfirmEmail(email);
        try {
            const result = await confirmEmailRepository.confirmEmail({email});

            if (result && result.status === HttpStatusCode.accepted) {
                setModalState('registration');
                setEmailUsuarioState(email);
            } else {
                setModalState(null);
            }
        } catch (error) {
            console.error('Failed to verify email:', error);
            throw error;
        }
    };

    return {
        handleConfirmEmailSubmission,
        setModal: setModalState
    }
}
