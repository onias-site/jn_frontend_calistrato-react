'use client';
import React, { useState } from 'react';
import { create } from 'zustand';
import { TagsInput } from '@mantine/core';
import JnAjax from '@/app/JnAjax'

// o tamanho máximo que o servidor aceita no texto buscado pelo autocomplete (o mesmo de cada empresa gravada)
const COMPANY_SEARCH_MAX_LENGTH = 50;
// a partir de quantos caracteres digitados as sugestões são buscadas
const COMPANY_SEARCH_MIN_LENGTH = 3;

export interface NotAllowedCompanyProps {
    setNotAllowedCompany: (value: any) => void;
    notAllowedCompany: string[];
    invalid: boolean;
}

export interface INotAllowedCompanyStore {
    setFilteredCompanies: (filteredCompanies: string[]) => void;
    filteredCompanies: string[];
}
export const NotAllowedCompanyStore = create<INotAllowedCompanyStore>((set) => ({
    setFilteredCompanies: (filteredCompanies: string[]) => set({ filteredCompanies }),
    filteredCompanies: [],
}));

/**
 * As empresas que não podem receber o linkedin, como etiquetas: ao digitar, as sugestões (os domínios dos recrutadores) vêm
 * do backend; Enter (ou sair do campo) adiciona o texto digitado, esteja ou não entre as sugestões. Desde 2026-11-11 cada
 * etiqueta precisa ser um domínio (consultoria.com.br): enquanto houver uma que não seja, o formulário acusa o erro embaixo
 * do campo e não deixa avançar (validateResume, em FormResume.tsx).
 */
export const NotAllowedCompany: React.FC<NotAllowedCompanyProps> = ({ invalid, notAllowedCompany, setNotAllowedCompany }) => {
    const { filteredCompanies, setFilteredCompanies } = NotAllowedCompanyStore((state: INotAllowedCompanyStore) => ({ ...state }));
    // o campo não deixa digitar além de 50 caracteres; ao chegar lá, o aviso diz por que o texto parou (até 2026-11-10 o
    // nome era cortado sem aviso e entrava assim, R04-3)
    const [reachedTheLimit, setReachedTheLimit] = useState(false);

    // acima do limite do servidor (o campo search aceita até 50 caracteres) não há empresa a sugerir: sem isto, a recusa
    // dele (422) aparecia ao usuário como aviso cru, em inglês; o formulário já diz que a empresa passou do tamanho
    const filtrarEmpresas = (query: string) => {
        setReachedTheLimit(query.length >= COMPANY_SEARCH_MAX_LENGTH);
        const texto = query.trim();
        if (texto.length < COMPANY_SEARCH_MIN_LENGTH || texto.length > COMPANY_SEARCH_MAX_LENGTH) {
            setFilteredCompanies([]);
            return;
        }
        const httpResponses: any = {};
        httpResponses[200] = (response: any) => setFilteredCompanies(response.companies || []);
        // a busca de sugestões não mostra a capa de carregamento: ela roda a cada tecla
        httpResponses['setLoading'] = () => {};
        httpResponses['setNotLoading'] = () => {};
        JnAjax.doAnAjaxRequest('companies/search/autocomplete/' + texto, httpResponses, 'GET', {}, {}, 'http://localhost:8081');
    };

    // repetidas (ignorando maiúsculas) viram uma só
    const setCompanies = (values: string[]) => {
        const companies: string[] = [];
        values.forEach((value) => {
            const company = (value || '').trim();
            const repeated = companies.some((item) => item.toUpperCase() == company.toUpperCase());
            company && !repeated && companies.push(company);
        });
        setNotAllowedCompany(companies);
    };

    return (
        <TagsInput
            id="notAllowedCompany"
            value={notAllowedCompany || []}
            onChange={setCompanies}
            data={filteredCompanies}
            onSearchChange={filtrarEmpresas}
            error={reachedTheLimit ? `Cada empresa / consultoria pode ter no máximo ${COMPANY_SEARCH_MAX_LENGTH} caracteres` : invalid}
            placeholder={notAllowedCompany && notAllowedCompany.length ? '' : 'Digite o domínio (ex.: consultoria.com.br) e tecle Enter'}
            maxLength={COMPANY_SEARCH_MAX_LENGTH}
            acceptValueOnBlur
            clearable
            comboboxProps={{ withinPortal: false }}
        />
    );
};
