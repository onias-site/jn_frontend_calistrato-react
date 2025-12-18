import { create } from 'zustand';


export interface ICompaniesStore{
    allCompanies : [],
    selectedCompanies: null,
    filteredCompanies: null
}

const CompaniesStore = create<ICompaniesStore> (set => ({
    allCompanies : [],
    selectedCompanies: null,
    filteredCompanies: null,
    setAllCompanies : (allCompanies: any[]) => set({allCompanies}),
    setSelectedCompanies : (selectedCompanies: any[]) => set({selectedCompanies}),
    setFilteredCompanies : (filteredCompanies: any[]) => set({filteredCompanies})
}));

export default CompaniesStore;

