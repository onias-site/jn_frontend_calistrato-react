'use client'
import LanguagesStore, { ChooserLanguages, ILanguagesStore } from './ChooserLanguages';
import React from 'react';

export const TabLanguagesFooter: React.FC<any> = ({}) => {
    const { isInvalidSelection } = LanguagesStore((state: ILanguagesStore) => ({
        ...state,
    }));
    return (
        <div className="mb-5 text-center">
            <div className="flex-column flex">
                <button id="btnGoToLanguages" style={{ width: '15%' }} type="button" className="btn btn-danger ltr:ml-auto rtl:mr-auto">
                    Alterar currículo
                </button>
                <label htmlFor="username" style={{ width: '70%' }} className="letraPequena">
                    &nbsp;
                </label>
                <button
                    disabled = {isInvalidSelection()}
                    id="btnGoToLanguages"
                    type="button"
                    className="btn btn-primary ltr:ml-auto rtl:mr-auto"
                >
                    Selecionar habilidades
                </button>
            </div>
        </div>
    );
};
