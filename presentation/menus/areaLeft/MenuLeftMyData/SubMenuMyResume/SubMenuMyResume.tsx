'use client';
import React from 'react';
import 'primereact/resources/themes/lara-light-cyan/theme.css';

import 'primeicons/primeicons.css';
import './SubMenuMyResume.css';
import 'primereact/resources/primereact.min.css';
import { RegioesStore, IRegioesStore } from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/tabs/TabFilter/RegioesComponent';
import { TabOptions, TabOptionsStore, ITabOptionsStore } from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/tabs/TabFilter/FormFilter';
import { TabLanguages, TabLanguagesStore, ITabLanguagesStore } from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/tabs/TabLanguages/ChooserLanguages';
import { TabResume, TabResumeStore, ITabResumeStore } from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/tabs/TabResume/FormResume';
import { TabSalary, TabSalaryStore, ITabSalaryStore } from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/tabs/TabSalary/FormSalary';
import { TabSkills2, TabSkillStore, ITabSkillStore } from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/tabs/TabSkills/TabSkills';

import { Tabs } from '@/presentation/components/source/Tabs';
import JnAjax from '@/app/JnAjax';
import { create } from 'zustand';
import PubSub from 'pubsub-js';
import { sha1 } from 'js-sha1';

export interface ISubMenuMyResumeStore {
    hasTabSkills: boolean;
    setHasTabSkills: (hasTabSkills: boolean) => void;
}

export const SubMenuMyResumeStore = create<ISubMenuMyResumeStore>((set) => ({
    setHasTabSkills: (hasTabSkills: boolean) => set({ hasTabSkills }),
    hasTabSkills: false,
}));

// id da opção "aceito trabalhar em qualquer estado / cidade" do RegioesComponent
const todasAsRegioes = '0';

const isTechResume = (stateResume: any) => stateResume.resumeType && stateResume.resumeType.id == 1;

const getOptionsPendingRequirements = (stateRegioes: any, stateOptions: any): string[] => [...stateRegioes.getPendingRequirements(), ...stateOptions.getPendingRequirements()];

// todas as regras de VisEntityResume.Fields: cada aba confere as suas ao avançar, e a aba que salva confere também as das
// outras (com o nome da aba na frente), porque dá para voltar a uma aba anterior e mudar um campo depois de passar por ela
const getAllPendingRequirements = (stateSkills: any, stateResume: any, stateLanguage: any, stateSalary: any, stateRegioes: any, stateOptions: any): string[] => {
    const pendingByTab: [string, string[]][] = [
        ['Currículo', stateResume.getPendingRequirements()],
        ['Idiomas', stateLanguage.getPendingRequirements()],
        ['Habilidades', isTechResume(stateResume) ? stateSkills.getPendingRequirements() : []],
        ['Opções', getOptionsPendingRequirements(stateRegioes, stateOptions)],
    ];
    const otherTabsPending = pendingByTab.flatMap(([tabLabel, pending]) => pending.map((requirement) => `Aba ${tabLabel}: ${requirement}`));
    return [...otherTabsPending, ...stateSalary.getPendingRequirements()];
};

