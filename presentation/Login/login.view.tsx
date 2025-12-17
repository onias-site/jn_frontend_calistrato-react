import { useStore } from "@/presentation/Login/store/useStore";
import { ModalConfirmEmail } from "./components/modal-confirm-email";
import { ModalExistsEmail } from "./components/modal-exists-email";
import { ModalPassword } from "./components/modal-password";
import { ModalQuestionsAndAnswers } from "./components/modal-questions-and-answers";
import { ModalSavePasswordToken } from "./components/modal-save-password-token";



export const LoginView= () => {

    const modal = useStore(state => state.modalState)
  return (
    <div>
      {modal === 'login' && <ModalExistsEmail  />}
      {modal === 'confirmLogin' && <ModalConfirmEmail />}
      {modal === 'register' && <ModalSavePasswordToken />}
      {modal === 'registration' && <ModalQuestionsAndAnswers />}
      {modal === 'password' && <ModalPassword />}

    </div>
  );
}
