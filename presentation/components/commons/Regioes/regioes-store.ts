import { create } from 'zustand';


export interface IRegioesStore {
    regioesSelecionadas: any[]

    setRegioesSelecionadas: (regioesSelecionadas: any[]) => void

}

const RegioesStore = create<IRegioesStore> (set => ({
    regioesSelecionadas: [],

    setRegioesSelecionadas: (regioesSelecionadas: any[]) => set({regioesSelecionadas})
}));

export default RegioesStore;
