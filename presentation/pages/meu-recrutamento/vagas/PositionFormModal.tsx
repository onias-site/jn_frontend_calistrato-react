'use client';
import React, { useEffect, useState } from 'react';
import { Checkbox, MultiSelect, NumberInput, Select, Textarea, TextInput } from '@mantine/core';
import { sha1 } from 'js-sha1';
import JnAjax from '@/app/JnAjax';
import { Tabs } from '@/presentation/components/source/Tabs';
import { HelpButton } from '@/presentation/components/source/HelpButton';
import { LabelComponent } from '@/presentation/components/source/LabelComponent';
import { CheckBoxComponent } from '@/presentation/components/source/CheckBoxComponent';
import { IntegerFieldComponent } from '@/presentation/components/source/IntegerFieldComponent';
import { SummaryMultiSelect } from '@/presentation/components/source/SummaryMultiSelect';
import { notify } from '@/presentation/components/source/notify';
import { dddRegions } from '@/presentation/components/regions/dddRegions';
import { resumeTypes } from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/tabs/TabResume/FormResume';
import { languages } from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/tabs/TabLanguages/ChooserLanguages';
import { SkillStore, SkillsAccordionView, SkillsSource, TabSkills2, createSkillStore, getImplicitSkills } from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/tabs/TabSkills/TabSkills';
import { AddAsFilterButton } from './AddAsFilterButton';
import { PublishInGroupsCheckBox } from './PublishInGroupsCheckBox';
import { HOME_OFFICE, TODAS_AS_REGIOES } from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/tabs/TabFilter/RegioesComponent';
import IconFile from '@/presentation/icons/icon-file';
import IconGlobe from '@/presentation/icons/icon-globe';
import IconGithub from '@/presentation/icons/icon-github';
import IconSettings from '@/presentation/icons/icon-settings';
import IconFilter from '@/presentation/icons/icon-filter';
import IconDollarSign from '@/presentation/icons/icon-dollar-sign';
import IconSave from '@/presentation/icons/icon-save';
import IconUsers from '@/presentation/icons/icon-users';
import { ResumesOfTheFiltersMessage, useResumesOfTheFilters } from './ResumesOfTheFiltersMessage';
import { ResumesOfThePositionFilters } from './ResumesOfThePositionFilters';
import { filtersRequestOf } from './resumesOfTheFilters';
import {
    Contact,
    DESIRED_SKILLS,
    LIMITS,
    REQUIRED_SKILLS,
    REQUIRED_SKILLS_MAX,
    Position,
    PositionForm,
    SortRule,
    contactTypeOptions,
    copyFormOf,
    emptyForm,
    formOf,
    frequencyOptions,
    isTechPosition,
    languageLevelOptions,
    languagesTabErrors,
    optionsTabErrors,
    filtersTabErrors,
    pendingRequirements,
    positionOf,
    positionTabErrors,
    positionTabFieldErrors,
    requestBodyOf,
    resumesEmailError,
    salaryTabErrors,
    sendsTheResumes,
    seniorityOptions,
    skillGroupsFromText,
    skillGroupsOfThePosition,
    sortCriteriaOf,
    sortKeyOf,
    sortRuleOf,
    sortToShow,
    simplifiedFormOf,
    simplifiedSkillGroupsFromText,
    simplifiedSortOf,
    today,
} from './positionsData';

type PositionFormModalProps = {
    // sem vaga, "Abrir nova vaga": o título vem vazio e é obrigatório; com vaga, "Editar": o título (parte da chave) fica travado
    position: Position | null;
    // a vaga gravada: a tela atualiza a lista e o modal continua aberto, na aba "Currículos aderentes"
    onSaved: (position: Position) => void;
    onCancel: () => void;
    // "Abrir vaga simplificada" (desde 2026-11-24): só as abas Vaga e Salários, o resto preenchido (simplifiedFormOf); o
    // link da contagem de currículos mostra todas as abas, e salvar sem ter passado por ele fecha o modal
    simplified?: boolean;
    // o link "Ver os currículos encontrados" do grid (desde 2026-11-24): o modal abre já na aba "Currículos aderentes",
    // como se o link da contagem tivesse sido clicado
    openOnResumes?: boolean;
    // "Copiar" (desde 2026-11-24): sem vaga (position null, é uma vaga nova), mas com o formulário e as habilidades desta,
    // menos o título e o período (copyFormOf)
    template?: Position | null;
};

const resumeTypeOptions = resumeTypes.map((type) => ({ value: String(type.id), label: type.label }));
const regionOptions = [{ value: TODAS_AS_REGIOES, label: 'Qualquer estado / cidade' }, ...dddRegions.filter((region) => region.id != HOME_OFFICE).map((region) => ({ value: region.id, label: region.nome }))];
const allRegions = regionOptions.map((option) => option.value).filter((value) => value != TODAS_AS_REGIOES);
const languageOptions = languages.map((language) => ({ value: language.name, label: language.name }));
const fieldLabel = 'mb-1.5 block font-semibold text-dark dark:text-white-light';
// as listas abrem dentro do modal (como no formulário de currículo): fora dele, a rolagem do modal as deixaria para trás
const inside = { withinPortal: false };
// a pendência da aba Vaga enquanto o skills/fromText lê a descrição: segura o avançar até a resposta chegar
const READING_THE_SKILLS = 'Aguarde: as habilidades da descrição ainda estão sendo lidas.';

// a sugestão de habilidade da aba Habilidades (desde 2026-11-22): a habilidade sugerida precisa constar na descrição da
// vaga, de onde saem as listas
const skillsSourceOf = (description: string): SkillsSource => ({
    text: description,
    textMissing: 'Para sugerir uma habilidade, preencha a descrição da vaga na aba Vaga: só por ela dá para conferir que a habilidade consta na vaga.',
    owner: 'da vaga',
    inText: 'na descrição da vaga',
});

