'use client';
import React, { useEffect, useState } from 'react';
import { ConfirmModal } from '@/presentation/components/source/ConfirmModal';
import './SubMenuMyResume.css';
import IconEye from '@/presentation/icons/icon-eye';
import IconRefresh from '@/presentation/icons/icon-refresh';
import IconTrash from '@/presentation/icons/icon-trash';
import IconFile from '@/presentation/icons/icon-file';
import IconGlobe from '@/presentation/icons/icon-globe';
import IconSettings from '@/presentation/icons/icon-settings';
import IconDollarSign from '@/presentation/icons/icon-dollar-sign';
import IconGithub from '@/presentation/icons/icon-github';
import IconSave from '@/presentation/icons/icon-save';
import { RegioesStore, IRegioesStore } from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/tabs/TabFilter/RegioesComponent';
import { TabOptions, TabOptionsStore, ITabOptionsStore } from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/tabs/TabFilter/FormFilter';
import { TabLanguages, TabLanguagesStore, ITabLanguagesStore } from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/tabs/TabLanguages/ChooserLanguages';
import { TabResume, TabResumeStore, ITabResumeStore } from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/tabs/TabResume/FormResume';
import { TabSalary, TabSalaryStore, ITabSalaryStore } from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/tabs/TabSalary/FormSalary';
import { TabSkills2, TabSkillStore, ITabSkillStore } from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/tabs/TabSkills/TabSkills';
import { NotAllowedCompanyStore } from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/tabs/TabResume/NotAllowedCompany';
import { SkillsInternalListStore, TabSkillsStore } from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/tabs/TabSkills/ChooserSkills';

import { Tabs } from '@/presentation/components/source/Tabs';
import { removeResumeCopy, resumeCopyFromSavedResume, resumeSavedForTheSearch, resumeSkillsFrom, saveResumeCopy } from '@/presentation/components/resume-copy/resumeCopy';
import JnAjax from '@/app/JnAjax';
import { ModalLoginStore, IModalLoginStore } from '@/presentation/auth/ModalLogin';
import { useRouter } from 'next/navigation';
import { create } from 'zustand';
import PubSub from 'pubsub-js';
import { sha1 } from 'js-sha1';
import {
    ResumeDailyAction,
    getResumeDailyActionBlockMessage,
    getResumeDailyActionConfirmMessage,
    getResumeDailyLimitReachedMessage,
    recordResumeDailyAction,
} from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/resumeDailyActions';

// situação do currículo no backend: ativo em vis_resume, inativo na gêmea vis_inactive_resume, ou nenhum dos dois.
// 'notLogged' quando a busca leva 401 (sem login, login inválido ou sessão expirada): a faixa convida a fazer login.
// 'unknown' enquanto não se sabe (ainda carregando, ou status inesperado: aí a tela não mostra nada)
export type ResumeStatus = 'unknown' | 'notLogged' | 'none' | 'active' | 'inactive';

export interface ISubMenuMyResumeStore {
    hasTabSkills: boolean;
    setHasTabSkills: (hasTabSkills: boolean) => void;
    resumeStatus: ResumeStatus;
    setResumeStatus: (resumeStatus: ResumeStatus) => void;
    // muda a cada exclusão: é a key das abas, que assim são montadas de novo e perdem o estado local dos componentes
    formVersion: number;
    // texto do currículo cujas habilidades a aba Habilidades mostra: o "Salvar dados" das abas do meio não salva um
    // texto novo sem que as habilidades dele tenham sido buscadas
    skillsLoadedFromText: string;
    setSkillsLoadedFromText: (skillsLoadedFromText: string) => void;
}

export const SubMenuMyResumeStore = create<ISubMenuMyResumeStore>((set) => ({
    setHasTabSkills: (hasTabSkills: boolean) => set({ hasTabSkills }),
    hasTabSkills: false,
    setResumeStatus: (resumeStatus: ResumeStatus) => set({ resumeStatus }),
    resumeStatus: 'unknown',
    formVersion: 0,
    skillsLoadedFromText: '',
    setSkillsLoadedFromText: (skillsLoadedFromText: string) => set({ skillsLoadedFromText }),
}));

