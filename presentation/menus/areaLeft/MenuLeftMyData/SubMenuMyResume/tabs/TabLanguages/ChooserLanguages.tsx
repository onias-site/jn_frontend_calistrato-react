'use client';

import { MultiSelect } from 'primereact/multiselect';
import React from 'react';

import { create } from 'zustand';

import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';

export interface ILanguagesStore {
    selectedLanguages: any[];
    language: any;
    speakOtherLanguages: boolean;
    isInvalidSelection: () => boolean;
    setLanguage: (language: any[]) => void;
    setSelectedLanguages: (selectedLanguages: any[]) => void;
    setSpeakOtherLanguages: (speakOtherLanguages: boolean) => void;
}

const LanguagesStore = create<ILanguagesStore>((set, get) => ({
    language: {},
    selectedLanguages: [],
    speakOtherLanguages: false,
    setLanguage: (language: any) => set({ language }),
    setSelectedLanguages: (selectedLanguages: any[]) => set({ selectedLanguages }),
    setSpeakOtherLanguages: (speakOtherLanguages: boolean) => {
        const { selectedLanguages } = get();
        set({ speakOtherLanguages, selectedLanguages: speakOtherLanguages ? selectedLanguages : [] });
    },
    isInvalidSelection: () => {
        const { speakOtherLanguages, selectedLanguages } = get();

        if (!speakOtherLanguages) {
            return false;
        }

        if (selectedLanguages.length) {
            return false;
        }
        return true;
    },
}));

const languages = [
    {
        name: 'Alemão',
        id: 11,
        level: 1,
    },
    {
        name: 'Amárico',
        id: 33,
        level: 1,
    },
    {
        name: 'Árabe',
        id: 5,
        level: 1,
    },
    {
        name: 'Azerbaijano',
        id: 35,
        level: 1,
    },
    {
        name: 'Bengali',
        id: 6,
        level: 1,
    },
    {
        name: 'Birmanês',
        id: 34,
        level: 1,
    },
    {
        name: 'Búlgaro',
        id: 42,
        level: 1,
    },
    {
        name: 'Cebuano',
        id: 37,
        level: 1,
    },
    {
        name: 'Coreano',
        id: 18,
        level: 1,
    },
    {
        name: 'Croata',
        id: 49,
        level: 1,
    },
    {
        name: 'Dinamarquês',
        id: 45,
        level: 1,
    },
    {
        name: 'Eslovaco',
        id: 47,
        level: 1,
    },
    {
        name: 'Espanhol',
        id: 3,
        level: 1,
    },
    {
        name: 'Finlandês',
        id: 46,
        level: 1,
    },
    {
        name: 'Francês',
        id: 4,
        level: 1,
    },
    {
        name: 'Grego',
        id: 36,
        level: 1,
    },
    {
        name: 'Gujarati',
        id: 22,
        level: 1,
    },
    {
        name: 'Hausa',
        id: 32,
        level: 1,
    },
    {
        name: 'Hebraico',
        id: 44,
        level: 1,
    },
    {
        name: 'Hindi',
        id: 2,
        level: 1,
    },
    {
        name: 'Holandês',
        id: 31,
        level: 1,
    },
    {
        name: 'Húngaro',
        id: 41,
        level: 1,
    },
    {
        name: 'Indonésio',
        id: 10,
        level: 1,
    },
    {
        name: 'Inglês',
        id: 0,
        level: 1,
    },
    {
        name: 'Italiano',
        id: 20,
        level: 1,
    },
    {
        name: 'Japonês',
        id: 12,
        level: 1,
    },
    {
        name: 'Kannada',
        id: 27,
        level: 1,
    },
    {
        name: 'Malaio',
        id: 26,
        level: 1,
    },
    {
        name: 'Mandarim (Chinês)',
        id: 1,
        level: 1,
    },
    {
        name: 'Marathi',
        id: 14,
        level: 1,
    },
    {
        name: 'Norueguês',
        id: 48,
        level: 1,
    },
    {
        name: 'Oriya (Odia)',
        id: 28,
        level: 1,
    },
    {
        name: 'Persa (Farsi)',
        id: 24,
        level: 1,
    },
    {
        name: 'Polonês',
        id: 23,
        level: 1,
    },

    {
        name: 'Punjabi',
        id: 29,
        level: 1,
    },
    {
        name: 'Romeno',
        id: 30,
        level: 1,
    },
    {
        name: 'Russo',
        id: 8,
        level: 1,
    },
    {
        name: 'Sérvio',
        id: 43,
        level: 1,
    },
    {
        name: 'Suaíli',
        id: 13,
        level: 1,
    },
    {
        name: 'Sueco',
        id: 40,
        level: 1,
    },
    {
        name: 'Tailandês',
        id: 21,
        level: 1,
    },
    {
        name: 'Tamil',
        id: 17,
        level: 1,
    },
    {
        name: 'Tcheco',
        id: 39,
        level: 1,
    },
    {
        name: 'Telugu',
        id: 15,
        level: 1,
    },
    {
        name: 'Turco',
        id: 16,
        level: 1,
    },
    {
        name: 'Ucraniano',
        id: 25,
        level: 1,
    },
    {
        name: 'Urdu',
        id: 9,
        level: 1,
    },
    {
        name: 'Vietnamita',
        id: 19,
        level: 1,
    },
    {
        name: 'Zulu',
        id: 38,
        level: 1,
    },
];