// a coluna de acordeões da aba Habilidades da vaga (desde 2026-11-22): os termos abrangentes demais da descrição, que o
// skills/fromText devolve em broadSkill, cada um com todas as habilidades abaixo dele na hierarquia; cada uma com o botão
// que a acrescenta como filtro (às obrigatórias)
const broadSkillsViewOf = (store: SkillStore): SkillsAccordionView => ({
    title: 'Ferramentas abrangentes',
    helpTitle: 'O que são ferramentas abrangentes?',
    tooltip: 'Clique aqui para saber o que são ferramentas abrangentes',
    explanation:
        'São termos da descrição da vaga abrangentes demais para dizer qual tecnologia a vaga procura. Exemplo: "programador backend" não diz se a vaga quer ' +
        'Java, .NET ou PHP. Quando a descrição cita um termo assim e nenhuma das habilidades que o especificam, ele aparece aqui com todas elas, diretas ou ' +
        'indiretas: são as especificações desse termo abrangente demais. Se ele estiver entre as habilidades obrigatórias, a contagem aceita o currículo que ' +
        'tiver qualquer uma delas. Para uma busca mais precisa, cite na descrição a tecnologia que a vaga pede (ex.: "programador backend PHP"): o termo ' +
        'deixa de ser abrangente e sai desta lista.',
    childrenHeader: (skill) => `Especificações de ${skill}, termo abrangente demais:`,
    items: (state) => ((state.context || {}).broadSkill || []).map((broad: any) => ({ skill: broad.skill, children: (broad.children || []).map((child: string) => ({ label: child, skill: child })) })),
    // sem associar e desassociar: os filhos são todos os descendentes, e desassociar um indireto não teria efeito
    withHierarchyFix: false,
    childAction: (child) => <AddAsFilterButton store={store} skill={child.skill} />,
});

/**
 * O modal de "Abrir nova vaga" e de "Editar" da tela "Meu Recrutamento → Vagas", em abas sequenciais e com a aparência do
 * cadastro de currículo (desde 2026-11-22): rótulos com o botão de ajuda (LabelComponent), os checkboxes com explicação e
 * o erro de cada campo embaixo dele. A primeira aba, "Vaga", tem título, área, descrição, contatos, as datas de início e
 * de fim; depois vêm Habilidades (com os idiomas no topo; sem ela, a aba Idiomas), Filtros (regiões, com a contagem
 * dos currículos delas, senioridade e o mais que filtra os currículos) e Salários, e por último Opções (como receber os currículos aderentes, inclusive
 * pelos próprios candidatos, a divulgação nos grupos e a ordem dos currículos), cujo avançar grava a vaga. Como no currículo, sair da primeira aba numa vaga de tecnologia manda a
 * descrição ao skills/fromText, que preenche as duas listas de arrastar e soltar (obrigatórias e desejáveis) e os
 * conhecimentos implícitos; a aba Habilidades só aparece com alguma habilidade encontrada. As listas ficam numa store só
 * deste modal (createSkillStore). A aba "Currículos aderentes" aparece pelo link da contagem ou ao gravar a vaga (o modal
 * continua aberto nela), com a lista ordenada pelos critérios da aba Opções. A gravação é assíncrona no backend: a tela põe na lista o que enviou, sem reler.
 */
// todas as regiões mais o home office: as regiões da vaga simplificada
const allDddsWithHomeOffice = [...dddRegions.map((region) => region.id).filter((id) => id != HOME_OFFICE), HOME_OFFICE];

