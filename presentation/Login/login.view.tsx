import { useStore } from "@/presentation/Login/store/useStore";
import { ModalConfirmEmail } from "./components/modal-confirm-email";
import { ModalExistsEmail } from "./components/modal-exists-email";
import { ModalPassword } from "./components/modal-password";
import { ModalQuestionsAndAnswers } from "./components/modal-questions-and-answers";
import { ModalSavePasswordToken } from "./components/modal-save-password-token";

export interface LoginViewProps {
    requestEmailTitle: string;
}


export const LoginView:  React.FC<LoginViewProps> = ({requestEmailTitle}) => {

    const modais = {
        login: <ModalExistsEmail  title = {requestEmailTitle}/>,
        confirmLogin: <ModalConfirmEmail />,
        register: <ModalSavePasswordToken />,
        registration: <ModalQuestionsAndAnswers />,
        password: <ModalPassword />
    };

    const modal = useStore(state => state.modalState)
  return (
    <div>
        {
            modais[modal]
        }
    </div>
  );
}
