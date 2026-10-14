'use client';
import React, { useEffect, useState } from 'react';
import { ConfirmDialog } from 'primereact/confirmdialog';
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

// situação do currículo no backend: ativo em vis_resume, inativo na gêmea vis_inactive_resume, ou nenhum dos dois.
// 'unknown' enquanto não se sabe (ainda carregando, ou sem login: aí a tela não mostra nada)
export type ResumeStatus = 'unknown' | 'none' | 'active' | 'inactive';

export interface ISubMenuMyResumeStore {
    hasTabSkills: boolean;
    setHasTabSkills: (hasTabSkills: boolean) => void;
    resumeStatus: ResumeStatus;
    setResumeStatus: (resumeStatus: ResumeStatus) => void;
}

export const SubMenuMyResumeStore = create<ISubMenuMyResumeStore>((set) => ({
    setHasTabSkills: (hasTabSkills: boolean) => set({ hasTabSkills }),
    hasTabSkills: false,
    setResumeStatus: (resumeStatus: ResumeStatus) => set({ resumeStatus }),
    resumeStatus: 'unknown',
}));

const resumeStatusLabels: Record<Exclude<ResumeStatus, 'unknown'>, { text: string; className: string }> = {
    none: { text: 'Você ainda não tem currículo salvo', className: 'resume-status resume-status-none' },
    active: { text: 'Currículo ativo: visível para os recrutadores', className: 'resume-status resume-status-active' },
    inactive: { text: 'Currículo inativo: oculto dos recrutadores', className: 'resume-status resume-status-inactive' },
};

const isFilled = (record: any) => !!record && Object.keys(record).length > 0;

/**
 * Busca a situação do currículo ao entrar na tela (GetData: o registro vem debaixo do nome da entidade onde está).
 * Entrar na tela não exige login (só salvar exige): sem login, ou com a sessão expirada, o 401 não abre o modal de
 * login, apenas deixa a situação desconhecida, como na busca da sugestão de habilidade.
 */
const loadResumeStatus = (setResumeStatus: (resumeStatus: ResumeStatus) => void, onResumeFound: (resume: any) => void = () => {}) => {
    const callbacks: any = {};
    callbacks[401] = () => {
        // sem login o JnAjax chama o 401 antes de enviar, e não desliga o carregamento que já ligou
        JnAjax.setNotLoading()();
        setResumeStatus('unknown');
    };
    callbacks[200] = (response: any) => {
        const data = response || {};
        if (isFilled(data.vis_resume)) {
            setResumeStatus('active');
            onResumeFound(data.vis_resume);
            return;
        }
        if (isFilled(data.vis_inactive_resume)) {
            setResumeStatus('inactive');
            onResumeFound(data.vis_inactive_resume);
            return;
        }
        setResumeStatus('none');
    };
    callbacks[404] = () => setResumeStatus('none');
    callbacks['onUnexpectedHttpStatus'] = () => setResumeStatus('unknown');
    // GET sem corpo: com {} o jQuery poria "?{}" na URL
    JnAjax.doAnAjaxRequest('resume/{email}', callbacks, 'GET', null as any, {}, 'http://localhost:8081');
};

// o rótulo que o backend dá a cada habilidade em skills/fromText (VisServiceSkills.putLabel): a própria habilidade, ou
// "palavra (habilidade)" quando foi encontrada por outra palavra
const toSkillListItem = (savedSkill: any) => {
    const foundByAnotherWord = savedSkill.word && savedSkill.word != savedSkill.skill;
    const label = foundByAnotherWord ? `${savedSkill.word} (${savedSkill.skill})` : savedSkill.skill;
    return { ...savedSkill, label };
};

/**
 * Remonta a aba Habilidades com as habilidades gravadas, no mesmo formato da resposta de skills/fromText: cada uma volta
 * ao grupo do seu type; as descartadas voltam ao contexto, separadas pelo motivo (o type delas); as implícitas (type
 * parent) não voltam, porque a aba as recalcula a partir da lista principal.
 */