const saveResume = (stateSkills: any, stateResume: any, stateLanguage: any, stateSalary: any, stateRegioes: any, stateOptions: any) => {
    const formErrors = getAllPendingRequirements(stateSkills, stateResume, stateLanguage, stateSalary, stateRegioes, stateOptions);
    if (formErrors.length) {
        return formErrors;
    }
    // o backend descarta o id de cada idioma
    const spokenLanguage = stateLanguage.getSelectedLanguages();
    // as habilidades só existem para o currículo de tecnologia: as de um texto colado antes de trocar o tipo não vão
    const skill = isTechResume(stateResume) ? stateSkills.loadSkillsContext() : [];
    const allData = {...stateResume, ...stateLanguage, ...stateSalary, ...stateRegioes, ...stateOptions };
    // "qualquer estado / cidade" (0) é só uma opção da tela: já vem acompanhada de todas as regiões, que é o que vai ao backend
    const ddd = allData.regioesSelecionadas.filter((region: any) => region != todasAsRegioes).map((region: any) => Number(region));
    const resumeType = allData.resumeType.id;
    const login: any = JnAjax.getLogin();
    const email = login.email;
    const disponibility = Number(allData.disponibility);
    // anos de experiência: o backend grava o ano em que a experiência começou
    const experience = Number(allData.experience);
    const temporallyJobTime = Number(allData.temporallyJobTime);
    const {
        desiredJob,
        lastJob,
        linkedinAddress,
        negotiableClaim,
        notAllowedCompany,
        pcd,
        travel,
    } = allData;

    const resume: any = {
        ddd,
        desiredJob,
        disponibility,
        email,
        resumeType,
        skill,
        experience,
        spokenLanguage,
        linkedinAddress,
        negotiableClaim,
        notAllowedCompany,
        pcd,
        temporallyJobTime,
        travel,
    };
    // opcional no backend, mas com no mínimo 2 caracteres quando presente
    lastJob && (resume.lastJob = lastJob);
    // pretensão 0 quer dizer "não aceito": o campo não vai, e o backend exige ao menos uma entre clt e pj
    const salaries = ['btc', 'clt', 'pj'];
    salaries.forEach((salaryType) => {
        const salary = Number(allData[salaryType]);
        salary && (resume[salaryType] = salary);
    });

    const callbacks: any = {};

    callbacks['retryAfterAuthentication'] = () => saveResume(stateSkills, stateResume, stateLanguage, stateSalary, stateRegioes, stateOptions );
    callbacks[200] = () => {
        // callbacks[200] = (responseFromBackEnd: any) => {
        PubSub.publish('showMessage', {
            detail: `Currículo salvo com sucesso`,
            summary: `Currículo salvo com sucesso`,
        });
    };
    JnAjax.doAnAjaxRequest('resume/{email}/language/portuguese', callbacks, 'POST', resume, {}, 'http://localhost:8081');
};

const SubMenuMyResume = () => {
    const stateSkills = TabSkillStore((state: ITabSkillStore) => ({
        ...state,
    }));
    const stateSubMenuMyResume = SubMenuMyResumeStore((state: ISubMenuMyResumeStore) => ({ ...state }));
    const stateResume = TabResumeStore((state: ITabResumeStore) => ({ ...state }));

    const hasTabSkills = stateSubMenuMyResume.hasTabSkills && stateResume.resumeType.id == 1;

    const stateLanguage = TabLanguagesStore((state: ITabLanguagesStore) => ({ ...state }));
    const stateOptions = TabOptionsStore((state: ITabOptionsStore) => ({ ...state }));
    const stateSalary = TabSalaryStore((state: ITabSalaryStore) => ({ ...state }));
    const stateRegioes = RegioesStore((state: IRegioesStore) => ({ ...state }));

    const tabs = [
        {
            label: 'Currículo',
            icon: 'pi pi-file-pdf',
            onMoveOnFowardTabs: () => loadSkillsFromBackEnd(stateResume, stateSkills, stateSubMenuMyResume),
            getPendingRequirements: stateResume.getPendingRequirements,
        },
        { label: 'Idiomas', icon: 'pi pi-language', onMoveOnFowardTabs: stateLanguage.onMoveOnFowardTabs, getPendingRequirements: stateLanguage.getPendingRequirements },
        {
            label: 'Opções',
            icon: 'pi pi-cog',
            onMoveOnFowardTabs: () => getOptionsPendingRequirements(stateRegioes, stateOptions),
            getPendingRequirements: () => getOptionsPendingRequirements(stateRegioes, stateOptions),
        },
        {
            label: 'Salários',
            icon: 'pi pi-dollar',
            onMoveOnFowardTabs: () => saveResume(stateSkills, stateResume, stateLanguage, stateSalary, stateRegioes, stateOptions),
            getPendingRequirements: () => getAllPendingRequirements(stateSkills, stateResume, stateLanguage, stateSalary, stateRegioes, stateOptions),
        },
    ];
    // mesmo número que aparece ao lado do título da lista principal (habilidades pelas quais o currículo é ENCONTRADO)
    const mainSkillsGroup: any = stateSkills.groups.filter((group: any) => group.main)[0];
    const mainSkillsCount = mainSkillsGroup && mainSkillsGroup.list ? mainSkillsGroup.list.length : 0;
    const tabSkills: any = {
        label: `${mainSkillsCount} Habilidades`,
        icon: 'pi pi-github',
        title: 'Caso as habilidades estiverem desatualizadas / incorretas, volte à aba currículo e preencha o texto do currículo, para que possamos atualizar corretamente a sua lista de habilidades',
        onMoveOnFowardTabs: stateSkills.getPendingRequirements,
        getPendingRequirements: stateSkills.getPendingRequirements,
    };

    hasTabSkills && tabs.splice(2, 0, tabSkills);

    return (
        <div className="card">
            {hasTabSkills ? (
                <Tabs tabs={tabs} lastButtonLabel="Salvar dados" lastButtonIcon="pi pi-save">
                    <TabResume />
                    <TabLanguages />
                    <TabSkills2 getAccordionList={getImplicitSkills} />
                    <TabOptions />
                    <TabSalary />
                </Tabs>
            ) : (
                <Tabs tabs={tabs} lastButtonLabel="Salvar dados" lastButtonIcon="pi pi-save">
                    <TabResume />
                    <TabLanguages />
                    <TabOptions />
                    <TabSalary />
                </Tabs>
            )}
        </div>
    );
};