// as stores das abas como estavam ao abrir a tela, antes de qualquer preenchimento
const storesOfTheTabs: any[] = [TabResumeStore, NotAllowedCompanyStore, TabLanguagesStore, TabOptionsStore, RegioesStore, TabSalaryStore, TabSkillStore, TabSkillsStore, SkillsInternalListStore];
const initialStatesOfTheTabs = storesOfTheTabs.map((store) => store.getState());

/**
 * Limpa o formulário inteiro: cada store das abas volta ao estado inicial (substituído, não mesclado, para não sobrar
 * nenhum campo) e as abas são montadas de novo, o que zera o estado local dos componentes. Até 2026-10-14 o formulário
 * continuava preenchido depois de excluir, e um "Salvar dados" recriava o currículo apagado.
 */
const clearTheForm = () => {
    removeResumeCopy();
    storesOfTheTabs.forEach((store, index) => store.setState(initialStatesOfTheTabs[index], true));
    const { formVersion } = SubMenuMyResumeStore.getState();
    SubMenuMyResumeStore.setState({ hasTabSkills: false, resumeStatus: 'none', formVersion: formVersion + 1, skillsLoadedFromText: '' });
};

const resumeStatusLabels: Record<Exclude<ResumeStatus, 'unknown'>, { text: string; className: string }> = {
    // o texto desta situação é montado em NotLoggedText, que tem o link para o modal de login
    notLogged: { text: '', className: 'resume-status resume-status-not-logged' },
    none:{ text: 'Você ainda não tem currículo salvo', className: 'resume-status resume-status-none' },
    active: { text: 'Currículo ativo: visível para os recrutadores', className: 'resume-status resume-status-active' },
    inactive: { text: 'Currículo inativo: oculto dos recrutadores', className: 'resume-status resume-status-inactive' },
};

const isFilled = (record: any) => !!record && Object.keys(record).length > 0;

/**
 * Busca a situação do currículo ao entrar na tela (GetData: o registro vem debaixo do nome da entidade onde está).
 * Entrar na tela não exige login (só salvar exige): sem login, ou com a sessão expirada, o 401 não abre o modal de
 * login, apenas mostra a faixa que convida a fazer login (NotLoggedText).
 */
const loadResumeStatus = (setResumeStatus: (resumeStatus: ResumeStatus) => void, onResumeFound: (resume: any) => void = () => {}) => {
    const callbacks: any = {};
    callbacks[401] = () => {
        // sem login o JnAjax chama o 401 antes de enviar, e não desliga o carregamento que já ligou
        JnAjax.setNotLoading()();
        setResumeStatus('notLogged');
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
        removeResumeCopy();
        setResumeStatus('none');
    };
    callbacks[404] = () => {
        removeResumeCopy();
        setResumeStatus('none');
    };
    callbacks['onUnexpectedHttpStatus'] = () => setResumeStatus('unknown');
    // GET sem corpo: com {} o jQuery poria "?{}" na URL
    JnAjax.doAnAjaxRequest('resume/{email}', callbacks, 'GET', null as any, {}, 'http://localhost:8081');
};

/**
 * Faixa de quem não está logado (401 na busca do currículo): o "faça login" abre o modal de login (o mesmo do 401 das
 * ações) e, depois de autenticar, a busca é refeita e as abas são preenchidas com o currículo gravado, se houver.
 */
const NotLoggedText = ({ setResumeStatus }: { setResumeStatus: (resumeStatus: ResumeStatus) => void }) => {
    const retryAfterAuthentication = () => loadResumeStatus(setResumeStatus, loadSavedResume);
    const openLoginModal = (event: React.MouseEvent) => {
        event.preventDefault();
        PubSub.publish('httpStatus401', retryAfterAuthentication);
    };
    return (
        <span>
            Você não está logado! Caso tenha cadastrado currículo conosco,{' '}
            <a href="#" onClick={openLoginModal} className="resume-status-login-link">
                faça login
            </a>{' '}
            que seus dados aparecerão aqui.
        </span>
    );
};

