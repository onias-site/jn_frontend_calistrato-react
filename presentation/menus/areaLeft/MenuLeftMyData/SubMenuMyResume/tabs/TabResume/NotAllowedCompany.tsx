import React from 'react';
import { create } from 'zustand';
import { AutoComplete } from 'primereact/autocomplete';
import JnAjax from '@/app/JnAjax'

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


    const filtrarEmpresas = (event: any) => {
        const httpResponses = {};
        httpResponses[200] = (response:any) => setFilteredCompanies(response.companies);
        JnAjax.doAnAjaxRequest('companies/search/autocomplete/'+ event.query, httpResponses,'GET', {},  {}, 'http://localhost:8081');
    }


    return (
        <AutoComplete
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
