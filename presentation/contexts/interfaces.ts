import { ViewVagasModel } from "@/domain/models/view-vagas-model";


export interface VagasContextType {
    recordsData: {
        ativas: ViewVagasModel[];
        encerradas: ViewVagasModel[];
    };

    findVagaById: (id: string) => ViewVagasModel | undefined;
}

export interface VagasProviderProps {
    children: React.ReactNode;
}