const loadSkillsFromBackEnd = (stateResume: any, stateSkills: any, stateSubMenuMyResume: any) => {
    const formErrors = stateResume.onMoveOnFowardTabs();

    if (formErrors && formErrors.length) {
        return formErrors;
    }
    const cacheHash = sha1(stateResume.resumeText);

    if(stateSkills.context && stateSkills.context.cacheHash == cacheHash){
        return [];
    }

    const callbacks: any = {};
    callbacks[200] = (responseFromBackEnd: any) => putSkillsInStore(responseFromBackEnd, stateSkills, requestSkillsToBackEnd, stateSubMenuMyResume);
    const requestSkillsToBackEnd = createRequestSkillsToBackEnd(stateResume, stateSkills);

    JnAjax.doAnAjaxRequest('skills/fromText', callbacks, 'POST', requestSkillsToBackEnd, {}, 'http://localhost:8081');
};

const createRequestSkillsToBackEnd = (stateResume: any, stateSkills: any) => {
    const excludedSkill = stateSkills.getWordsFromGroup('excludedSkills');
    const text = stateResume.resumeText;

    const requestSkillsToBackEnd = {
        excludedSkill,
        text,
    };

    return requestSkillsToBackEnd;
};

const putSkillsInStore = (responseFromBackEnd: any, stateSkills: any, requestSkillsToBackEnd: any, stateSubMenuMyResume: any) => {
    const excludedSkillsFromResume = {
        title: 'Habilidades pelas quais eu NÃO quero que o meu currículo seja encontrado',
        list: responseFromBackEnd.excludedSkill,
        name: 'excludedSkills',
        category: 'excludedSkills',
    };

    const skillsFromResume = {
        title: 'Habilidades pelas quais eu quero que o meu currículo seja ENCONTRADO',
        list: responseFromBackEnd.skill,
        name: 'skillsFromResume',
        // VisResumeSkillCategories no backend; o type continua sendo o nome do grupo (VisResumeSkillTypes)
        category: 'skillsFromText',
        main: true,
    };

    const groups = [excludedSkillsFromResume, skillsFromResume];

    stateSkills.setGroups(groups, getImplicitSkills);
    responseFromBackEnd.requestSkillsToBackEnd = requestSkillsToBackEnd;
    stateSkills.setContext(responseFromBackEnd);
    //   stateSkills.setAccordionList(responseFromBackEnd.implicitSkills);

    stateSubMenuMyResume.setHasTabSkills(responseFromBackEnd.skill.length);
};

const getImplicitSkills = (group: any): any[] => {
    let allParents: any[] = [];
    group.list.forEach((item: any) => {
        allParents = [...allParents, ...item.parent];
    });

    const skills = group.list.map((item: any) => item.skill);

    const filteredParents = allParents.filter((parent: any) => !skills.includes(parent));

    const set = new Set(filteredParents);

    const array = [...set].map((parent: any) => {
        const children = group.list.filter((skill: any) => skill.parent.includes(parent));
        const skill = parent;
        const response = { children, skill };
        return response;
    });

    return array;
};

export default SubMenuMyResume;
