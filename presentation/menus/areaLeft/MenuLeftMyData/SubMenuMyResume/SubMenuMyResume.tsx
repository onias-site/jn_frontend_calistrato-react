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
import { TabSkills, SkillsInternalListStore, ISkillsInternalListStore, TabSkillsStore, ITabSkillsStore } from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/tabs/TabSkills/ChooserSkills';
import { Tabs } from '@/presentation/components/source/Tabs';
import JnAjax from '@/app/JnAjax';

const skillsFromText = (response: any, skills: any, stateSkills: any) => {
    const skillsGroups = [
        { skills, name: 'hide', title: 'NÃO QUERO que meu currículo seja encontrado pelas seguintes habilidades:' },
        { skills: response.skill.map((x:any) => x.word), name: 'show', title: 'QUERO que meu currículo seja encontrado pelas seguintes habilidades:' },
    ];
    console.log('vindo quentinho do java', skillsGroups[1].skills.length);
    stateSkills.setSkillsGroups(skillsGroups);
}


const SubMenuMyResume = () => {
    const stateSkills = SkillsInternalListStore((state: ISkillsInternalListStore) => ({ ...state }));
    const stateLanguage = TabLanguagesStore((state: ITabLanguagesStore) => ({ ...state }));
    const stateSkills2 = TabSkillsStore((state: ITabSkillsStore) => ({ ...state }));
    const stateSalary = TabSalaryStore((state: ITabSalaryStore) => ({ ...state }));
    const stateResume = TabResumeStore((state: ITabResumeStore) => ({ ...state }));
    const stateRegioes = RegioesStore((state: IRegioesStore) => ({ ...state }));
    const callbacks: any = {};

    const excludedSkill = stateSkills.getSkills('hide');

    callbacks[200] = (response: any) => skillsFromText(response, excludedSkill, stateSkills2);

    const getSkillsFromText = () =>
        JnAjax.doAnAjaxRequest(
            'skills/fromText',
            callbacks,
            'POST',
            {
                text: stateResume.resumeText,
                excludedSkill,
            },
            {},
            'http://localhost:8081'
        );

    const tabs = [
        { label: 'Currículo', icon: 'pi pi-file-pdf', onMoveOnFowardTabs: getSkillsFromText },
        { label: 'Idiomas', icon: 'pi pi-language', onMoveOnFowardTabs: stateLanguage.onMoveOnFowardTabs },
        {
            label: 'Habilidades',
            icon: 'pi pi-linkedin',
            title: 'Caso as habilidades estiverem desatualizadas / incorretas, volte à aba currículo e preencha o texto do currículo, para que possamos atualizar corretamente a sua lista de habilidades',
        },
        { label: 'Opções', icon: 'pi pi-cog', onMoveOnFowardTabs: stateRegioes.onMoveOnFowardTabs },
        { label: 'Salários', icon: 'pi pi-dollar', onMoveOnFowardTabs: stateSalary.onMoveOnFowardTabs },
    ];

    return (
        <div className="card">
            <Tabs tabs={tabs} lastButtonLabel="Salvar dados">
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
