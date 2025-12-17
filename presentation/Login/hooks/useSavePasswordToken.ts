import { setCurrentAccountAdapter } from "@/main/adapters";
    import { makeRemoteTokenPassword } from "@/main/factories/usecases/login/remote-token-password";
import { useStore } from "@/presentation/Login/store/useStore";

export const useSavePasswordToken = () => {

    const setModal = useStore(state => state.setModalState);
    const emailUsuario = useStore(state => state.emailUsuarioState);
    const setAccessToken = useStore(state => state.setAccessTokenState);
    const setUser = useStore(state => state.setUserState);

    const handleTokenPasswordSubmission = async (token: string, password: string, confirmPassword: string, emailUsuario: string) => {
        const tokenPasswordRepository = makeRemoteTokenPassword(emailUsuario);

        try {
            const response = await tokenPasswordRepository.tokenPassword({email: emailUsuario, token, password, confirmPassword});
            if (response.data && typeof response.data === 'object') {
                const { sessionToken } = response.data;

                if (sessionToken) {
                    setCurrentAccountAdapter({ sessionToken: sessionToken, user: emailUsuario });
                    setAccessToken(sessionToken);
                    setUser(emailUsuario);
                    setModal(null);
                } else {
                    console.error('O token de acesso não foi retornado corretamente pela API.');
                }
            }
        } catch (error) {
            console.error('Failed to verify email:', error);
            throw error;
        }
    };



    return{
        handleTokenPasswordSubmission,
    }
}
