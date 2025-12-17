import { useStore } from '@/presentation/Login/store/useStore';
import { HttpStatusCode } from '@/data/protocols/http/http-client';
import { makeRemoteEmailExists } from '@/main/factories/usecases/login/remote-exists-login-factory';

export const useEmailExist = () => {
    const { emailUsuarioState, setEmailUsuarioState, setModalState } = useStore();

    const handleEmailSubmission = async (email: string | null) => {
        const emailExistsRepository = makeRemoteEmailExists(email);
        try {
            const result = await emailExistsRepository.email({email: emailUsuarioState});

            if (result && result.status) {
                switch (result.status) {
                    case HttpStatusCode.ok:
                        setModalState('password')
                        setEmailUsuarioState(email);
                        break;
                    case HttpStatusCode.created:
                        setModalState('registration');
                        break;
                    case HttpStatusCode.accepted:
                        setModalState('register');
                        break;
                    case HttpStatusCode.notFound:
                        setModalState('confirmLogin');
                        break;
                    case HttpStatusCode.passwordError:
                        setModalState('register');
                        break;
                    default:
                        setModalState(null);
                }
            } else {
                setModalState(null);
            }
        } catch (error: any) {
            console.error('Failed to verify email:', error);
            throw error;
        }
    };

    return {
        handleEmailSubmission,
        emailUsuario: emailUsuarioState,
        setEmailUsuario: setEmailUsuarioState
    }
}
