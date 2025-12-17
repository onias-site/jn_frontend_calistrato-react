import create from 'zustand';

type ModalType = 'login' | 'password' | 'register' | 'confirmLogin' | 'registration' | null;

interface AppState {
  modalState: ModalType;
  setModalState: (state: ModalType) => void;
  emailUsuarioState: string | null;
  setEmailUsuarioState: (email: string | null) => void;
  accessTokenState: string | undefined;
  setAccessTokenState: (token: string | undefined) => void;
  userState: string | null;
  setUserState: (user: string | null) => void;
}

export const useStore = create<AppState>((set) => ({
  modalState: null,
  setModalState: (state) => set({ modalState: state }),
  emailUsuarioState: "",
  setEmailUsuarioState: (email) => set({ emailUsuarioState: email }),
  accessTokenState: "",
  setAccessTokenState: (token) => set({ accessTokenState: token }),
  userState: null,
  setUserState: (user) => set({ userState: user }),
}));
