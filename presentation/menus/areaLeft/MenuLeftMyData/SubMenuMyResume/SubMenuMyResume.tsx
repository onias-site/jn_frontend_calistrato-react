'use client';
import React, { useState } from 'react';
import 'primereact/resources/themes/lara-light-cyan/theme.css';

import 'primeicons/primeicons.css';
import './SubMenuMyResume.css';
import 'primereact/resources/primereact.min.css';
import { FormFilterComponent } from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/tabs/TabFilter/FormFilter';
import { IRegioesStore, RegioesStore } from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/tabs/TabFilter/RegioesComponent';
import {LanguagesStore, ILanguagesStore, ChooserLanguages } from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/tabs/TabLanguages/ChooserLanguages';
import { FormResume, IResumeStore, ResumeStore } from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/tabs/TabResume/FormResume';
import {FormSalaryStore, FormSalary, IFormSalaryStore } from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/tabs/TabSalary/FormSalary';
import { ChooserSkills } from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/tabs/TabSkills/ChooserSkills';
import { Tabs } from '@/presentation/components/source/Tabs';

const SubMenuMyResume = () => {
    const { pj, clt } = FormSalaryStore((state: IFormSalaryStore) => ({ ...state }));
    const { isInvalidSelection} = LanguagesStore((state: ILanguagesStore) => ({...state}));
    const { regioesSelecionadas } = RegioesStore((state: IRegioesStore) => ({...state}));
    const {desiredJob} = ResumeStore((state: IResumeStore) => ({ ...state }));


    const tabSalaryIsValid = () => pj || clt;
    const tabResumeIsValid = () => desiredJob;
    const tabLanguagesIsValid = () => !isInvalidSelection();
    const tabFilterIsValid = () => regioesSelecionadas.length;
    const tabs = [
        { label: 'Curriculo', icon: 'pi pi-file', isValid:  tabResumeIsValid, errorMessage: 'Deve-se escolher a função desejada'},
        { label: 'Idiomas', icon: 'pi pi-language',isValid: tabLanguagesIsValid, errorMessage: 'Ou escolha ao menos um idioma da lista, ou declare não ter conhecimento algum sobre nenhum idioma' },
        { label: 'Habilidades', icon: 'pi pi-check' },
        { label: 'Filtros', icon: 'pi pi-filter', isValid:  tabFilterIsValid, errorMessage: 'Deve-se selecionar ao menos uma das regiões metropolitanas'},
        { label: 'Salário', icon: 'pi pi-money-bill', isValid: tabSalaryIsValid, errorMessage: 'Deve se escolher ao menos uma das pretensões (PJ ou CLT)',  successMessage: 'Dados salvos com sucesso' },
    ];

    return (
        <div className = "card">
            <Tabs tabs = {tabs} lastButtonLabel="Salvar dados">
                <FormResume />
                <ChooserLanguages />
                <ChooserSkills />
                <FormFilterComponent />
                <FormSalary />
            </Tabs>
        </div>
    );
};

export default SubMenuMyResume;