export const PositionFormModal = ({ position, onSaved, onCancel, simplified = false, openOnResumes = false, template = null }: PositionFormModalProps) => {
    // a vaga de onde vêm os dados: a editada ou, numa cópia, o molde
    const source = position ?? template;
    // a vaga simplificada mostra só Vaga e Salários até o usuário abrir a lista de currículos pelo link da contagem
    const [expanded, setExpanded] = useState(!simplified);
    const collapsed = simplified && !expanded;
    const goToTheResumesAfterExpanding = React.useRef(false);
    // gravada uma vez, a vaga nova passa a ser editada: o título trava e o próximo "Salvar dados" vai ao /edit
    const [savedOnce, setSavedOnce] = useState(false);
    const creating = position == null && !savedOnce;
    const [form, setForm] = useState<PositionForm>(() => {
        if (position != null) return formOf(position);
        if (template != null) return copyFormOf(template);
        if (!simplified) return emptyForm();
        const logged: any = JnAjax.getLogin() || {};
        return simplifiedFormOf(allDddsWithHomeOffice, logged.email || '');
    });
    const [saving, setSaving] = useState(false);
    // o erro de cada campo da aba Vaga só aparece depois da primeira tentativa de avançar ou salvar
    const [attempted, setAttempted] = useState(false);
    const [goToTab, setGoToTab] = useState<{ index: number } | undefined>(undefined);
    // a store das habilidades deste modal; na edição de uma vaga de tecnologia, já com as habilidades gravadas
    const [skillStore] = useState(() => {
        const store = createSkillStore();
        if (source == null || String(source.resumeType) != '1') return store;
        const { groups, context } = skillGroupsOfThePosition(source.skill, sha1(source.description.trim()));
        store.getState().setGroups(groups as any, getImplicitSkills);
        store.getState().setContext(context);
        return store;
    });
    const skillGroups: any[] = skillStore((state) => state.groups);
    const [broadSkillsView] = useState(() => broadSkillsViewOf(skillStore));
    // na edição as listas vêm da vaga gravada, sem passar pelo skills/fromText, e as ferramentas abrangentes não são gravadas:
    // pede-as uma vez ao abrir, sem mexer nas listas (sem login, a coluna fica vazia até a descrição ser relida)
    useEffect(() => {
        const context = skillStore.getState().context || {};
        if (source == null || String(source.resumeType) != '1' || context.broadSkill) return;
        const text = source.description.trim();
        const callbacks: any = {};
        callbacks['setLoading'] = () => {};
        callbacks['setNotLoading'] = () => {};
        callbacks[401] = () => {};
        callbacks['onUnexpectedHttpStatus'] = () => {};
        callbacks[200] = (response: any) => {
            const current = skillStore.getState().context || {};
            // a descrição já foi relida (e trouxe as suas): esta resposta é velha
            if (current.cacheHash != sha1(text) || current.broadSkill) return;
            skillStore.getState().setContext({ ...current, broadSkill: response.broadSkill || [] });
        };
        const request = { excludedSkill: skillStore.getState().getWordsFromGroup(REQUIRED_SKILLS), text };
        JnAjax.doAnAjaxRequest('skills/fromText', callbacks, 'POST', request, {}, 'http://localhost:8081');
    }, []);
    // os filtros da contagem de currículos: as habilidades da lista de obrigatórias e o domínio de quem está logado
    const requiredSkills: string[] = (skillGroups.find((group) => group.name == REQUIRED_SKILLS)?.list || []).map((item: any) => item.skill);
    const login: any = JnAjax.getLogin() || {};
    const filtersRequest = filtersRequestOf(form, requiredSkills, login.email);
    // uma contagem para o modal inteiro, pedida a cada filtro preenchido; a mesma mensagem aparece em cada aba com filtros
    // (Vaga, Habilidades ou Idiomas, Filtros e Salários)
    const resumesOfTheFilters = useResumesOfTheFilters(filtersRequest);
    // a aba "Currículos aderentes" (desde 2026-11-22) aparece pelo link da contagem, só com login; o índice dela muda com as
    // abas anteriores (a de Habilidades vai e vem), por isso o render guarda aqui onde ela entra
    const [resumesTabShown, setResumesTabShown] = useState(false);
    const resumesTabIndex = React.useRef(0);
    const seeTheResumes = () => {
        const logged: any = JnAjax.getLogin() || {};
        // sem login, o modal de login; ao entrar, repete o clique
        if (!logged.email) return JnAjax.getHandler401(seeTheResumes)();
        setResumesTabShown(true);
        // na vaga simplificada ainda recolhida, todas as abas aparecem; a da lista só tem índice depois de elas aparecerem
        if (collapsed) {
            goToTheResumesAfterExpanding.current = true;
            setExpanded(true);
            return;
        }
        setGoToTab({ index: resumesTabIndex.current });
    };
    useEffect(() => {
        if (!expanded || !goToTheResumesAfterExpanding.current) return;
        goToTheResumesAfterExpanding.current = false;
        setGoToTab({ index: resumesTabIndex.current });
    }, [expanded]);
    // aberto pelo link do grid: uma vez só, depois do primeiro render (quando o índice da aba já foi calculado)
    useEffect(() => {
        if (openOnResumes) seeTheResumes();
    }, []);
    const resumesMessage = <ResumesOfTheFiltersMessage request={filtersRequest} {...resumesOfTheFilters} onSeeTheResumes={seeTheResumes} />;
    const [hasTabSkills, setHasTabSkills] = useState(skillGroups.some((group) => group.list.length > 0));
    // o skills/fromText ainda lê a descrição (desde 2026-11-23): o avançar e a aba Habilidades ficam desabilitados e
    // girando, e a aba Vaga só é deixada quando a resposta chega
    const [loadingSkills, setLoadingSkills] = useState(false);
    const showTabSkills = (hasTabSkills || loadingSkills) && isTechPosition(form);
    const set = (changes: Partial<PositionForm>) => setForm((current) => ({ ...current, ...changes }));
    // o e-mail que recebe os currículos vem com o do recrutador logado; sem login ao abrir, entra quando ele faz login (a
    // tela da vaga não exige login para começar) e o campo ainda está vazio
    const loggedEmail: string = (JnAjax.getLogin() || ({} as any)).email || '';
    useEffect(() => {
        if (!loggedEmail || form.resumesEmail) return;
        set({ resumesEmail: loggedEmail });
    }, [loggedEmail]);
    const fieldErrors = attempted ? positionTabFieldErrors(form, creating) : {};

    // a ordem dos currículos (desde 2026-11-23): um critério por linha, só os que a vaga pede, e a padrão enquanto o usuário
    // não mexer nela; as habilidades desejáveis da aba Habilidades viram critérios, uma a uma
    const desiredSkills: string[] = (skillGroups.find((group) => group.name == DESIRED_SKILLS)?.list || []).map((item: any) => item.skill);
    const sortCriteria = sortCriteriaOf(form, desiredSkills);
    // a vaga simplificada ordena pelas pretensões informadas e pela experiência, enquanto o usuário não mexer na ordem
    const shownSort = simplified && !form.sortEdited ? simplifiedSortOf(form) : sortToShow(form, desiredSkills);
    const shownSortKey = JSON.stringify(shownSort);
    useEffect(() => {
        if (JSON.stringify(form.sort) == shownSortKey) return;
        set({ sort: shownSort });
    }, [shownSortKey]);
    const editSort = (sort: SortRule[]) => set({ sort, sortEdited: true });
    const setSort = (index: number, rule: SortRule) => editSort(shownSort.map((current, i) => (i == index ? rule : current)));
    const setContact = (index: number, changes: Partial<Contact>) => set({ contact: form.contact.map((contact, i) => (i == index ? { ...contact, ...changes } : contact)) });

    // a descrição que deu as habilidades da aba já não é a do campo: falta passar pela aba Habilidades
    const skillsOutdated = () => isTechPosition(form) && skillStore.getState().context.cacheHash != sha1(form.description.trim());

    // ao sair da aba Vaga, como ao sair da aba Currículo: as habilidades da descrição, só quando ela mudou
    const loadSkillsFromText = (): string[] => {
        // a pendência segura o usuário na aba Vaga (que não a repete em notificação: os campos mostram as suas)
        if (loadingSkills) return [READING_THE_SKILLS];
        setAttempted(true);
        const errors = positionTabErrors(form, creating);
        if (errors.length) return errors;
        // só a vaga de Tecnologia da Informação vai ao skills/fromText (e só ela tem a aba Habilidades)
        if (!isTechPosition(form)) return [];
        if (!skillsOutdated()) return [];
        const text = form.description.trim();
        const cacheHash = sha1(text);
        const skillState = skillStore.getState();
        // as encontradas vão para as desejáveis; as já arrastadas para as obrigatórias vão como excluídas, para não reaparecerem
        // entre as desejáveis
        const requestSkillsToBackEnd = { excludedSkill: skillState.getWordsFromGroup(REQUIRED_SKILLS), text };
        const callbacks: any = {};
        callbacks[200] = (response: any) => {
            // na vaga simplificada todas as encontradas são obrigatórias
            const groups = simplified ? simplifiedSkillGroupsFromText(response) : skillGroupsFromText(response);
            skillState.setGroups(groups as any, getImplicitSkills);
            skillState.setContext({ ...response, requestSkillsToBackEnd, cacheHash });
            setHasTabSkills((response.skill || []).length > 0 || (response.excludedSkill || []).length > 0);
            setLoadingSkills(false);
            // lidas as habilidades, a aba seguinte à Vaga: a Habilidades, ou a Idiomas quando nenhuma foi encontrada
            setGoToTab({ index: 1 });
        };
        callbacks[401] = () => {
            setLoadingSkills(false);
            JnAjax.setNotLoading()();
            JnAjax.getHandler401(loadSkillsFromText)();
        };
        callbacks['onUnexpectedHttpStatus'] = () => {
            setLoadingSkills(false);
            notify({ summary: 'Habilidades não encontradas', detail: 'Não foi possível ler as habilidades da descrição agora. Avance de novo para tentar outra vez.', severity: 'error' });
        };
        setLoadingSkills(true);
        JnAjax.doAnAjaxRequest('skills/fromText', callbacks, 'POST', requestSkillsToBackEnd, {}, 'http://localhost:8081');
        return [READING_THE_SKILLS];
    };

    const tabs: any[] = [
        {
            label: 'Vaga',
            icon: <IconFile className="h-4 w-4" />,
            getPendingRequirements: () => positionTabErrors(form, creating),
            onMoveOnFowardTabs: loadSkillsFromText,
            fieldsShowPendingRequirements: true,
        },
        { label: 'Idiomas', icon: <IconGlobe className="h-4 w-4" />, getPendingRequirements: () => languagesTabErrors(form), onMoveOnFowardTabs: () => languagesTabErrors(form) },
        { label: 'Filtros', icon: <IconFilter className="h-4 w-4" />, getPendingRequirements: () => filtersTabErrors(form), onMoveOnFowardTabs: () => filtersTabErrors(form) },
        { label: 'Salários', icon: <IconDollarSign className="h-4 w-4" />, getPendingRequirements: () => salaryTabErrors(form), onMoveOnFowardTabs: () => salaryTabErrors(form) },
        // a última antes de gravar: o avançar dela salva a vaga (com a aba dos currículos aderentes aberta numa vaga nova, só
        // avança até ela, e o botão dela é o que salva)
        {
            label: 'Opções',
            icon: <IconSettings className="h-4 w-4" />,
            getPendingRequirements: () => optionsTabErrors(form),
            onMoveOnFowardTabs: () => (resumesTabShown && !savedOnce ? optionsTabErrors(form) : save()),
        },
    ];

    // devolve as pendências de todas as abas; sem nenhuma, envia e devolve vazio (a convenção do Tabs)
    const save = (): string[] => {
        setAttempted(true);
        if (skillsOutdated()) return ['Aba Vaga: a descrição mudou. Avance até a aba Habilidades para conferir as habilidades encontradas nela antes de salvar.'];
        const skillErrors = showTabSkills ? [...requiredSkillsErrors(), ...skillStore.getState().getPendingRequirements()] : [];
        const errors = [...pendingRequirements(form, creating), ...skillErrors];
        if (errors.length || saving) return errors;
        setSaving(true);
        const body = requestBodyOf({ ...form, sort: shownSort }, skillStore.getState().loadSkillsContext());
        const callbacks: any = {};
        callbacks[200] = () => {
            setSaving(false);
            notify({ summary: creating ? 'Vaga aberta' : 'Vaga salva', detail: 'A lista já mostra a vaga como você a gravou.' });
            onSaved(positionOf(body));
            // a vaga simplificada sem a lista aberta pelo link da contagem: o modal só fecha
            if (collapsed) return onCancel();
            // a aba dos currículos aderentes aparece (se o link da contagem ainda não a abriu) e o modal vai para ela
            setResumesTabShown(true);
            !savedOnce && setGoToTab({ index: resumesTabIndex.current });
            setSavedOnce(true);
        };
        callbacks[409] = () => {
            setSaving(false);
            notify({ summary: 'Título repetido', detail: 'Você já tem uma vaga com este título. Escolha outro título ou edite a vaga que já existe.', severity: 'error' });
        };
        callbacks[404] = () => {
            setSaving(false);
            notify({ summary: 'Vaga não encontrada', detail: 'Esta vaga não está mais entre as suas.', severity: 'error' });
        };
        callbacks[422] = () => {
            setSaving(false);
            notify({ summary: 'Dados inválidos', detail: 'Confira os campos da vaga e tente de novo.', severity: 'error' });
        };
        // 410 (desde 2026-11-23): o provedor de e-mail suprime o endereço que receberia os currículos
        callbacks[410] = () => {
            setSaving(false);
            notify({
                summary: 'E-mail sem recebimento',
                detail: `O e-mail '${body.resumesEmail}' não está recebendo as nossas mensagens (ele devolveu e-mails anteriores, não existe ou os marcou como spam), então os currículos não chegariam a ele. Informe outro endereço de e-mail na aba Opções.`,
                severity: 'error',
            });
        };
        callbacks[401] = () => {
            // sem login o JnAjax chama o 401 antes de enviar, e não desliga o carregamento que já ligou
            JnAjax.setNotLoading()();
            setSaving(false);
            JnAjax.getHandler401(save)();
        };
        callbacks['onUnexpectedHttpStatus'] = () => {
            setSaving(false);
            notify({ summary: 'Não foi possível gravar', detail: 'Tente de novo em alguns instantes.', severity: 'error' });
        };
        const uri = creating ? 'recruiter/{email}/positions' : 'recruiter/{email}/positions/edit';
        JnAjax.doAnAjaxRequest(uri, callbacks, 'POST', body, {}, 'http://localhost:8081');
        return [];
    };

    // a aba Habilidades toma o lugar da aba Idiomas (Vaga, Habilidades, Filtros, Salários, Opções), com os idiomas no topo
    // dela e o número de habilidades da vaga (desejáveis e obrigatórias: as encontradas começam todas nas desejáveis); sem
    // ela, a aba Idiomas continua
    const skillsCount = skillGroups.filter((group) => group.name == REQUIRED_SKILLS || group.name == DESIRED_SKILLS).reduce((total, group) => total + group.list.length, 0);
    // mais obrigatórias do que o backend aceita (uma vaga gravada antes do limite): bloqueia até o recrutador retirar as que sobram
    const requiredSkillsErrors = () => {
        const required = skillStore.getState().getWordsFromGroup(REQUIRED_SKILLS);
        if (required.length <= REQUIRED_SKILLS_MAX) return [];
        return [`Aba Habilidades: a vaga aceita no máximo ${REQUIRED_SKILLS_MAX} habilidades obrigatórias; retire ${required.length - REQUIRED_SKILLS_MAX}.`];
    };
    const skillsTabErrors = () => [...languagesTabErrors(form), ...requiredSkillsErrors(), ...skillStore.getState().getPendingRequirements()];
    const tabSkills = {
        label: loadingSkills ? 'Lendo as habilidades...' : `${skillsCount} Habilidades`,
        loading: loadingSkills,
        icon: <IconGithub className="h-4 w-4" />,
        title: 'Caso as habilidades estiverem desatualizadas / incorretas, volte à aba Vaga e corrija a descrição, para que possamos atualizar corretamente a lista de habilidades',
        getPendingRequirements: skillsTabErrors,
        onMoveOnFowardTabs: skillsTabErrors,
    };
    showTabSkills && tabs.splice(1, 1, tabSkills);
    // depois de Opções, a dos currículos aderentes, a última; antes de gravar o botão dela salva, depois fecha o modal
    resumesTabIndex.current = tabs.length;
    const tabResumes = {
        label: 'Currículos aderentes',
        icon: <IconUsers className="h-4 w-4" />,
        getPendingRequirements: () => [],
        onMoveOnFowardTabs: () => {
            if (!savedOnce) return save();
            onCancel();
            return [];
        },
    };
    resumesTabShown && tabs.push(tabResumes);
    // a vaga simplificada recolhida: só Vaga e Salários, e o avançar de Salários salva
    const salaryTabOfTheSimplified = { ...tabs.find((tab) => tab.label == 'Salários'), onMoveOnFowardTabs: save };
    const shownTabs = collapsed ? [tabs[0], salaryTabOfTheSimplified] : tabs;

    const removeButton = (onClick: () => void, disabled = false) => (
        <button type="button" className="btn btn-outline-danger btn-sm" onClick={onClick} disabled={disabled}>
            Remover
        </button>
    );

    // ---- aba Vaga
    const positionTab = (
        // largura limitada, como na aba Currículo: um campo de uma linha muito largo é desconfortável de ler e de preencher
        <div className="max-w-4xl">
            <LabelComponent
                explanation={`O título identifica a vaga para você e para os candidatos (de ${LIMITS.titleMin} a ${LIMITS.titleMax} caracteres). Ele faz parte da identificação da vaga, por isso não pode ser alterado depois de criada.`}
                labelValue="Título da vaga:"
                property="title"
                errors={fieldErrors}
            >
                <TextInput id="title" error={!!fieldErrors.title} value={form.title} maxLength={LIMITS.titleMax} disabled={!creating} onChange={(event) => set({ title: event.currentTarget.value })} />
            </LabelComponent>
            <LabelComponent
                explanation="Obrigatória: a área dos currículos procurados. A vaga de tecnologia da informação (TI) ganha a aba 'Habilidades', com as habilidades encontradas na descrição."
                labelValue="Área da vaga:"
                property="resumeType"
                errors={fieldErrors}
            >
                {/* obrigatória e sem valor padrão desde 2026-11-24: começa vazia, e a aba Vaga não avança sem ela */}
                <Select
                    id="resumeType"
                    required
                    aria-required
                    placeholder="Escolha a área da vaga"
                    error={!!fieldErrors.resumeType}
                    data={resumeTypeOptions}
                    value={form.resumeType || null}
                    allowDeselect={false}
                    comboboxProps={inside}
                    onChange={(value) => set({ resumeType: value || '' })}
                />
            </LabelComponent>
            {resumesMessage}
            <LabelComponent
                explanation={`O texto completo da vaga: atividades, requisitos, benefícios e o que mais o candidato precisa saber (de ${LIMITS.descriptionMin} a ${LIMITS.descriptionMax.toLocaleString('pt-BR')} caracteres). Numa vaga de tecnologia, é deste texto que saem as listas da aba 'Habilidades' mais à frente.`}
                labelValue={`Descrição da vaga (${form.description.trim().length} caracteres):`}
                property="description"
                errors={fieldErrors}
            >
                <Textarea
                    id="description"
                    error={!!fieldErrors.description}
                    value={form.description}
                    maxLength={LIMITS.descriptionMax}
                    placeholder="Cole aqui o texto da vaga."
                    autosize
                    minRows={10}
                    maxRows={25}
                    onChange={(event) => set({ description: event.currentTarget.value })}
                />
            </LabelComponent>
            <LabelComponent
                explanation="Por onde os candidatos falam com você sobre a vaga: WhatsApp (com DDD, ex.: +5511999998888), e-mail ou um link (começando com http). Informe ao menos um."
                labelValue="Contatos para os candidatos:"
                property="contact"
                errors={fieldErrors}
            >
                {form.contact.map((contact, index) => (
                    <div key={index} className="mb-2 grid grid-cols-1 items-start gap-2 sm:grid-cols-[1fr_2fr_auto]">
                        <Select data={contactTypeOptions} value={contact.type} allowDeselect={false} comboboxProps={inside} onChange={(value) => setContact(index, { type: (value as Contact['type']) || 'email' })} />
                        <TextInput
                            error={!!fieldErrors.contact}
                            value={contact.value}
                            maxLength={LIMITS.contactValueMax}
                            placeholder={contact.type == 'whatsapp' ? '+5511999998888' : contact.type == 'email' ? 'rh@empresa.com.br' : 'https://empresa.com.br/vaga'}
                            onChange={(event) => setContact(index, { value: event.currentTarget.value })}
                        />
                        {removeButton(() => set({ contact: form.contact.filter((_, i) => i != index) }), form.contact.length == 1)}
                    </div>
                ))}
                <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => set({ contact: [...form.contact, { type: 'email', value: '' }] })}>
                    Acrescentar contato
                </button>
            </LabelComponent>
            <LabelComponent
                explanation="A vaga recebe currículos do início até o fim do dia escolhido no fim. Depois disso ela vai para a aba das vagas expiradas, de onde pode ser reativada. Uma vaga nova não pode começar antes de hoje."
                labelValue="Período da vaga (início e fim):"
                property="expiration"
                errors={fieldErrors}
            >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <TextInput type="date" aria-label="Início da vaga" error={!!fieldErrors.expiration} value={form.expirationMin} min={creating ? today() : undefined} onChange={(event) => set({ expirationMin: event.currentTarget.value })} />
                    <TextInput type="date" aria-label="Fim da vaga" error={!!fieldErrors.expiration} value={form.expirationMax} min={form.expirationMin || undefined} onChange={(event) => set({ expirationMax: event.currentTarget.value })} />
                </div>
            </LabelComponent>
        </div>
    );

    // ---- aba Idiomas (como a do currículo: o checkbox abre a lista, e cada idioma escolhido pede o nível)
    const selectLanguages = (names: string[]) =>
        set({ spokenLanguage: names.map((name) => form.spokenLanguage.filter((language) => language.name == name)[0] || { name, level: 1 }) });
    const setLanguageLevel = (name: string, level: number) => set({ spokenLanguage: form.spokenLanguage.map((language) => (language.name == name ? { ...language, level } : language)) });
    // os campos de idiomas: numa vaga com a aba Habilidades (desde 2026-11-23) ficam no topo dela, sem aba própria
    const languagesFields = (
        <div>
            <div className="mb-5">
                <Checkbox checked={form.hasLanguages} onChange={(event) => set({ hasLanguages: event.currentTarget.checked })} label="A vaga exige conhecimento em outro(s) idioma(s) além do português" />
            </div>
            {form.hasLanguages && (
                <div className="mb-6">
                    <label className={fieldLabel}>Idiomas exigidos</label>
                    <SummaryMultiSelect
                        openDownwards
                        data={languageOptions}
                        value={form.spokenLanguage.map((language) => language.name)}
                        onChange={selectLanguages}
                        placeholder="Selecione os idiomas que a vaga exige"
                        searchPlaceholder="Digite o idioma que você procura"
                        nothingFoundMessage="Nenhum idioma encontrado"
                        summaryLabel={(count) => `${count} idiomas selecionados`}
                        maxDisplayedPills={6}
                        error={!form.spokenLanguage.length}
                    />
                </div>
            )}
            {form.hasLanguages &&
                form.spokenLanguage.map((language) => (
                    <div key={language.name} className="mb-4 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:items-start md:gap-4">
                        <label className="mb-1.5 block font-semibold text-dark dark:text-white-light md:mb-0 md:pt-2">O nível exigido em idioma {language.name} é:</label>
                        <Select data={languageLevelOptions} value={String(language.level)} allowDeselect={false} comboboxProps={inside} onChange={(value) => value && setLanguageLevel(language.name, Number(value))} />
                    </div>
                ))}
        </div>
    );
    const languagesTab = (
        <div>
            {resumesMessage}
            {languagesFields}
        </div>
    );

    // ---- aba Filtros (regiões como as do currículo, com a contagem dos currículos delas, senioridade, PCD, viagens,
    // começo e temporário)
    const homeOffice = form.ddd.includes(HOME_OFFICE);
    const regionsValue = form.ddd.length == allRegions.length ? [TODAS_AS_REGIOES, ...form.ddd] : form.ddd;
    const selectRegions = (values: string[], changed: string) => {
        if (changed == TODAS_AS_REGIOES) {
            set({ ddd: values.includes(TODAS_AS_REGIOES) ? allRegions : [] });
            return;
        }
        set({ ddd: values.filter((value) => value != TODAS_AS_REGIOES) });
    };
    const filtersTab = (
        <div>
            <div className="mb-5">
                <label className="mb-2 block font-semibold text-dark dark:text-white-light">Onde a vaga é</label>
                <Checkbox className="mb-3" checked={homeOffice} onChange={(event) => set({ ddd: event.currentTarget.checked ? [HOME_OFFICE] : [] })} label="Vaga somente home office" />
                {!homeOffice && (
                    <p className="mb-2 text-sm text-white-dark">
                        Você pode escolher <strong>mais de uma</strong> região metropolitana: marque todas onde a vaga pode ser presencial ou híbrida.
                    </p>
                )}
                {!homeOffice && (
                    <SummaryMultiSelect
                        openDownwards
                        data={regionOptions}
                        value={regionsValue}
                        onChange={selectRegions}
                        placeholder="Selecione uma ou mais regiões onde a vaga é presencial ou híbrida"
                        searchPlaceholder="Digite a cidade ou o estado que você procura"
                        nothingFoundMessage="Nenhuma região encontrada"
                        summaryLabel={(count) => `${count} ${count == 1 ? 'região selecionada' : 'regiões selecionadas'}`}
                        countValue={(value) => value != TODAS_AS_REGIOES}
                        maxDisplayedPills={2}
                        error={!form.ddd.length}
                    />
                )}
            </div>
            {/* a área de mensagens: os currículos que atendem a todos os filtros da vaga (spinner enquanto o backend não responde) */}
            {resumesMessage}
            <div className="max-w-xl">
                <LabelComponent
                    explanation="As senioridades dos currículos procurados: escolha uma ou mais. O currículo entra quando os anos de experiência dele estão na faixa de qualquer uma delas."
                    labelValue="Senioridades da vaga:"
                    property="seniority"
                    errors={{}}
                >
                    {/* escolha múltipla desde 2026-11-23, sempre na ordem das opções (de estágio a especialista) */}
                    <MultiSelect
                        id="seniority"
                        data={seniorityOptions}
                        value={form.seniority}
                        placeholder={form.seniority.length ? undefined : 'Escolha uma ou mais senioridades'}
                        comboboxProps={inside}
                        onChange={(values) => set({ seniority: seniorityOptions.filter((option) => values.includes(option.value)).map((option) => option.value) })}
                    />
                </LabelComponent>
            </div>
            <CheckBoxComponent
                explanation="Caso esta opção estiver marcada, a vaga será oferecida aos currículos de pessoas com deficiência (PCD)."
                checkBoxLabel="Vaga para pessoas com deficiência (PCD)"
                setValue={(pcd) => set({ pcd })}
                value={form.pcd}
            />
            <CheckBoxComponent
                explanation="Caso esta opção estiver marcada, a vaga só será oferecida aos currículos de pessoas que estão disponíveis para viagens nacionais ou internacionais."
                checkBoxLabel="A vaga exige disponibilidade para viagens nacionais ou internacionais"
                setValue={(travel) => set({ travel })}
                value={form.travel}
            />
            <IntegerFieldComponent
                explanation="Caso esta opção estiver marcada, a vaga será oferecida a quem pode começar já. Caso esta opção não estiver marcada, você deverá informar no campo de texto que será mostrado em quantos dias o candidato precisa começar."
                checkBoxLabel="Contratação imediata"
                textFieldLabel="Dias para o candidato começar"
                setValue={(disponibility) => set({ disponibility })}
                value={form.disponibility}
                defaultValue={7}
                minValue={1}
                maxValue={LIMITS.disponibilityMax}
            />
            <IntegerFieldComponent
                explanation="Caso esta opção estiver marcada, a vaga é de prazo indeterminado. Caso esta opção não estiver marcada, você deverá informar no campo de texto que será mostrado a duração, em meses, do emprego temporário."
                checkBoxLabel="Não é vaga temporária"
                textFieldLabel="Duração do emprego temporário (em meses)"
                setValue={(temporallyJobTime) => set({ temporallyJobTime })}
                value={form.temporallyJobTime}
                defaultValue={1}
                maxValue={LIMITS.temporallyJobTimeMax}
            />
        </div>
    );

    // ---- aba Opções (a última antes de gravar): visibilidade, envio da vaga e dos currículos e a ordem deles
    const optionsTab = (
        <div>
            {/* a contagem e o link da lista dos currículos aderentes, como nas outras abas */}
            {resumesMessage}
            <div className="mb-5">
                {/* com exceção de "Não receber currículos", a frequência pede, ao lado, o e-mail que recebe os currículos */}
                <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
                    <LabelComponent
                        explanation="Frequência de tempo em que os currículos aderentes são reunidos para serem enviados, sendo que se a opção escolhida for 'Receber currículos instantâneamente', então, um currículo, ao ser salvo e ao ser aderente, é enviado segundos, mais tardar, em menos de dois minutos depois de seu salvamento. Na opção 'Os próprios candidatos enviam seus currículos', futuros candidatos aderentes que cadastrarem seus currículos nos próximos dias verão esta vaga e poderão enviar seus currículos eles mesmos."
                        labelValue="Opções de como receber currículos aderentes desta vaga"
                        property="frequencyType"
                        errors={{}}
                    >
                        <Select id="frequencyType" data={frequencyOptions} value={form.frequencyType} allowDeselect={false} comboboxProps={inside} onChange={(value) => set({ frequencyType: value || 'daily' })} />
                    </LabelComponent>
                    {sendsTheResumes(form) && (
                        <LabelComponent
                            explanation="O e-mail que recebe os currículos encontrados para esta vaga, na frequência escolhida. Vem preenchido com o e-mail com que você entrou no site."
                            labelValue="Endereço de e-mail que receberá os currículos"
                            property="resumesEmail"
                            // obrigatório enquanto visível (toda frequência menos "Não receber currículos"): vazio ou inválido,
                            // o erro aparece embaixo do campo e o avançar/salvar da aba fica bloqueado por optionsTabErrors
                            errors={{ resumesEmail: resumesEmailError(form) }}
                        >
                            <TextInput
                                id="resumesEmail"
                                type="email"
                                required
                                error={!!resumesEmailError(form)}
                                placeholder="rh@empresa.com.br"
                                maxLength={100}
                                value={form.resumesEmail}
                                onChange={(event) => set({ resumesEmail: event.currentTarget.value })}
                            />
                        </LabelComponent>
                    )}
                </div>
                <PublishInGroupsCheckBox
                    setValue={(mustSendInGroups) => set({ mustSendInGroups })}
                    value={form.mustSendInGroups}
                    resumeType={form.resumeType}
                    seniority={form.seniority}
                    ddd={form.ddd}
                />
            </div>
            <LabelComponent
                explanation="A ordem em que os currículos encontrados aparecem para você: o primeiro critério decide, e cada critério seguinte só desempata o anterior. Só aparecem os critérios que a vaga pede (a pretensão CLT ou PJ informada, os idiomas exigidos, as habilidades da vaga de tecnologia, a disponibilidade e o trabalho temporário quando informados); cada habilidade desejável pode virar um critério."
                labelValue="Em qual ordem os currículos deverão ser apresentados"
                property="sort"
                errors={{}}
            >
                {shownSort.map((rule, index) => {
                    const key = sortKeyOf(rule);
                    const usedByOthers = shownSort.filter((_, i) => i != index).map(sortKeyOf);
                    const available = sortCriteria.filter((criterion) => criterion.key == key || !usedByOthers.includes(criterion.key));
                    const current = sortCriteria.find((criterion) => criterion.key == key);
                    const typeOptions = current ? [{ value: 'asc', label: current.types.asc }, { value: 'desc', label: current.types.desc }] : [];
                    // o sentido padrão do critério aparece primeiro no combo
                    current && current.defaultType == 'desc' && typeOptions.reverse();
                    return (
                        <div key={index} className="mb-2 grid grid-cols-1 items-start gap-2 sm:grid-cols-[2fr_2fr_auto]">
                            <Select
                                data={available.map((criterion) => ({ value: criterion.key, label: criterion.label }))}
                                value={key}
                                allowDeselect={false}
                                searchable
                                comboboxProps={inside}
                                onChange={(value) => {
                                    const chosen = sortCriteria.find((criterion) => criterion.key == value);
                                    chosen && setSort(index, sortRuleOf(chosen));
                                }}
                            />
                            <Select data={typeOptions} value={rule.type} allowDeselect={false} comboboxProps={inside} onChange={(value) => setSort(index, { ...rule, type: (value as SortRule['type']) || rule.type })} />
                            {removeButton(() => editSort(shownSort.filter((_, i) => i != index)), shownSort.length == 1)}
                        </div>
                    );
                })}
                <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    disabled={sortCriteria.every((criterion) => shownSort.some((rule) => sortKeyOf(rule) == criterion.key))}
                    onClick={() => {
                        const next = sortCriteria.find((criterion) => !shownSort.some((rule) => sortKeyOf(rule) == criterion.key));
                        next && editSort([...shownSort, sortRuleOf(next)]);
                    }}
                >
                    Acrescentar critério
                </button>
            </LabelComponent>
        </div>
    );

    // ---- aba Salários (o checkbox "não ofereço" como o "não aceito" do currículo; desmarcado, a faixa de e até)
    const salaryRange = (name: string, offered: boolean, min: number | '', max: number | '', changes: (offered: boolean, min: number | '', max: number | '') => Partial<PositionForm>) => (
        <div className="mb-4">
            <div className="flex min-w-0 items-start gap-2">
                <HelpButton
                    title={`Não ofereço contratação ${name}`}
                    explanation={`Caso esta opção estiver marcada, a vaga não será de contrato ${name}. Caso esta opção não estiver marcada, você deverá informar nos campos que serão mostrados a faixa salarial mensal ${name}, em reais.`}
                />
                <Checkbox className="min-w-0" checked={!offered} onChange={(event) => set(changes(!event.currentTarget.checked, min, max))} label={`Não ofereço contratação ${name}`} />
            </div>
            {offered && (
                // o recuo alinha os campos com o texto do checkbox, como no IntegerFieldComponent
                <div className="mt-2 grid max-w-xl grid-cols-1 gap-3 pl-[3.75rem] sm:grid-cols-2">
                    <NumberInput
                        label={`Budget ${name} de (R$)`}
                        classNames={{ label: 'font-semibold text-dark dark:text-white-light' }}
                        value={min}
                        min={LIMITS.salaryMin}
                        max={LIMITS.salaryMax}
                        thousandSeparator="."
                        decimalSeparator=","
                        allowDecimal={false}
                        allowNegative={false}
                        onChange={(value) => set(changes(offered, value === '' ? '' : Number(value), max))}
                    />
                    <NumberInput
                        label={`Budget ${name} até (R$)`}
                        classNames={{ label: 'font-semibold text-dark dark:text-white-light' }}
                        value={max}
                        min={LIMITS.salaryMin}
                        max={LIMITS.salaryMax}
                        thousandSeparator="."
                        decimalSeparator=","
                        allowDecimal={false}
                        allowNegative={false}
                        onChange={(value) => set(changes(offered, min, value === '' ? '' : Number(value)))}
                    />
                </div>
            )}
        </div>
    );
    const salaryTab = (
        <div>
            {resumesMessage}
            {salaryRange('CLT', form.hasClt, form.cltMin, form.cltMax, (hasClt, cltMin, cltMax) => ({ hasClt, cltMin, cltMax }))}
            {salaryRange('PJ', form.hasPj, form.pjMin, form.pjMax, (hasPj, pjMin, pjMax) => ({ hasPj, pjMin, pjMax }))}
            <CheckBoxComponent
                explanation="Caso esta opção estiver marcada, a vaga só será oferecida aos candidatos que aceitam negociar a pretensão salarial."
                checkBoxLabel="Apenas candidatos que negociem pretensão salarial"
                setValue={(negotiableClaim) => set({ negotiableClaim })}
                value={form.negotiableClaim}
            />
        </div>
    );

    const saveLabel = creating ? 'Abrir nova vaga' : 'Salvar dados';
    const saveShortcut = creating ? undefined : { label: 'Salvar dados', icon: <IconSave className="h-4 w-4" />, onClick: save };

    return (
        <Tabs
            tabs={shownTabs}
            lastButtonLabel={savedOnce ? 'Fechar' : saveLabel}
            lastButtonIcon={savedOnce ? undefined : <IconSave className="h-4 w-4" />}
            firstButtonLabel="Cancelar"
            firstButtonClick={onCancel}
            shortcutButton={saveShortcut}
            goToTab={goToTab}
            forwardLoading={loadingSkills}
        >
            {positionTab}
            {collapsed && salaryTab}
            {!collapsed && !showTabSkills && languagesTab}
            {!collapsed && showTabSkills && (
                <div>
                    {resumesMessage}
                    <div className="mb-6 border-b border-white-light pb-2 dark:border-[#1b2e4b]">{languagesFields}</div>
                    <TabSkills2 store={skillStore} getAccordionList={getImplicitSkills} source={skillsSourceOf(form.description)} accordionView={broadSkillsView} withMoveAll />
                </div>
            )}
            {!collapsed && filtersTab}
            {!collapsed && salaryTab}
            {!collapsed && optionsTab}
            {!collapsed && resumesTabShown && <ResumesOfThePositionFilters ids={resumesOfTheFilters.found?.ids || []} sort={shownSort} desiredSkills={desiredSkills} />}
        </Tabs>
    );
};
