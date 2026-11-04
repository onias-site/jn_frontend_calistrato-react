'use client';

import React from 'react';
import { create } from 'zustand';
import { Checkbox, Select } from '@mantine/core';
import { SummaryMultiSelect } from '@/presentation/components/source/SummaryMultiSelect';

export interface ITabLanguagesStore {
    language: any;
    selectedLanguages: any[];
    speakOtherLanguages: boolean;
    getSelectedLanguages: () => any[];
    onMoveOnFowardTabs: () => string[];
    getPendingRequirements: () => string[];
    setLanguage: (language: any[]) => void;
    setSelectedLanguages: (selectedLanguages: any[]) => void;
    setSpeakOtherLanguages: (speakOtherLanguages: boolean) => void;
    loadFromSavedResume: (resume: any) => void;
}

export const TabLanguagesStore = create<ITabLanguagesStore>((set, get) => ({
    language: {},
    selectedLanguages: [],
    speakOtherLanguages: false,
    setLanguage: (language: any) => set({ language }),
    getSelectedLanguages: () => {
        const { selectedLanguages } = get();
        const selected = languages.filter(x => selectedLanguages && selectedLanguages.includes(x.id));
        return selected;
    },

    setSelectedLanguages: (selectedLanguages: any[]) => set({ selectedLanguages }),
    setSpeakOtherLanguages: (speakOtherLanguages: boolean) => {
        const { selectedLanguages } = get();
        set({ speakOtherLanguages, selectedLanguages: speakOtherLanguages ? selectedLanguages : [] });
    },
    // o backend grava cada idioma só com nome e nível (VisJsonTransformerSpokenLanguageWithoutId): o id vem da lista da tela
    loadFromSavedResume: (resume: any) => {
        const savedLanguages = resume.spokenLanguage || [];
        const selectedLanguages: any[] = [];
        savedLanguages.forEach((savedLanguage: any) => {
            const language = languages.filter((x) => x.name == savedLanguage.name)[0];
            if (!language) {
                return;
            }
            language.level = savedLanguage.level;
            selectedLanguages.push(language.id);
        });
        set({ selectedLanguages, speakOtherLanguages: selectedLanguages.length > 0 });
    },
    onMoveOnFowardTabs: () => get().getPendingRequirements(),
    getPendingRequirements: () => {
        const { speakOtherLanguages, selectedLanguages, getSelectedLanguages } = get();


        if (!speakOtherLanguages) {
            return [];
        }

        if (!selectedLanguages.length) {
            return ['Favor informar ao menos um idioma'];
        }
        // mesmas regras de spokenLanguage (Language) no backend: nome de 3 a 20 caracteres e nível 1 ou 2
        const invalidLanguages = getSelectedLanguages().filter((language: any) => language.name.length < 3 || language.name.length > 20 || ![1, 2].includes(language.level));
        return invalidLanguages.map((language: any) => `Favor escolher o nível do idioma ${language.name}`);
    },
}));

const languages = [
    { name: 'Alemão', id: 11, level: 1 },
    { name: 'Amárico', id: 33, level: 1 },
    { name: 'Árabe', id: 5, level: 1 },
    { name: 'Azerbaijano', id: 35, level: 1 },
    { name: 'Bengali', id: 6, level: 1 },
    { name: 'Birmanês', id: 34, level: 1 },
    { name: 'Búlgaro', id: 42, level: 1 },
    { name: 'Cebuano', id: 37, level: 1 },
    { name: 'Coreano', id: 18, level: 1 },
    { name: 'Croata', id: 49, level: 1 },
    { name: 'Dinamarquês', id: 45, level: 1 },
    { name: 'Eslovaco', id: 47, level: 1 },
    { name: 'Espanhol', id: 3, level: 1 },
    { name: 'Finlandês', id: 46, level: 1 },
    { name: 'Francês', id: 4, level: 1 },
    { name: 'Grego', id: 36, level: 1 },
    { name: 'Gujarati', id: 22, level: 1 },
    { name: 'Hausa', id: 32, level: 1 },
    { name: 'Hebraico', id: 44, level: 1 },
    { name: 'Hindi', id: 2, level: 1 },
    { name: 'Holandês', id: 31, level: 1 },
    { name: 'Húngaro', id: 41, level: 1 },
    { name: 'Indonésio', id: 10, level: 1 },
    { name: 'Inglês', id: 0, level: 1 },
    { name: 'Italiano', id: 20, level: 1 },
    { name: 'Japonês', id: 12, level: 1 },
    { name: 'Kannada', id: 27, level: 1 },
    { name: 'Malaio', id: 26, level: 1 },
    { name: 'Mandarim (Chinês)', id: 1, level: 1 },
    { name: 'Marathi', id: 14, level: 1 },
    { name: 'Norueguês', id: 48, level: 1 },
    { name: 'Oriya (Odia)', id: 28, level: 1 },
    { name: 'Persa (Farsi)', id: 24, level: 1 },
    { name: 'Polonês', id: 23, level: 1 },
    { name: 'Punjabi', id: 29, level: 1 },
    { name: 'Romeno', id: 30, level: 1 },
    { name: 'Russo', id: 8, level: 1 },
    { name: 'Sérvio', id: 43, level: 1 },
    { name: 'Suaíli', id: 13, level: 1 },
    { name: 'Sueco', id: 40, level: 1 },
    { name: 'Tailandês', id: 21, level: 1 },
    { name: 'Tamil', id: 17, level: 1 },
    { name: 'Tcheco', id: 39, level: 1 },
    { name: 'Telugu', id: 15, level: 1 },
    { name: 'Turco', id: 16, level: 1 },
    { name: 'Ucraniano', id: 25, level: 1 },
    { name: 'Urdu', id: 9, level: 1 },
    { name: 'Vietnamita', id: 19, level: 1 },
    { name: 'Zulu', id: 38, level: 1 },
];

