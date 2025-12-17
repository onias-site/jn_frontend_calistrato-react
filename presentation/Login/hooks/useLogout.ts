import { setCurrentAccountAdapter } from "@/main/adapters";
import { makeRemoteLogout } from "@/main/factories/usecases/login/remote-logout-factory";
import { useStore } from "@/presentation/Login/store/useStore";
import { useRouter } from "next/navigation";

export const useLogout = () => {
    const {
        setAccessTokenState,
        setUserState,
        setModalState,
        emailUsuarioState
    } = useStore();
    const router = useRouter();

    const handleLogoutSubmission = async (email: string) => {
        const logoutRepository = makeRemoteLogout(email);
        try {
            if (emailUsuarioState) {
                await logoutRepository.logout({email: emailUsuarioState});
            }
        } catch (error) {
            console.error('Failed to logout:', error);
        } finally {
            setCurrentAccountAdapter(null);
            setAccessTokenState(undefined);
            setUserState(null);
            router.push('/');
        }
    };

    function closeModal() {
        setModalState(null);
    }

    return {
        handleLogoutSubmission,
        closeModal
    }
}
