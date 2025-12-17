// store.ts
import create from 'zustand';

interface StoreState {
obrigatorios: any[];
desejaveis: any[];
setObrigatorios: (obrigatorios: any[]) => void;
setDesejaveis: (desejaveis: any[]) => void;
moverParaDesejaveis: (item: any) => void;
moverParaObrigatorios: (item: any) => void;
removerDaListaObrigatorios: (id: number) => void;
removerDaListaDesejaveis: (id: number) => void;
}

const useFiltroRequisitosStore = create<StoreState>((set, get) => ({
    obrigatorios: [],
    desejaveis: [],
    setObrigatorios: (obrigatorios) => set({ obrigatorios }),
    setDesejaveis: (desejaveis) => set({ desejaveis }),
    moverParaDesejaveis: (item: any) => {
        const { obrigatorios, desejaveis } = get();
        set({
            obrigatorios: obrigatorios.filter(i => i.id !== item.id),
            desejaveis: [...desejaveis, item]
        });
    },
    moverParaObrigatorios: (item: any) => {
        const { obrigatorios, desejaveis } = get();
        set({
            desejaveis: desejaveis.filter(i => i.id !== item.id),
            obrigatorios: [...obrigatorios, item]
        });
    },
    removerDaListaObrigatorios: (id) => set((state) => ({
        obrigatorios: state.obrigatorios.filter(item => item.id !== id)
    })),
    removerDaListaDesejaveis: (id) => set((state) => ({
        desejaveis: state.desejaveis.filter(item => item.id !== id)
    }))
}));

export default useFiltroRequisitosStore;

