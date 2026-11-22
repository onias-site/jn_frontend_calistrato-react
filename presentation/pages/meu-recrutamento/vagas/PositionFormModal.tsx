'use client';
import React, { useEffect, useState } from 'react';
import { Alert, Checkbox, MultiSelect, NumberInput, Select, Textarea, TextInput } from '@mantine/core';
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
import { HOME_OFFICE, TODAS_AS_REGIOES } from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/tabs/TabFilter/RegioesComponent';
import IconFile from '@/presentation/icons/icon-file';
import IconGlobe from '@/presentation/icons/icon-globe';
import IconGithub from '@/presentation/icons/icon-github';
import IconSettings from '@/presentation/icons/icon-settings';
import IconFilter from '@/presentation/icons/icon-filter';
import IconDollarSign from '@/presentation/icons/icon-dollar-sign';
import IconSave from '@/presentation/icons/icon-save';
import IconUsers from '@/presentation/icons/icon-users';
import IconInfoCircle from '@/presentation/icons/icon-info-circle';
import { ResumesOfTheFiltersMessage, useResumesOfTheFilters } from './ResumesOfTheFiltersMessage';
import { ResumesOfThePositionFilters } from './ResumesOfThePositionFilters';
import { filtersRequestOf } from './resumesOfTheFilters';
import {
    Contact,
    DESIRED_SKILLS,
    LIMITS,
    REQUIRED_SKILLS,
    Position,
    PositionForm,
    SortRule,
    contactTypeOptions,
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
    sortFieldOptions,
    sortTypeOptions,
    today,
} from './positionsData';

type PositionFormModalProps = {
    // sem vaga, "Abrir nova vaga": o título vem vazio e é obrigatório; com vaga, "Editar": o título (parte da chave) fica travado
    position: Position | null;
    // a vaga gravada: a tela atualiza a lista e o modal continua aberto, na aba "Cvs encontrados"
    onSaved: (position: Position) => void;
    onCancel: () => void;
};

const resumeTypeOptions = resumeTypes.map((type) => ({ value: String(type.id), label: type.label }));
const regionOptions = [{ value: TODAS_AS_REGIOES, label: 'Qualquer estado / cidade' }, ...dddRegions.filter((region) => region.id != HOME_OFFICE).map((region) => ({ value: region.id, label: region.nome }))];
const allRegions = regionOptions.map((option) => option.value).filter((value) => value != TODAS_AS_REGIOES);
const languageOptions = languages.map((language) => ({ value: language.name, label: language.name }));
const fieldLabel = 'mb-1.5 block font-semibold text-dark dark:text-white-light';
// as listas abrem dentro do modal (como no formulário de currículo): fora dele, a rolagem do modal as deixaria para trás
const inside = { withinPortal: false };

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
 * de fim; depois vêm Filtros (regiões, com a contagem dos currículos delas, senioridade e o mais que filtra os
 * currículos), Idiomas, Habilidades e Salários, e por último Opções (visível aos candidatos, envio da vaga e dos
 * currículos e a ordem deles), cujo avançar grava a vaga. Como no currículo, sair da primeira aba numa vaga de tecnologia manda a
 * descrição ao skills/fromText, que preenche as duas listas de arrastar e soltar (obrigatórias e desejáveis) e os
 * conhecimentos implícitos; a aba Habilidades só aparece com alguma habilidade encontrada. As listas ficam numa store só
 * deste modal (createSkillStore). Depois de gravar, o modal continua aberto e ganha a aba "Cvs encontrados", que ainda
 * não busca os currículos. A gravação é assíncrona no backend: a tela põe na lista o que enviou, sem reler.
 */