const loadSavedSkills = (savedSkills: any[]) => {
    const skill = savedSkills.filter((savedSkill: any) => savedSkill.type == 'skillsFromResume').map(toSkillListItem);
    const excludedSkill = savedSkills.filter((savedSkill: any) => savedSkill.type == 'excludedSkills').map(toSkillListItem);
    const discardedSkills: any = {};
    savedSkills
        .filter((savedSkill: any) => savedSkill.category == 'discardedSkills')
        .forEach((savedSkill: any) => {
            discardedSkills[savedSkill.type] = [...(discardedSkills[savedSkill.type] || []), savedSkill];
        });
    const savedSkillsResponse = { skill, excludedSkill, discardedSkills };
    const requestSkillsToBackEnd = { excludedSkill: excludedSkill.map((item: any) => item.word), text: '' };
    putSkillsInStore(savedSkillsResponse, TabSkillStore.getState(), requestSkillsToBackEnd, SubMenuMyResumeStore.getState());
};

/** Preenche as abas com o currículo gravado (o ativo ou o inativo), cada store convertendo os campos que o backend transforma. */
const loadSavedResume = (resume: any) => {
    TabResumeStore.getState().loadFromSavedResume(resume);
    TabLanguagesStore.getState().loadFromSavedResume(resume);
    TabOptionsStore.getState().loadFromSavedResume(resume);
    RegioesStore.getState().loadFromSavedResume(resume);
    TabSalaryStore.getState().loadFromSavedResume(resume);
    const isTechResume = resume.resumeType == 1;
    isTechResume && loadSavedSkills(resume.skill || []);
};

/**
 * Reativa ou inativa o currículo (ChangeStatus: o ativo vai para a gêmea, o inativo volta para a principal).
 * É ação do usuário: aqui o 401 abre o modal de login e, depois dele, a ação é refeita.
 */
const changeResumeStatus = (newStatus: ResumeStatus, setResumeStatus: (resumeStatus: ResumeStatus) => void) => {
    const callbacks: any = {};
    callbacks['retryAfterAuthentication'] = () => changeResumeStatus(newStatus, setResumeStatus);
    callbacks[200] = () => {
        setResumeStatus(newStatus);
        const summary = newStatus === 'active' ? 'Currículo reativado' : 'Currículo inativado';
        PubSub.publish('showMessage', { summary, detail: summary });
    };
    // o currículo mudou em outro lugar: a tela mostra a situação atual
    callbacks[404] = () => loadResumeStatus(setResumeStatus);
    JnAjax.doAnAjaxRequest('resume/{email}/language/portuguese/status', callbacks, 'DELETE', {}, {}, 'http://localhost:8081');
};

/**
 * Apaga de vez o currículo, esteja onde estiver (Delete: deleteAnyWhere da entidade). Como no reativar, o 401 abre o
 * modal de login e a ação é refeita depois dele.
 */
const deleteResume = (setResumeStatus: (resumeStatus: ResumeStatus) => void) => {
    const callbacks: any = {};
    callbacks['retryAfterAuthentication'] = () => deleteResume(setResumeStatus);
    callbacks[200] = () => {
        setResumeStatus('none');
        PubSub.publish('showMessage', { summary: 'Currículo excluído', detail: 'Currículo excluído' });
    };
    JnAjax.doAnAjaxRequest('resume/{email}/language/portuguese', callbacks, 'DELETE', {}, {}, 'http://localhost:8081');
};

/**
 * Os botões ao lado do salvar, conforme a entidade onde estão os dados: na principal (ativo) inativar e excluir; na
 * gêmea (inativo) reativar e excluir; em nenhuma das duas, ou sem login, nenhum. Os três pedem confirmação.
 */
