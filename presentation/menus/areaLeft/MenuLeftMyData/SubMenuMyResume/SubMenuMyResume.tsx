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
import {TabSkills2, TabSkillStore, ITabSkillStore} from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/tabs/TabSkills/TabSkills'

const SubMenuMyResume = () => {
    const stateSkills = TabSkillStore((state: ITabSkillStore) => ({
        ...state,
    }));
    const stateLanguage = TabLanguagesStore((state: ITabLanguagesStore) => ({ ...state }));
    const stateSalary = TabSalaryStore((state: ITabSalaryStore) => ({ ...state }));
    const stateResume = TabResumeStore((state: ITabResumeStore) => ({ ...state }));
    const stateRegioes = RegioesStore((state: IRegioesStore) => ({ ...state }));

    const tabs = [
        { label: 'Currículo', icon: 'pi pi-file-pdf', onMoveOnFowardTabs:  () => loadSkillsFromBackEnd(stateResume, stateSkills) },
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
                <TabSkills2 getAccordionList = {getImplicitSkills}/>
                <TabOptions />
                <TabSalary />
            </Tabs>
        </div>
    );
};

const loadSkillsFromBackEnd = (stateResume: any, stateSkills: any) => {
    const callbacks: any = {};
    callbacks[200] = (responseFromBackEnd: any) => putSkillsInStore(responseFromBackEnd, stateSkills);

    const requestSkillsToBackEnd = createRequestSkillsToBackEnd(stateResume, stateSkills);

    JnAjax.doAnAjaxRequest(
        'skills/fromText',
        callbacks,
        'POST',
        requestSkillsToBackEnd,
        {},
        'http://localhost:8081'
    );

}

const createRequestSkillsToBackEnd = (stateResume: any, stateSkills: any) => {

    const excludedSkill = stateSkills.getWordsFromGroup('excludedSkillsFromResume');
    const text = stateResume.resumeText;

    const requestSkillsToBackEnd = {
        excludedSkill,
        text
    };

    return requestSkillsToBackEnd;
}

const putSkillsInStore = (responseFromBackEnd: any, stateSkills: any) => {
    const excludedSkillsFromResume = {
        title: 'Habilidades pelas quais eu NÃO quero que o meu currículo seja encontrado',
        list: responseFromBackEnd.excludedSkill,
        name: 'excludedSkillsFromResume'
    };

    const skillsFromResume = {
        title: 'Habilidades pelas quais eu quero que o meu currículo seja ENCONTRADO',
        list: responseFromBackEnd.skill,
        name: 'skillsFromResume',
        main: true
    };

    const groups = [excludedSkillsFromResume, skillsFromResume];

    stateSkills.setGroups(groups, getImplicitSkills);
    stateSkills.setAccordionList(responseFromBackEnd.implicitSkills);
}

const getImplicitSkills = (group: any): any[] =>{
    let allParents : any[] = [];
    group.list.forEach((item: any) =>{
        allParents = [...allParents, ...item.parent];

    });

    const skills = group.list.map((item: any) => item.skill);

    const filteredParents = allParents.filter((parent: any) =>  !skills.includes(parent));

    const set = new Set(filteredParents);

    const array = [...set].map((parent: any) => {
        const children = group.list.filter((skill: any) => skill.parent.includes(parent));
        const skill = parent;
        const response = {children, skill};
        return response;
    });

    return array;
}


export default SubMenuMyResume;
