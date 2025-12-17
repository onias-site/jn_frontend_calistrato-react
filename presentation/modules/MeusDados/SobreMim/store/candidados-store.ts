// store.ts
import { create } from 'zustand';

export interface ICandidatoStore {
    stepper: number;
    setStepper: (step: number) => void;
    idCandidato: string;
    setIdCandidato: (id: string) => void;
    minPretensaoPJ: string;
    setMinPretensaoPJ: (min: string) => void;
    maxPretensaoPJ: string;
    setMaxPretensaoPJ: (max: string) => void;
    minPretensaoCLT: string;
    setMinPretensaoCLT: (min: string) => void;
    maxPretensaoCLT: string;
    setMaxPretensaoCLT: (max: string) => void;
}

const CandidatosStore = create<ICandidatoStore>((set) => ({
    stepper: 1,
    setStepper: (step: number) => set({ stepper: step }),
    idCandidato: '',
    setIdCandidato: (id: string) => set((state) => {
        if (state.idCandidato !== id) {
          return { idCandidato: id };
        }
        return state;
      }),
    minPretensaoPJ: '',
    setMinPretensaoPJ: (min: string) => set({ minPretensaoPJ: min }),
    maxPretensaoPJ: '',
    setMaxPretensaoPJ: (max: string) => set({ maxPretensaoPJ: max }),
    minPretensaoCLT: '',
    setMinPretensaoCLT: (min: string) => set({ minPretensaoCLT: min }),
    maxPretensaoCLT: '',
    setMaxPretensaoCLT: (max: string) => set({ maxPretensaoCLT: max }),
}));



export default CandidatosStore;

