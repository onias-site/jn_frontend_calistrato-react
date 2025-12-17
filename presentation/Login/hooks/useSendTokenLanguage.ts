import { HttpStatusCode } from "@/data/protocols/http/http-client";
import { makeRemoteTokenLanguage } from "@/main/factories/usecases/login/remote-token-language-factory";
import { useStore } from "@/presentation/Login/store/useStore";

export const useSendTokenLanguage = () => {
    const { setModalState, emailUsuarioState, setEmailUsuarioState } = useStore();

    const handleTokenLanguageSubmission = async (email: string | null, language: string) => {
        const tokenLanguageRepository = makeRemoteTokenLanguage(email, language);

        try {
            const result = await tokenLanguageRepository.tokenLanguage({email: emailUsuarioState, language: language});

            if (result && result.status === HttpStatusCode.ok) {
                setModalState('register');
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
        handleTokenLanguageSubmission,
    }
}