languages.sort((a, b) => a.id - b.id);

export const ChooserLanguages: React.FC<any> = ({}) => {
    const { selectedLanguages, setSelectedLanguages, setLanguage, setSpeakOtherLanguages, speakOtherLanguages } = LanguagesStore((state: ILanguagesStore) => ({
        ...state,
    }));

    const selectLanguages = (e: any) => {
        const language = languages.filter((x) => x.id == e.selectedOption.id)[0];
        if (language) {
            language.level = 1;
            setLanguage(language);
        }
        setSelectedLanguages(e.value);
    };

    const getLanguageLevelCombobox = (id: any) => {
        const language = languages.filter((x) => x.id == id)[0];

        return (
            <div>
                <div className="flex-column flex">
                    <label htmlFor="lastJob" style={{ width: '30%', marginTop: '10px' }} className="letraPequena">
                        Meu nível em idioma {language.name} é:
                    </label>

                    <Dropdown
                        key={language.id}
                        value={language.level}
                        onChange={(e) => {
                            language.level = e.value;
                            setLanguage(language);
                        }}
                        options={[
                            { name: 'Intermediário (Leio e escrevo bem, entendo parte do que me dizem, porém, tenho lentidão ao expressar idéias neste idioma)', level: 1 },
                            {
                                name: 'Fluente (Leio e escrevo com quase a mesma velocidade do meu idioma nativo, me expresso bem neste idioma e entendo os regionalismos em parte ou totalmente)',
                                level: 2,
                            },
                        ]}
                        optionLabel="name"
                        optionValue="level"
                        placeholder="Escolha o nível do idioma"
                        className="md:w-14rem w-full"
                    />
                </div>
                <div className="mb-5 text-center">
                    <div className="flex-column flex">&nbsp;</div>
                </div>
            </div>
        );
    };

    return (
        <div>
            <div className="mb-5 text-center">
                <div className="align-items-center flex">
                    <Checkbox onChange={(e) => setSpeakOtherLanguages(e.checked)} checked={speakOtherLanguages} name="doNotSpeakAnyLanguage" />
                    <label htmlFor="ingredient3" className="letraPequena ml-2">
                        Tenho conhecimento em outro(s) idioma(s) além do meu idioma nativo
                    </label>
                </div>
            </div>
            {speakOtherLanguages && (
                <MultiSelect
                    style={{ borderStyle: 'solid', borderColor: 'black' }}
                    value={selectedLanguages}
                    onChange={selectLanguages}
                    options={languages}
                    selectedItemsLabel="{label} Idiomas selecionados"
                    optionLabel="name"
                    optionValue="id"
                    placeholder="Selecione os idiomas em que você possui algum nível de conhecimento"
                    maxSelectedLabels={10}
                    className="form-input"
                />
            )}
            <div className="mb-5 text-center">
                <div className="flex-column flex">&nbsp;</div>
            </div>
            {selectedLanguages.map((id: any) => getLanguageLevelCombobox(id))}
        </div>
    );
};
export default LanguagesStore;