// o rótulo que o backend dá a cada habilidade em skills/fromText (VisServiceSkills.putLabel): a própria habilidade, ou
// "palavra (habilidade)" quando foi encontrada por outra palavra. A habilidade sem conhecimento implícito é gravada sem
// o campo parent (a aba Habilidades não o envia vazio), e as listas da aba esperam sempre um array: até 2026-10-15 a
// recarga de um currículo de TI parava em "item.parent is not iterable" e a aba Habilidades sumia.
const toSkillListItem = (savedSkill: any) => {
    const foundByAnotherWord = savedSkill.word && savedSkill.word != savedSkill.skill;
    const label = foundByAnotherWord ? `${savedSkill.word} (${savedSkill.skill})` : savedSkill.skill;
    const parent = savedSkill.parent || [];
    return { ...savedSkill, label, parent };
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
    saveResumeCopy(resumeCopyFromSavedResume(resume));
    TabResumeStore.getState().loadFromSavedResume(resume);
    TabLanguagesStore.getState().loadFromSavedResume(resume);
    TabOptionsStore.getState().loadFromSavedResume(resume);
    RegioesStore.getState().loadFromSavedResume(resume);
    TabSalaryStore.getState().loadFromSavedResume(resume);
    const isTechResume = resume.resumeType == 1;
    isTechResume && loadSavedSkills(resume.skill || []);
};

const currentEmail = (): string => {
    const login: any = JnAjax.getLogin() || {};
    return login.email || '';
};

// Limite de uma vez ao dia de cada ação sobre o currículo salvo (desde 2026-11-07): avisa e devolve true quando a marca
// do navegador diz que a ação já foi feita nas últimas 24 horas, sem abrir a confirmação nem ir ao backend
const isDoneToday = (action: ResumeDailyAction) => {
    const blockMessage = getResumeDailyActionBlockMessage(currentEmail(), action);
    if (!blockMessage) {
        return false;
    }
    PubSub.publish('showMessage', { summary: 'Limite diário atingido', detail: blockMessage, severity: 'warn' });
    return true;
};

// 429 do backend: a ação já foi feita nas últimas 24 horas (em outra janela ou outro navegador); a marca passa a valer aqui
const getHandler429 = (action: ResumeDailyAction) => () => {
    recordResumeDailyAction(currentEmail(), action);
    PubSub.publish('showMessage', { summary: 'Limite diário atingido', detail: getResumeDailyLimitReachedMessage(action), severity: 'warn' });
};

/**
 * Reativa ou inativa o currículo (ChangeStatus: o ativo vai para a gêmea, o inativo volta para a principal).
 * É ação do usuário: aqui o 401 abre o modal de login e, depois dele, a ação é refeita. Uma de cada por dia (429).
 */
const changeResumeStatus = (newStatus: ResumeStatus, setResumeStatus: (resumeStatus: ResumeStatus) => void) => {
    const action: ResumeDailyAction = newStatus === 'active' ? 'reactivation' : 'inactivation';
    const callbacks: any = {};
    callbacks['retryAfterAuthentication'] = () => changeResumeStatus(newStatus, setResumeStatus);
    callbacks[429] = getHandler429(action);
    callbacks[200] = () => {
        recordResumeDailyAction(currentEmail(), action);
        setResumeStatus(newStatus);
        // título e detalhe diferentes: até 2026-10-15 o toast repetia o título no corpo (achado 29)
        const reactivated = newStatus === 'active';
        const summary = reactivated ? 'Currículo reativado' : 'Currículo inativado';
        const detail = reactivated
            ? 'Seu currículo voltou a aparecer para os recrutadores.'
            : 'Seu currículo não aparece mais para os recrutadores até que você o reative.';
        PubSub.publish('showMessage', { summary, detail });
    };
    // o currículo não existe mais (excluído em outra janela): as abas são limpas como no Excluir, para um "Salvar dados"
    // não recriar o currículo apagado. Até 2026-10-15 só a faixa mudava, sem aviso, e as abas ficavam preenchidas (R05-1)
    callbacks[404] = () => {
        clearTheForm();
        PubSub.publish('showMessage', { summary: 'Currículo não encontrado', detail: 'Seu currículo não existe mais: ele foi excluído em outra janela.' });
    };
    JnAjax.doAnAjaxRequest('resume/{email}/language/portuguese/status', callbacks, 'DELETE', {}, {}, 'http://localhost:8081');
};