export const PositionFormModal = ({ position, onSaved, onCancel }: PositionFormModalProps) => {
    // gravada uma vez, a vaga nova passa a ser editada: o título trava e o próximo "Salvar dados" vai ao /edit
    const [savedOnce, setSavedOnce] = useState(false);
    const creating = position == null && !savedOnce;
    const [form, setForm] = useState<PositionForm>(position == null ? emptyForm() : formOf(position));
    const [saving, setSaving] = useState(false);
    // o erro de cada campo da aba Vaga só aparece depois da primeira tentativa de avançar ou salvar
    const [attempted, setAttempted] = useState(false);
    const [goToTab, setGoToTab] = useState<{ index: number } | undefined>(undefined);
    // a store das habilidades deste modal; na edição de uma vaga de tecnologia, já com as habilidades gravadas
    const [skillStore] = useState(() => {
        const store = createSkillStore();
        if (position == null || String(position.resumeType) != '1') return store;
        const { groups, context } = skillGroupsOfThePosition(position.skill, sha1(position.description.trim()));
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
        if (position == null || String(position.resumeType) != '1' || context.broadSkill) return;
        const text = position.description.trim();
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
    // (Vaga, Filtros, Idiomas, Habilidades e Salários)
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
        setGoToTab({ index: resumesTabIndex.current });
    };
    const resumesMessage = <ResumesOfTheFiltersMessage request={filtersRequest} {...resumesOfTheFilters} onSeeTheResumes={seeTheResumes} />;
    const [hasTabSkills, setHasTabSkills] = useState(skillGroups.some((group) => group.list.length > 0));
    const showTabSkills = hasTabSkills && isTechPosition(form);
    const set = (changes: Partial<PositionForm>) => setForm((current) => ({ ...current, ...changes }));
    // o e-mail que recebe os currículos vem com o do recrutador logado; sem login ao abrir, entra quando ele faz login (a
    // tela da vaga não exige login para começar) e o campo ainda está vazio
    const loggedEmail: string = (JnAjax.getLogin() || ({} as any)).email || '';
    useEffect(() => {
        if (!loggedEmail || form.resumesEmail) return;
        set({ resumesEmail: loggedEmail });
    }, [loggedEmail]);
    const fieldErrors = attempted ? positionTabFieldErrors(form, creating) : {};

    const setSort = (index: number, changes: Partial<SortRule>) => set({ sort: form.sort.map((rule, i) => (i == index ? { ...rule, ...changes } : rule)) });
    const setContact = (index: number, changes: Partial<Contact>) => set({ contact: form.contact.map((contact, i) => (i == index ? { ...contact, ...changes } : contact)) });

    // a descrição que deu as habilidades da aba já não é a do campo: falta passar pela aba Habilidades
    const skillsOutdated = () => isTechPosition(form) && skillStore.getState().context.cacheHash != sha1(form.description.trim());

    // ao sair da aba Vaga, como ao sair da aba Currículo: as habilidades da descrição, só quando ela mudou
    const loadSkillsFromText = (): string[] => {
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
            skillState.setGroups(skillGroupsFromText(response) as any, getImplicitSkills);
            skillState.setContext({ ...response, requestSkillsToBackEnd, cacheHash });
            setHasTabSkills((response.skill || []).length > 0 || (response.excludedSkill || []).length > 0);
        };
        callbacks[401] = () => {
            JnAjax.setNotLoading()();
            JnAjax.getHandler401(loadSkillsFromText)();
        };
        callbacks['onUnexpectedHttpStatus'] = () => notify({ summary: 'Habilidades não encontradas', detail: 'Não foi possível ler as habilidades da descrição agora. Volte à aba Vaga e avance de novo.', severity: 'error' });
        JnAjax.doAnAjaxRequest('skills/fromText', callbacks, 'POST', requestSkillsToBackEnd, {}, 'http://localhost:8081');
        return [];
    };

    const tabs: any[] = [
        {
            label: 'Vaga',
            icon: <IconFile className="h-4 w-4" />,
            getPendingRequirements: () => positionTabErrors(form, creating),
            onMoveOnFowardTabs: loadSkillsFromText,
            fieldsShowPendingRequirements: true,
        },
        { label: 'Filtros', icon: <IconFilter className="h-4 w-4" />, getPendingRequirements: () => filtersTabErrors(form), onMoveOnFowardTabs: () => filtersTabErrors(form) },
        { label: 'Idiomas', icon: <IconGlobe className="h-4 w-4" />, getPendingRequirements: () => languagesTabErrors(form), onMoveOnFowardTabs: () => languagesTabErrors(form) },
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
        const skillErrors = showTabSkills ? skillStore.getState().getPendingRequirements() : [];
        const errors = [...pendingRequirements(form, creating), ...skillErrors];
        if (errors.length || saving) return errors;
        setSaving(true);
        const body = requestBodyOf(form, skillStore.getState().loadSkillsContext());
        // a aba "Cvs encontrados" entra no fim: o índice dela é o tamanho da lista de abas antes de ela aparecer
        const foundResumesTabIndex = tabs.length;
        const callbacks: any = {};
        callbacks[200] = () => {
            setSaving(false);
            notify({ summary: creating ? 'Vaga aberta' : 'Vaga salva', detail: 'A lista já mostra a vaga como você a gravou.' });
            onSaved(positionOf(body));
            !savedOnce && setGoToTab({ index: foundResumesTabIndex });
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

    // a aba Habilidades entra depois de Idiomas (Vaga, Filtros, Idiomas, Habilidades, Salários, Opções), com o número de
    // habilidades da vaga (desejáveis e obrigatórias: as encontradas começam todas nas desejáveis)
    const skillsCount = skillGroups.filter((group) => group.name == REQUIRED_SKILLS || group.name == DESIRED_SKILLS).reduce((total, group) => total + group.list.length, 0);
    const tabSkills = {
        label: `${skillsCount} Habilidades`,
        icon: <IconGithub className="h-4 w-4" />,
        title: 'Caso as habilidades estiverem desatualizadas / incorretas, volte à aba Vaga e corrija a descrição, para que possamos atualizar corretamente a lista de habilidades',
        getPendingRequirements: () => skillStore.getState().getPendingRequirements(),
        onMoveOnFowardTabs: () => skillStore.getState().getPendingRequirements(),
    };
    showTabSkills && tabs.splice(3, 0, tabSkills);
    // depois de Opções, a dos currículos aderentes; numa vaga nova o botão dela salva, numa gravada só avança
    resumesTabIndex.current = tabs.length;
    const tabResumes = {
        label: 'Currículos aderentes',
        icon: <IconUsers className="h-4 w-4" />,
        getPendingRequirements: () => [],
        onMoveOnFowardTabs: () => (savedOnce ? [] : save()),
    };
    resumesTabShown && tabs.push(tabResumes);
    // depois de gravar, a aba dos currículos encontrados, a última; o botão dela fecha o modal
    const tabFoundResumes = {
        label: 'Cvs encontrados',
        icon: <IconUsers className="h-4 w-4" />,
        getPendingRequirements: () => [],
        onMoveOnFowardTabs: () => {
            onCancel();
            return [];
        },
    };
    savedOnce && tabs.push(tabFoundResumes);

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
                explanation="A área dos currículos procurados. A vaga de tecnologia da informação (TI) ganha a aba 'Habilidades', com as habilidades encontradas na descrição."
                labelValue="Área da vaga:"
                property="resumeType"
                errors={fieldErrors}
            >
                <Select id="resumeType" error={!!fieldErrors.resumeType} data={resumeTypeOptions} value={form.resumeType} allowDeselect={false} comboboxProps={inside} onChange={(value) => set({ resumeType: value || '' })} />
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
    const languagesTab = (
        <div>
            {resumesMessage}
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
                <LabelComponent explanation="A senioridade dos currículos procurados." labelValue="Senioridade da vaga:" property="seniority" errors={{}}>
                    <Select id="seniority" data={seniorityOptions} value={form.seniority || null} placeholder="Escolha a senioridade" comboboxProps={inside} onChange={(value) => set({ seniority: value || '' })} />
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
            <div className="mb-5">
                {/* com exceção de "Não receber currículos", a frequência pede, ao lado, o e-mail que recebe os currículos */}
                <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
                    <LabelComponent
                        explanation="Frequência de tempo em que os currículos aderentes são reunidos para serem enviados, sendo que se a opção escolhida for 'Instantâneamente', então, um currículo, ao ser salvo e ao ser aderente, é enviado segundos, mais tardar, em menos de dois minutos depois de seu salvamento."
                        labelValue="Frequência de envio dos currículos encontrados:"
                        property="frequencyType"
                        errors={{}}
                    >
                        <Select id="frequencyType" data={frequencyOptions} value={form.frequencyType} allowDeselect={false} comboboxProps={inside} onChange={(value) => set({ frequencyType: value || 'daily' })} />
                    </LabelComponent>
                    {sendsTheResumes(form) && (
                        <LabelComponent
                            explanation="O e-mail que recebe os currículos encontrados para esta vaga, na frequência escolhida. Vem preenchido com o e-mail com que você entrou no site."
                            labelValue="E-mail para o qual enviar os currículos:"
                            property="resumesEmail"
                            errors={{ resumesEmail: form.resumesEmail.trim() ? resumesEmailError(form) : '' }}
                        >
                            <TextInput
                                id="resumesEmail"
                                type="email"
                                placeholder="rh@empresa.com.br"
                                maxLength={100}
                                value={form.resumesEmail}
                                onChange={(event) => set({ resumesEmail: event.currentTarget.value })}
                            />
                        </LabelComponent>
                    )}
                </div>
                <CheckBoxComponent
                    explanation="Caso esta opção estiver marcada, os candidatos cujos currículos combinam com esta vaga poderão ver a vaga e enviar seus currículos a você. Caso esta opção não estiver marcada, a vaga continua cadastrada e buscando currículos, mas fica escondida dos candidatos."
                    checkBoxLabel="Candidatos aderentes podem enviar seus currículos para o recrutador"
                    setValue={(visibleToCandidates) => set({ visibleToCandidates })}
                    value={form.visibleToCandidates}
                />
                <CheckBoxComponent explanation="Caso esta opção estiver marcada, a vaga será divulgada nos grupos de vagas." checkBoxLabel="Divulgar a vaga nos grupos" setValue={(mustSendInGroups) => set({ mustSendInGroups })} value={form.mustSendInGroups} />
                <CheckBoxComponent
                    explanation="Caso esta opção estiver marcada, a vaga será enviada às pessoas cujos currículos combinam com ela."
                    checkBoxLabel="Enviar a vaga aos currículos compatíveis"
                    setValue={(mustSendToResumes) => set({ mustSendToResumes })}
                    value={form.mustSendToResumes}
                />
            </div>
            <LabelComponent explanation="A ordem em que os currículos encontrados aparecem para você: escolha os critérios e se a ordem é crescente ou decrescente." labelValue="Ordem dos currículos encontrados:" property="sort" errors={{}}>
                {form.sort.map((rule, index) => (
                    <div key={index} className="mb-2 grid grid-cols-1 items-start gap-2 sm:grid-cols-[2fr_1fr_auto]">
                        <MultiSelect data={sortFieldOptions} value={rule.field} placeholder="Critérios" comboboxProps={inside} onChange={(value) => setSort(index, { field: value })} />
                        <Select data={sortTypeOptions} value={rule.type} allowDeselect={false} comboboxProps={inside} onChange={(value) => setSort(index, { type: (value as SortRule['type']) || 'desc' })} />
                        {removeButton(() => set({ sort: form.sort.filter((_, i) => i != index) }), form.sort.length == 1)}
                    </div>
                ))}
                <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => set({ sort: [...form.sort, { type: 'desc', field: [] }] })}>
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

    // ---- aba Cvs encontrados (depois de gravar; a busca dos currículos da vaga vem depois)
    const foundResumesTab = (
        <Alert color="blue" icon={<IconInfoCircle className="h-5 w-5" />}>
            A vaga foi gravada. Em breve esta aba mostrará os currículos compatíveis com ela.
        </Alert>
    );

    const saveLabel = creating ? 'Abrir nova vaga' : 'Salvar dados';
    const saveShortcut = creating ? undefined : { label: 'Salvar dados', icon: <IconSave className="h-4 w-4" />, onClick: save };

    return (
        <Tabs
            tabs={tabs}
            lastButtonLabel={savedOnce ? 'Fechar' : saveLabel}
            lastButtonIcon={savedOnce ? undefined : <IconSave className="h-4 w-4" />}
            firstButtonLabel="Cancelar"
            firstButtonClick={onCancel}
            shortcutButton={saveShortcut}
            goToTab={goToTab}
        >
            {positionTab}
            {filtersTab}
            {languagesTab}
            {showTabSkills && (
                <div>
                    {resumesMessage}
                    <TabSkills2 store={skillStore} getAccordionList={getImplicitSkills} source={skillsSourceOf(form.description)} accordionView={broadSkillsView} />
                </div>
            )}
            {salaryTab}
            {optionsTab}
            {resumesTabShown && <ResumesOfThePositionFilters ids={resumesOfTheFilters.found?.ids || []} />}
            {savedOnce && foundResumesTab}
        </Tabs>
    );
};
