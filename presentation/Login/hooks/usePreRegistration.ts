import { HttpStatusCode } from "@/data/protocols/http/http-client";
import { makeRemotePreRegistration } from "@/main/factories/usecases/login/remote-pre-registration-factory";
import { useStore } from "@/presentation/Login/store/useStore";
import { useSendTokenLanguage } from "./useSendTokenLanguage";

export const usePreRegistration = () => {
    const { setModalState, emailUsuarioState, setEmailUsuarioState } = useStore();
    const { handleTokenLanguageSubmission } = useSendTokenLanguage();

    const handleSavePreRegistrationSubmission = async (channel: string, goal: string) => {
        const preRegistrationRepository = makeRemotePreRegistration(emailUsuarioState);

        try {
            const result = await preRegistrationRepository.registration({ email: emailUsuarioState, channel, goal });
            if (result && result.status === HttpStatusCode.accepted) {
                handleTokenLanguageSubmission(emailUsuarioState, 'portuguese')
            } else {
                setModalState(null);
            }
        } catch (error) {
            console.error('Failed to verify email:', error);
            throw error;
        }
    };

    return {
        handleSavePreRegistrationSubmission,
        setEmailUsuario: setEmailUsuarioState
    }
}
