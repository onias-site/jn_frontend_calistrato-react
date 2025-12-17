import { HttpStatusCode } from "@/data/protocols/http/http-client";
import { setCurrentAccountAdapter } from "@/main/adapters";
import { makeRemoteAuthentication } from "@/main/factories/usecases/login/remote-authentication-factory";
import { useStore } from "@/presentation/Login/store/useStore";

export const usePassword = () => {
    const {
        setModalState,
        emailUsuarioState,
        setAccessTokenState,
        setUserState
    } = useStore();

    const handlePasswordSubmission = async (password: string) => {
        const authRepository = makeRemoteAuthentication(emailUsuarioState);
        try {
            const response = await authRepository.login({password: password});
            if (response.data && typeof response.data === 'object') {

                if(response.status === HttpStatusCode.lockedPassword) {
                    setModalState('register');
                }

                const { sessionToken } = response.data;
                if (sessionToken) {
                    setCurrentAccountAdapter({ sessionToken: sessionToken, user: emailUsuarioState });
                    setAccessTokenState(sessionToken);
                    setUserState(emailUsuarioState);
                    setModalState(null);
                } else {
                    console.error('O token de acesso não foi retornado corretamente pela API.');
                }
            }
        } catch (error) {
            console.error('Failed to verify email:', error);
            throw error;
        }
    };

    return {
        handlePasswordSubmission,
        setModal: setModalState
    }
}
