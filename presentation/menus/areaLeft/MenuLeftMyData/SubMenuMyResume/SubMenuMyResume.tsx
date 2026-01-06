'use client';
import React from 'react';
import 'primereact/resources/themes/lara-light-cyan/theme.css';

import 'primeicons/primeicons.css';
import './SubMenuMyResume.css';
import 'primereact/resources/primereact.min.css';
import { RegioesStore, IRegioesStore } from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/tabs/TabFilter/RegioesComponent';
import { TabOptions } from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/tabs/TabFilter/FormFilter';
import { TabLanguages, TabLanguagesStore, ITabLanguagesStore } from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/tabs/TabLanguages/ChooserLanguages';
import { TabResume, TabResumeStore, ITabResumeStore } from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/tabs/TabResume/FormResume';
import { TabSalary, TabSalaryStore, ITabSalaryStore } from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/tabs/TabSalary/FormSalary';
import { TabSkills } from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/tabs/TabSkills/ChooserSkills';
import { Tabs } from '@/presentation/components/source/Tabs';

const SubMenuMyResume = () => {
    const stateLanguage = TabLanguagesStore((state: ITabLanguagesStore) => ({...state}));
    const stateSalary = TabSalaryStore((state: ITabSalaryStore) => ({ ...state }));
    const stateResume = TabResumeStore((state: ITabResumeStore) => ({ ...state }));
    const stateRegioes = RegioesStore((state: IRegioesStore) => ({...state}));

    const tabs = [
        { label: 'Currículo', icon: 'pi pi-file-pdf', onMoveOnFowardTabs: stateResume.onMoveOnFowardTabs},
        { label: 'Idiomas', icon: 'pi pi-language', onMoveOnFowardTabs: stateLanguage.onMoveOnFowardTabs},
        { label: 'Habilidades', icon: 'pi pi-linkedin', title: 'Caso as habilidades estiverem desatualizadas / incorretas, volte à aba currículo e preencha o texto do currículo, para que possamos atualizar corretamente a sua lista de habilidades'},
        { label: 'Opções', icon: 'pi pi-cog', onMoveOnFowardTabs: stateRegioes.onMoveOnFowardTabs},
        { label: 'Salários', icon: 'pi pi-dollar', onMoveOnFowardTabs: stateSalary.onMoveOnFowardTabs },
    ];

    return (
        <div className = "card">
            <Tabs tabs = {tabs} lastButtonLabel="Salvar dados">
                <TabResume />
                <TabLanguages />
                <TabSkills />
                <TabOptions />
                <TabSalary />
            </Tabs>
        </div>
    );
};

export default SubMenuMyResume;