const ResumeStatusButtons = ({ resumeStatus, setResumeStatus }: { resumeStatus: ResumeStatus; setResumeStatus: (resumeStatus: ResumeStatus) => void }) => {
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const [confirmingInactivate, setConfirmingInactivate] = useState(false);
    const [confirmingReactivate, setConfirmingReactivate] = useState(false);

    const hasResume = resumeStatus === 'active' || resumeStatus === 'inactive';

    if (!hasResume) {
        return null;
    }

    const statusButton =
        resumeStatus === 'active' ? (
            <button onClick={() => setConfirmingInactivate(true)} type="button" className="btn btn-warning whitespace-nowrap">
                <i className="pi pi-eye-slash" style={{ marginRight: '8px' }} />
                Inativar
            </button>
        ) : (
            <button onClick={() => setConfirmingReactivate(true)} type="button" className="btn btn-success whitespace-nowrap">
                <i className="pi pi-replay" style={{ marginRight: '8px' }} />
                Reativar
            </button>
        );

    return (
        <>
            <ConfirmDialog
                visible={confirmingInactivate}
                onHide={() => setConfirmingInactivate(false)}
                header="Inativar currículo"
                message="Seu currículo deixará de aparecer para os recrutadores até que você o reative. Deseja continuar?"
                icon="pi pi-exclamation-triangle"
                acceptLabel="Sim, inativar"
                rejectLabel="Não"
                accept={() => changeResumeStatus('inactive', setResumeStatus)}
            />
            <ConfirmDialog
                visible={confirmingReactivate}
                onHide={() => setConfirmingReactivate(false)}
                header="Reativar currículo"
                message="Seu currículo voltará a aparecer para os recrutadores. Deseja continuar?"
                icon="pi pi-question-circle"
                acceptLabel="Sim, reativar"
                rejectLabel="Não"
                accept={() => changeResumeStatus('active', setResumeStatus)}
            />
            <ConfirmDialog
                visible={confirmingDelete}
                onHide={() => setConfirmingDelete(false)}
                header="Excluir currículo"
                message="Todos os dados do seu currículo serão apagados de vez, sem como recuperar. Deseja continuar?"
                icon="pi pi-exclamation-triangle"
                acceptLabel="Sim, excluir"
                rejectLabel="Não"
                accept={() => deleteResume(setResumeStatus)}
            />
            {statusButton}
            <button onClick={() => setConfirmingDelete(true)} type="button" className="btn btn-danger whitespace-nowrap">
                <i className="pi pi-trash" style={{ marginRight: '8px' }} />
                Excluir
            </button>
        </>
    );
};

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
        // salvar sempre deixa o currículo na entidade principal (reativa o inativo)
        SubMenuMyResumeStore.getState().setResumeStatus('active');
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

    const { resumeStatus, setResumeStatus } = stateSubMenuMyResume;
    useEffect(() => loadResumeStatus(setResumeStatus, loadSavedResume), []);
    const resumeStatusLabel = resumeStatus === 'unknown' ? null : resumeStatusLabels[resumeStatus];

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

    const statusButtons = <ResumeStatusButtons resumeStatus={resumeStatus} setResumeStatus={setResumeStatus} />;

    return (
        <div className="card">
            {resumeStatusLabel && <div className={resumeStatusLabel.className}>{resumeStatusLabel.text}</div>}
            {hasTabSkills ? (
                <Tabs tabs={tabs} lastButtonLabel="Salvar dados" lastButtonIcon="pi pi-save" lastButtonSiblings={statusButtons}>
                    <TabResume />
                    <TabLanguages />
                    <TabSkills2 getAccordionList={getImplicitSkills} />
                    <TabOptions />
                    <TabSalary />
                </Tabs>
            ) : (
                <Tabs tabs={tabs} lastButtonLabel="Salvar dados" lastButtonIcon="pi pi-save" lastButtonSiblings={statusButtons}>
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
    // currículo de tecnologia já salvo e nenhum texto novo colado: ficam as habilidades gravadas
    if (!stateResume.resumeText && stateResume.savedTechResume) {
        return [];
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