// os idiomas mais pedidos pelos recrutadores primeiro, nesta ordem (desde 2026-11-07; até então tudo em ordem alfabética,
// e até 2026-10-14 pelo id); os demais vêm depois, em ordem alfabética, para quem procura o próprio idioma. Só muda a
// ordem de exibição: o currículo grava o nome do idioma
const languagesByRecruitersDemand = ['Inglês', 'Espanhol', 'Francês', 'Alemão', 'Italiano', 'Mandarim (Chinês)', 'Japonês', 'Coreano', 'Russo', 'Árabe', 'Holandês'];
const demandRank = (name: string) => {
    const rank = languagesByRecruitersDemand.indexOf(name);
    return rank < 0 ? languagesByRecruitersDemand.length : rank;
};
languages.sort((a, b) => demandRank(a.name) - demandRank(b.name) || a.name.localeCompare(b.name, 'pt-BR'));

const levelOptions = [
    { value: '1', label: 'Intermediário (Leio e escrevo bem, entendo parte do que me dizem, porém, tenho lentidão ao expressar idéias neste idioma)' },
    {
        value: '2',
        label: 'Fluente (Leio e escrevo com quase a mesma velocidade do meu idioma nativo, me expresso bem neste idioma e entendo os regionalismos em parte ou totalmente)',
    },
];

export interface TabResumeProps{

}
export const TabLanguages: React.FC<TabResumeProps> = ({}) => {
    const {selectedLanguages, setSelectedLanguages, setLanguage, setSpeakOtherLanguages, speakOtherLanguages } = TabLanguagesStore((state: ITabLanguagesStore) => ({
        ...state,
    }));

    // os ids são números na store e textos no componente de escolha
    const selectLanguages = (values: string[], changed: string) => {
        const language = languages.filter((x) => String(x.id) == changed)[0];
        if (language) {
            language.level = 1;
            setLanguage(language);
        }
        setSelectedLanguages(values.map((value) => Number(value)));
    };

    const getLanguageLevelCombobox = (id: any) => {
        const language = languages.filter((x) => x.id == id)[0];
        if (!language) {
            return null;
        }
        return (
            <div key={language.id} className="mb-4 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:items-start md:gap-4">
                <label htmlFor={`languageLevel-${language.id}`} className="mb-1.5 block font-semibold text-dark dark:text-white-light md:mb-0 md:pt-2">
                    Meu nível em idioma {language.name} é:
                </label>
                <Select
                    id={`languageLevel-${language.id}`}
                    value={String(language.level)}
                    onChange={(value) => {
                        if (!value) return;
                        language.level = Number(value);
                        setLanguage(language);
                    }}
                    data={levelOptions}
                    placeholder="Escolha o nível do idioma"
                    allowDeselect={false}
                    comboboxProps={{ withinPortal: false }}
                />
            </div>
        );
    };

    return (
        <div>
            <div className="mb-5">
                <Checkbox
                    id="doNotSpeakAnyLanguage"
                    name="doNotSpeakAnyLanguage"
                    checked={speakOtherLanguages}
                    onChange={(e) => setSpeakOtherLanguages(e.currentTarget.checked)}
                    label="Tenho conhecimento em outro(s) idioma(s) além do meu idioma nativo"
                />
            </div>
            {speakOtherLanguages && (
                <div className="mb-6">
                    <label className="mb-1.5 block font-semibold text-dark dark:text-white-light">Idiomas que conheço</label>
                    <SummaryMultiSelect
                        id="spokenLanguages"
                        data={languages.map((language) => ({ value: String(language.id), label: language.name }))}
                        value={selectedLanguages.map((id: any) => String(id))}
                        onChange={selectLanguages}
                        placeholder="Selecione os idiomas em que você possui algum nível de conhecimento"
                        searchPlaceholder="Digite o idioma que você procura"
                        nothingFoundMessage="Nenhum idioma encontrado"
                        summaryLabel={(count) => `${count} idiomas selecionados`}
                        maxDisplayedPills={6}
                        error={!selectedLanguages.length}
                    />
                </div>
            )}
            {speakOtherLanguages && selectedLanguages.map((id: any) => getLanguageLevelCombobox(id))}
        </div>
    );
};
export default TabLanguagesStore;
