import { ViewVagasModel } from '@/domain/models/view-vagas-model';
import { makeRemoteViewVagas } from '@/main/factories/usecases/vagas/remote-view-vagas-factory';
import { createContext, useContext, useEffect, useState } from 'react';
import usePagination from '../components/meu-recrutamento/minhas-vagas/hooks/usePagination';
import { useQuery } from '@tanstack/react-query';
import { VagasContextType, VagasProviderProps } from './interfaces';

export const VagasContext = createContext<VagasContextType | null>(null);
export const VagasProvider: React.FC<VagasProviderProps> = ({ children }) => {
    const { paginate } = usePagination();


    const { data, error} = useQuery({
        queryKey: ['vagas'],
        queryFn: async () => {
            const listaDeVagas = makeRemoteViewVagas();
            return listaDeVagas.findAll();
        }
    });

    const [recordsData, setRecordsData] = useState({
        ativas: [],
        encerradas: []
    });

    useEffect(() => {
        if (data) {
            const ativas = data.filter((item: ViewVagasModel) => item.status === 'ativo');
            const encerradas = data.filter((item: ViewVagasModel) => item.status === 'inativo');
            setRecordsData({
                ativas: paginate(ativas),
                encerradas: paginate(encerradas)
            });
        }
    }, [data]);


    if (error) {
        console.error(error, 'Erro ao buscar vagas');
    }

    const findVagaById = (id: string) => {
        return data?.find(vaga => vaga.id === id);
    };

    return <VagasContext.Provider value={{ recordsData, findVagaById}}>{children}</VagasContext.Provider>;
};

export const useVagas = () => {
    const context = useContext(VagasContext);
    if (!context) {
        throw new Error('useVagas must be used within a VagasProvider');
    }
    return context;
};

