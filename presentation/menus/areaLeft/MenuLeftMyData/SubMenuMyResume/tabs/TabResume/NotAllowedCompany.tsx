import React from 'react';
import { create } from 'zustand';
import { AutoComplete } from 'primereact/autocomplete';
import JnAjax from '@/app/JnAjax'

// o tamanho máximo que o servidor aceita no texto buscado pelo autocomplete (o mesmo de cada empresa gravada)
const COMPANY_SEARCH_MAX_LENGTH = 50;

export interface NotAllowedCompanyProps {
    setNotAllowedCompany: (value: any) => void;
    notAllowedCompany: [];
    invalid: boolean;
}

export interface INotAllowedCompanyStore {
    setFilteredCompanies: (filteredCompanies: []) => void;
    filteredCompanies: [];
}
export const NotAllowedCompanyStore = create<INotAllowedCompanyStore>((set) => ({
    setFilteredCompanies: (filteredCompanies: []) => set({ filteredCompanies }),
    filteredCompanies: [],
}));

export const NotAllowedCompany: React.FC<NotAllowedCompanyProps> = ({ invalid, notAllowedCompany, setNotAllowedCompany }) => {
    const { filteredCompanies, setFilteredCompanies } = NotAllowedCompanyStore((state: INotAllowedCompanyStore) => ({ ...state }));


    // acima do limite do servidor (o campo search aceita até 50 caracteres) não há empresa a sugerir: sem isto, a recusa
    // dele (422) aparecia ao usuário como aviso cru, em inglês; o formulário já diz que a empresa passou do tamanho
    const filtrarEmpresas = (event: any) => {
        if (event.query.trim().length > COMPANY_SEARCH_MAX_LENGTH) {
            setFilteredCompanies([]);
            return;
        }
        const httpResponses = {};
        httpResponses[200] = (response:any) => setFilteredCompanies(response.companies);
        JnAjax.doAnAjaxRequest('companies/search/autocomplete/'+ event.query, httpResponses,'GET', {},  {}, 'http://localhost:8081');
    }


    // Enter adiciona o texto digitado como empresa, esteja ou não na lista de sugestões (até 2026-10-14 só o clique na
    // sugestão adicionava). Ao escolher uma sugestão com Enter, o componente já limpou o campo e aqui não sobra texto.
    const adicionarEmpresaDigitada = (e: any) => {
        if (e.key !== 'Enter') {
            return;
        }
        const empresaDigitada = (e.target.value || '').trim();
        if (empresaDigitada.length < 3) {
            return;
        }
        const empresas: string[] = notAllowedCompany || [];
        const jaAdicionada = empresas.some((empresa: string) => empresa.toUpperCase() == empresaDigitada.toUpperCase());
        e.target.value = '';
        if (jaAdicionada) {
            return;
        }
        setNotAllowedCompany([...empresas, empresaDigitada]);
    };

    return (
        <AutoComplete
            onKeyUp={adicionarEmpresaDigitada}
        id = "notAllowedCompany"
        minLength={3}
        multiple={true}
        invalid={invalid}
            className="form-input"
            style={{ width: '75%' }}
            value={notAllowedCompany}
            suggestions={filteredCompanies}
            completeMethod={filtrarEmpresas}
            onChange={(e: any) => setNotAllowedCompany(e.value)}
        />
    );
};
