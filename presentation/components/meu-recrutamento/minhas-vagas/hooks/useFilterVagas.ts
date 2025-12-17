import { useState, useCallback, useRef } from 'react';
import { ViewVagasModel } from "@/domain/models/view-vagas-model";

const useFilterVagas = () => {
    const [search, setSearch] = useState('');
    const searchRef = useRef(search);
    searchRef.current = search;

    const filterVagas = useCallback((vagas: ViewVagasModel[]) => {
        return vagas.filter(vaga => {
            return (
                vaga.id.toString().toLowerCase().includes(searchRef.current.toLowerCase()) ||
                vaga.vaga.toLowerCase().includes(searchRef.current.toLowerCase()) ||
                vaga.descricao.toLowerCase().includes(searchRef.current.toLowerCase()) ||
                vaga.datelimite.toLowerCase().includes(searchRef.current.toLowerCase())
            );
        });
    }, []); // Removido search das dependências

    return { search, setSearch, filterVagas };
};
export default useFilterVagas;