/**
 * Apaga de vez o currículo, esteja onde estiver (Delete: deleteAnyWhere da entidade). Como no reativar, o 401 abre o
 * modal de login e a ação é refeita depois dele. Uma exclusão por dia (429), mesmo depois de cadastrar de novo.
 */
const deleteResume = (setResumeStatus: (resumeStatus: ResumeStatus) => void) => {
    const callbacks: any = {};
    callbacks['retryAfterAuthentication'] = () => deleteResume(setResumeStatus);
    callbacks[429] = getHandler429('exclusion');
    callbacks[200] = () => {
        recordResumeDailyAction(currentEmail(), 'exclusion');
        clearTheForm();
        PubSub.publish('showMessage', { summary: 'Currículo excluído', detail: 'Todos os dados do seu currículo foram apagados.' });
    };
    JnAjax.doAnAjaxRequest('resume/{email}/language/portuguese', callbacks, 'DELETE', {}, {}, 'http://localhost:8081');
};

/**
 * Os botões da faixa de situação, conforme a entidade onde estão os dados: na principal (ativo) inativar e excluir; na
 * gêmea (inativo) reativar e excluir; em nenhuma das duas, ou sem login, nenhum. Os três pedem confirmação. Até
 * 2026-10-15 ficavam ao lado do "Salvar dados", só na última aba, e para inativar o candidato passava por todas as abas
 * com as validações de cada uma (achado 27).
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
            <button onClick={() => !isDoneToday('inactivation') && setConfirmingInactivate(true)} type="button" className="btn btn-warning gap-2 whitespace-nowrap">
                <IconEye className="h-4 w-4" />
                Inativar
            </button>
        ) : (
            <button onClick={() => !isDoneToday('reactivation') && setConfirmingReactivate(true)} type="button" className="btn btn-success gap-2 whitespace-nowrap">
                <IconRefresh className="h-4 w-4" />
                Reativar
            </button>
        );

    return (
        <>
            <ConfirmModal
                visible={confirmingInactivate}
                onHide={() => setConfirmingInactivate(false)}
                header="Inativar currículo"
                message={`Seu currículo deixará de aparecer para os recrutadores até que você o reative. ${getResumeDailyActionConfirmMessage('inactivation')}`}
                danger
                acceptLabel="Sim, inativar"
                rejectLabel="Não"
                accept={() => changeResumeStatus('inactive', setResumeStatus)}
            />
            <ConfirmModal
                visible={confirmingReactivate}
                onHide={() => setConfirmingReactivate(false)}
                header="Reativar currículo"
                message={`Seu currículo voltará a aparecer para os recrutadores. ${getResumeDailyActionConfirmMessage('reactivation')}`}
                acceptLabel="Sim, reativar"
                rejectLabel="Não"
                accept={() => changeResumeStatus('active', setResumeStatus)}
            />
            <ConfirmModal
                visible={confirmingDelete}
                onHide={() => setConfirmingDelete(false)}
                header="Excluir currículo"
                message={`Todos os dados do seu currículo serão apagados de vez, sem como recuperar. ${getResumeDailyActionConfirmMessage('exclusion')}`}
                danger
                acceptLabel="Sim, excluir"
                rejectLabel="Não"
                accept={() => deleteResume(setResumeStatus)}
            />
            {statusButton}
            <button onClick={() => !isDoneToday('exclusion') && setConfirmingDelete(true)} type="button" className="btn btn-danger gap-2 whitespace-nowrap">
                <IconTrash className="h-4 w-4" />
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

const saveResume = (stateSkills: any, stateResume: any, stateLanguage: any, stateSalary: any, stateRegioes: any, stateOptions: any, onSaved: () => void) => {
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
    // salvar um currículo que já existe (ativo ou inativo) é atualização: uma por dia (429); cadastrar não tem limite
    const { resumeStatus } = SubMenuMyResumeStore.getState();
    const isUpdate = resumeStatus === 'active' || resumeStatus === 'inactive';

    callbacks['retryAfterAuthentication'] = () => saveResume(stateSkills, stateResume, stateLanguage, stateSalary, stateRegioes, stateOptions, onSaved);
    callbacks[429] = getHandler429('update');
    callbacks[200] = () => {
        isUpdate && recordResumeDailyAction(currentEmail(), 'update');
        // callbacks[200] = (responseFromBackEnd: any) => {
        // salvar sempre deixa o currículo na entidade principal (reativa o inativo)
        SubMenuMyResumeStore.getState().setResumeStatus('active');
        saveResumeCopy({ resumeType, ddd, experienceStartYear: new Date().getFullYear() - experience, skills: resumeSkillsFrom(skill) });
        PubSub.publish('showMessage', {
            summary: 'Currículo salvo com sucesso',
            detail: 'Seu currículo está ativo e visível para os recrutadores.',
        });
        onSaved();
    };
    JnAjax.doAnAjaxRequest('resume/{email}/language/portuguese', callbacks, 'POST', resume, {}, 'http://localhost:8081');
};

const SubMenuMyResume = () => {
    const router = useRouter();
    // quem veio de "Vagas compatíveis comigo" sem currículo volta para a pesquisa que pediu
    const returnToThePendingSearch = () => resumeSavedForTheSearch() && router.push('/estatisticas/skills');
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
    // quem entra pelo menu do header (e não pelo "faça login" da faixa) também vê o currículo carregar: quando o modal de
    // login fecha com sessão válida e a tela ainda estava como "não logado", a busca é refeita (até 2026-11-08 a faixa
    // continuava dizendo que não estava logado)
    // ao sair do sistema, o formulário volta vazio e a faixa passa a convidar ao login
    useEffect(() => {
        const token = PubSub.subscribe('logout', () => {
            clearTheForm();
            setResumeStatus('notLogged');
        });
        return () => PubSub.unsubscribe(token);
    }, []);
    const loginModalVisible = ModalLoginStore((state: IModalLoginStore) => state.visible);
    useEffect(() => {
        if (!loginModalVisible && resumeStatus === 'notLogged' && JnAjax.hasLogin()) {
            loadResumeStatus(setResumeStatus, loadSavedResume);
        }
    }, [loginModalVisible]);
    const resumeStatusLabel = resumeStatus === 'unknown' ? null : resumeStatusLabels[resumeStatus];

    // edição de currículo já salvo (ativo ou inativo): salvar é atualização, uma por dia, e pede confirmação
    const isEditing = resumeStatus === 'active' || resumeStatus === 'inactive';
    const [confirmingUpdate, setConfirmingUpdate] = useState(false);
    const confirmTheSave = () => saveResume(stateSkills, stateResume, stateLanguage, stateSalary, stateRegioes, stateOptions, returnToThePendingSearch);
    // o "Salvar dados" de qualquer aba: confere as pendências de todas as abas; cadastrar salva direto, atualizar abre a
    // confirmação, a não ser que a atualização do dia já tenha sido feita (o aviso sai como as pendências)
    const requestSave = (): string[] => {
        const formErrors = getAllPendingRequirements(stateSkills, stateResume, stateLanguage, stateSalary, stateRegioes, stateOptions);
        if (formErrors.length) {
            return formErrors;
        }
        if (!isEditing) {
            confirmTheSave();
            return [];
        }
        const blockMessage = getResumeDailyActionBlockMessage(currentEmail(), 'update');
        if (blockMessage) {
            return [blockMessage];
        }
        setConfirmingUpdate(true);
        return [];
    };

    const tabs = [
        {
            label: 'Currículo',
            icon: <IconFile className="h-4 w-4" />,
            onMoveOnFowardTabs: () => loadSkillsFromBackEnd(stateResume, stateSkills, stateSubMenuMyResume),
            getPendingRequirements: stateResume.getPendingRequirements,
            fieldsShowPendingRequirements: true,
        },
        { label: 'Idiomas', icon: <IconGlobe className="h-4 w-4" />, onMoveOnFowardTabs: stateLanguage.onMoveOnFowardTabs, getPendingRequirements: stateLanguage.getPendingRequirements },
        {
            label: 'Opções',
            icon: <IconSettings className="h-4 w-4" />,
            onMoveOnFowardTabs: () => getOptionsPendingRequirements(stateRegioes, stateOptions),
            getPendingRequirements: () => getOptionsPendingRequirements(stateRegioes, stateOptions),
        },
        {
            label: 'Salários',
            icon: <IconDollarSign className="h-4 w-4" />,
            onMoveOnFowardTabs: requestSave,
            getPendingRequirements: () => getAllPendingRequirements(stateSkills, stateResume, stateLanguage, stateSalary, stateRegioes, stateOptions),
        },
    ];
    // mesmo número que aparece ao lado do título da lista principal (habilidades pelas quais o currículo é ENCONTRADO)
    const mainSkillsGroup: any = stateSkills.groups.filter((group: any) => group.main)[0];
    const mainSkillsCount = mainSkillsGroup && mainSkillsGroup.list ? mainSkillsGroup.list.length : 0;
    const tabSkills: any = {
        label: `${mainSkillsCount} Habilidades`,
        icon: <IconGithub className="h-4 w-4" />,
        title: 'Caso as habilidades estiverem desatualizadas / incorretas, volte à aba currículo e preencha o texto do currículo, para que possamos atualizar corretamente a sua lista de habilidades',
        onMoveOnFowardTabs: stateSkills.getPendingRequirements,
        getPendingRequirements: stateSkills.getPendingRequirements,
    };

    hasTabSkills && tabs.splice(2, 0, tabSkills);

    const statusButtons = <ResumeStatusButtons resumeStatus={resumeStatus} setResumeStatus={setResumeStatus} />;

    // edição de currículo já salvo: cada aba, menos a última, ganha o "Salvar dados", igual ao da última
    const saveFromAnyTab = () => {
        const typedResumeText = stateResume.resumeText || '';
        const skillsOutdated = isTechResume(stateResume) && !!typedResumeText.trim() && typedResumeText !== stateSubMenuMyResume.skillsLoadedFromText;
        if (skillsOutdated) {
            return ['Aba Currículo: você colou um texto novo do currículo. Avance até a aba Habilidades para conferir as habilidades encontradas nele antes de salvar.'];
        }
        return requestSave();
    };
    const saveShortcutButton = isEditing ? { label: 'Salvar dados', icon: <IconSave className="h-4 w-4" />, onClick: saveFromAnyTab } : undefined;

    return (
        <div>
            <ConfirmModal
                visible={confirmingUpdate}
                onHide={() => setConfirmingUpdate(false)}
                header="Atualizar currículo"
                message={`Os dados do seu currículo serão substituídos pelos desta tela. ${getResumeDailyActionConfirmMessage('update')}`}
                acceptLabel="Sim, atualizar"
                rejectLabel="Não"
                accept={confirmTheSave}
            />
            {resumeStatusLabel && (
                <div className={`${resumeStatusLabel.className} resume-status-actions`}>
                    {resumeStatus === 'notLogged' ? <NotLoggedText setResumeStatus={setResumeStatus} /> : <span>{resumeStatusLabel.text}</span>}
                    {statusButtons}
                </div>
            )}
            {hasTabSkills ? (
                <Tabs key={stateSubMenuMyResume.formVersion} tabs={tabs} lastButtonLabel="Salvar dados" lastButtonIcon={<IconSave className="h-4 w-4" />} shortcutButton={saveShortcutButton}>
                    <TabResume />
                    <TabLanguages />
                    <TabSkills2 getAccordionList={getImplicitSkills} />
                    <TabOptions />
                    <TabSalary />
                </Tabs>
            ) : (
                <Tabs key={stateSubMenuMyResume.formVersion} tabs={tabs} lastButtonLabel="Salvar dados" lastButtonIcon={<IconSave className="h-4 w-4" />} shortcutButton={saveShortcutButton}>
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
    // só o currículo de tecnologia (tipo 1) tem a aba Habilidades: os outros tipos não pedem habilidades ao backend
    // (até 2026-10-14 a chamada saía para todos os tipos, com o texto vazio)
    if (stateResume.resumeType.id != 1) {
        return [];
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
    callbacks[200] = (responseFromBackEnd: any) => {
        putSkillsInStore(responseFromBackEnd, stateSkills, requestSkillsToBackEnd, stateSubMenuMyResume);
        SubMenuMyResumeStore.getState().setSkillsLoadedFromText(requestSkillsToBackEnd.text);
    };
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
