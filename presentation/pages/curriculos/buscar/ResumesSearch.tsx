'use client';
import React, { useEffect, useState } from 'react';
import { Checkbox, Loader, MultiSelect, NumberInput, Select, Textarea } from '@mantine/core';
import { sha1 } from 'js-sha1';
import JnAjax from '@/app/JnAjax';
import { LabelComponent } from '@/presentation/components/source/LabelComponent';
import { Modal } from '@/presentation/components/source/Modal';
import { ConfirmModal } from '@/presentation/components/source/ConfirmModal';
import { HelpButton } from '@/presentation/components/source/HelpButton';
import { CheckBoxComponent } from '@/presentation/components/source/CheckBoxComponent';
import { IntegerFieldComponent } from '@/presentation/components/source/IntegerFieldComponent';
import { SummaryMultiSelect } from '@/presentation/components/source/SummaryMultiSelect';
import { dddRegions } from '@/presentation/components/regions/dddRegions';
import { resumeTypes } from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/tabs/TabResume/FormResume';
import { languages } from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/tabs/TabLanguages/ChooserLanguages';
import { HOME_OFFICE, TODAS_AS_REGIOES } from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/tabs/TabFilter/RegioesComponent';
import { notify } from '@/presentation/components/source/notify';
import { createSkillStore, getImplicitSkills, SkillsSource, TabSkills2 } from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/tabs/TabSkills/TabSkills';
import {
    desiredSkillsGroup,
    isTechPosition,
    languageLevelOptions,
    LIMITS,
    PositionForm,
    REQUIRED_SKILLS,
    REQUIRED_SKILLS_MAX,
    requiredSkillsGroup,
    seniorityOptions,
    skillGroupsFromText,
    toSkillListItem,
} from '@/presentation/pages/meu-recrutamento/vagas/positionsData';
import { broadSkillsViewOf, PositionFormModal } from '@/presentation/pages/meu-recrutamento/vagas/PositionFormModal';
import { filtersRequestOf } from '@/presentation/pages/meu-recrutamento/vagas/resumesOfTheFilters';
import { ResumesOfTheFiltersMessage, useResumesOfTheFilters } from '@/presentation/pages/meu-recrutamento/vagas/ResumesOfTheFiltersMessage';
import { ResumesOfThePositionFilters } from '@/presentation/pages/meu-recrutamento/vagas/ResumesOfThePositionFilters';
import {
    addressWithTheFilter,
    EMAIL_PARAMETER,
    emptySearch,
    FILTER_PARAMETER,
    linkToShare,
    positionFormOfTheSearch,
    resumeFilterPath,
    ResumesSearch as Search,
    searchFormOf,
    SHARED_DESCRIPTION_MIN,
    sharedSearchMessage,
} from './resumesSearchData';

const resumeTypeOptions = resumeTypes.map((type) => ({ value: String(type.id), label: type.label }));
const regionOptions = [
    { value: TODAS_AS_REGIOES, label: 'Qualquer estado / cidade' },
    ...dddRegions.filter((region) => region.id != HOME_OFFICE).map((region) => ({ value: region.id, label: region.nome })),
];
const allRegions = regionOptions.map((option) => option.value).filter((value) => value != TODAS_AS_REGIOES);
// sem região escolhida, a vaga aberta pela busca vai a todas, mais o home office
const allDddsWithHomeOffice = [...allRegions, HOME_OFFICE];
const languageOptions = languages.map((language) => ({ value: language.name, label: language.name }));
const fieldLabel = 'mb-1.5 block font-semibold text-dark dark:text-white-light';
// a altura do header fixo: onde a contagem gruda ao rolar a tela
const STICKY_TOP = 56;
// o title e a explicação do link que abre o modal do descritivo da vaga
const ADD_SKILLS_EXPLANATION = 'Clique para adicionar um descritivo do tipo de currículo que você precisa';

// a sugestão de habilidade das listas: a habilidade sugerida precisa constar no texto da vaga, de onde saem as listas
const skillsSourceOf = (text: string): SkillsSource => ({
    text,
    textMissing: 'Para sugerir uma habilidade, preencha o texto da vaga: só por ele dá para conferir que a habilidade consta na vaga.',
    owner: 'da vaga',
    inText: 'no texto da vaga',
});

// as listas das habilidades obrigatórias (as gravadas nos filtros) e desejáveis (vazias: não filtram nem são gravadas)
const groupsOfTheRequiredSkills = (skills: string[]) => [desiredSkillsGroup([]), requiredSkillsGroup(skills.map((skill) => toSkillListItem({ skill, word: skill, parent: [] })))];

/**
 * Currículos -> Buscar (desde 2026-11-25): os filtros de contagem de currículos do modal completo da vaga (área,
 * regiões, senioridades, habilidades, idiomas, começo, temporário, PCD, viagens, faixas salariais e
 * negociação), com a mesma contagem e a mesma lista dos currículos encontrados. Só a área é obrigatória e já vem com
 * tecnologia; os outros filtros são livres. A cada filtro acrescentado, mudado ou retirado, o POST resume-filter grava os
 * filtros em vis_resume_filter (os mesmos filtros da última hora vêm do cache, sem nova busca) e devolve o id deles, que
 * vai para o endereço (?filtro=<id>): aberta com ele, a tela lê os filtros pelo GET resume-filter/{id} e preenche os
 * campos; sem os filtros (expirados 24 horas depois da última busca deles), não faz nada. Numa busca de tecnologia, o texto da vaga (ou o
 * descritivo das habilidades) vai ao skills/fromText ao sair do campo, como no modal da vaga: as listas de habilidades
 * obrigatórias e desejáveis e as ferramentas abrangentes; só as obrigatórias filtram (o texto não é gravado nos
 * filtros, e o id reabre só as obrigatórias). A contagem fica fixa no topo, à vista ao rolar.
 */
export const ResumesSearch = () => {
    const [search, setSearch] = useState<Search>(emptySearch);
    const [readingTheFilters, setReadingTheFilters] = useState(false);
    // o id do endereço não tem mais filtros (404, desde 2026-11-27): o aviso fica até o primeiro filtro mudado
    const [filterExpired, setFilterExpired] = useState(false);
    const [resumesShown, setResumesShown] = useState(false);
    const { form } = search;
    const set = (changes: Partial<PositionForm>) => {
        setFilterExpired(false);
        setSearch((current) => ({ ...current, form: { ...current.form, ...changes } }));
    };
    // as listas de habilidades, numa store só desta tela, como no modal da vaga
    const [skillStore] = useState(() => {
        const store = createSkillStore();
        store.getState().setGroups(groupsOfTheRequiredSkills([]) as any, getImplicitSkills);
        store.getState().setContext({});
        return store;
    });
    const [broadSkillsView] = useState(() => broadSkillsViewOf(skillStore));
    const skillGroups: any[] = skillStore((state) => state.groups);
    const skillsContext: any = skillStore((state) => state.context) || {};
    const requiredSkills: string[] = (skillGroups.find((group) => group.name == REQUIRED_SKILLS)?.list || []).map((item: any) => item.skill);
    const [skillsText, setSkillsText] = useState('');
    const [loadingSkills, setLoadingSkills] = useState(false);
    const showSkillLists = skillGroups.some((group) => group.list.length > 0) || (skillsContext.broadSkill || []).length > 0;

    // o modal do descritivo da vaga ("Adicionar habilidades") e o texto que está sendo digitado nele
    const [descriptionModalOpened, setDescriptionModalOpened] = useState(false);
    const [descriptionDraft, setDescriptionDraft] = useState('');
    // a pergunta, a quem não está logado, se o descritivo vai junto no link
    const [askToShareTheDescription, setAskToShareTheDescription] = useState(false);
    // o id dos filtros com que a tela foi aberta: o e-mail do endereço só vale para ele
    const [filterIdOfTheAddress, setFilterIdOfTheAddress] = useState<string | null>(null);

    // aberta com o id dos filtros no endereço: os campos ficam como estavam; com o e-mail também (desde 2026-11-26), o
    // descritivo gravado por ele volta ao campo e as seções de habilidades aparecem, como ao clicar em "Ok" no modal
    useEffect(() => {
        const parameters = new URLSearchParams(window.location.search);
        const filterId = parameters.get(FILTER_PARAMETER);
        if (!filterId) return;
        setFilterIdOfTheAddress(filterId);
        setReadingTheFilters(true);
        const callbacks: any = {};
        callbacks['setLoading'] = () => {};
        callbacks['setNotLoading'] = () => {};
        callbacks['withoutSession'] = true;
        callbacks[200] = (filters: any) => {
            const restored = searchFormOf(filters);
            setSearch(restored);
            skillStore.getState().setGroups(groupsOfTheRequiredSkills(restored.requiredSkills) as any, getImplicitSkills);
            setReadingTheFilters(false);
            const description = (filters.description || '').trim();
            if (!description) return;
            setSkillsText(description);
            loadSkillsFromText(description);
        };
        // sem os filtros (expiraram 24 horas depois da última busca deles) a tela fica vazia, com o aviso
        callbacks[404] = () => {
            setFilterExpired(true);
            setReadingTheFilters(false);
        };
        callbacks[422] = () => setReadingTheFilters(false);
        callbacks['onUnexpectedHttpStatus'] = () => setReadingTheFilters(false);
        JnAjax.doAnAjaxRequest(resumeFilterPath(filterId, parameters.get(EMAIL_PARAMETER)), callbacks, 'GET', null as any, {}, 'http://localhost:8081');
    }, []);

    const login: any = JnAjax.getLogin() || {};
    // enquanto os filtros do endereço não chegam, nada é contado (a contagem da busca vazia seria jogada fora)
    const request = readingTheFilters ? null : filtersRequestOf(form, isTechPosition(form) ? requiredSkills : [], login.email, false);
    const resumesOfTheFilters = useResumesOfTheFilters(request);
    const filterId = resumesOfTheFilters.found?.id;

    // o id dos filtros contados vai para o endereço, sem recarregar a tela
    useEffect(() => {
        if (!filterId) return;
        const url = new URL(window.location.origin + addressWithTheFilter(window.location.href, filterId));
        // outros filtros: o descritivo do e-mail do endereço era dos filtros com que a tela foi aberta
        if (filterId != filterIdOfTheAddress) url.searchParams.delete(EMAIL_PARAMETER);
        window.history.replaceState(null, '', url.pathname + url.search + url.hash);
    }, [filterId]);

    // o texto da vaga limpo: as três seções de habilidades somem, e as obrigatórias deixam de filtrar
    const clearTheSkillsOfTheText = () => {
        skillStore.getState().setGroups(groupsOfTheRequiredSkills([]) as any, getImplicitSkills);
        skillStore.getState().setContext({});
    };

    // "Ok" no modal do descritivo, como ao sair da aba Vaga do modal da vaga: as habilidades do texto, só quando ele mudou
    const loadSkillsFromText = (typedText: string) => {
        const text = typedText.trim();
        if (!text || loadingSkills) return;
        const cacheHash = sha1(text);
        const skillState = skillStore.getState();
        if ((skillState.context || {}).cacheHash == cacheHash) return;
        // as já obrigatórias vão como excluídas, para não reaparecerem entre as desejáveis
        const requestSkillsToBackEnd = { excludedSkill: skillState.getWordsFromGroup(REQUIRED_SKILLS), text };
        const callbacks: any = {};
        callbacks[200] = (response: any) => {
            skillState.setGroups(skillGroupsFromText(response) as any, getImplicitSkills);
            skillState.setContext({ ...response, requestSkillsToBackEnd, cacheHash });
            setLoadingSkills(false);
        };
        callbacks[401] = () => {
            setLoadingSkills(false);
            JnAjax.setNotLoading()();
            JnAjax.getHandler401(() => loadSkillsFromText(text))();
        };
        callbacks['onUnexpectedHttpStatus'] = () => {
            setLoadingSkills(false);
            notify({ summary: 'Habilidades não encontradas', detail: 'Não foi possível ler as habilidades do texto agora. Abra "Adicionar habilidades" e clique em "Ok" para tentar outra vez.', severity: 'error' });
        };
        setLoadingSkills(true);
        JnAjax.doAnAjaxRequest('skills/fromText', callbacks, 'POST', requestSkillsToBackEnd, {}, 'http://localhost:8081');
    };

    const openTheDescriptionModal = () => {
        setDescriptionDraft(skillsText);
        setDescriptionModalOpened(true);
    };

    // "Ok": o texto vai ao campo da tela e dele saem as seções de habilidades; vazio, elas somem
    const confirmTheDescription = () => {
        const text = descriptionDraft.trim();
        setSkillsText(descriptionDraft);
        setDescriptionModalOpened(false);
        if (!text) return clearTheSkillsOfTheText();
        loadSkillsFromText(text);
    };

    // a mensagem com a contagem, as médias e o link (desde 2026-11-27; antes, só o link)
    const copyToTheClipboard = (link: string, detail: string) => {
        const found = resumesOfTheFilters.found || { resumes: 0 };
        const message = sharedSearchMessage(found, link);
        const copied = () => notify({ summary: 'Mensagem copiada', detail, severity: 'success' });
        const failed = () => notify({ summary: 'Não foi possível copiar', detail: message, severity: 'warn' });
        navigator.clipboard.writeText(message).then(copied, failed);
    };

    // cenários A, B2 e C: o endereço só com o id dos filtros, que reabre a busca como está
    const copyTheLinkWithoutTheDescription = () => {
        if (!filterId) return;
        copyToTheClipboard(linkToShare(window.location.href, filterId), 'Cole a mensagem para quem deve ver esta busca: os filtros do link valem por 24 horas.');
    };

    // cenários B1 e D: o descritivo gravado sob o id dos filtros e o e-mail do usuário logado, que vai no link; sem login, o
    // modal de login e, ao entrar, a gravação de novo
    const copyTheLinkWithTheDescription = () => {
        const description = skillsText.trim();
        if (!filterId) return;
        if (description.length < SHARED_DESCRIPTION_MIN) {
            notify({ summary: 'Descritivo curto demais para o link', detail: `O descritivo precisa de pelo menos ${SHARED_DESCRIPTION_MIN} caracteres (tem ${description.length}) para ir no link. O link foi copiado só com os filtros.`, severity: 'warn' });
            return copyTheLinkWithoutTheDescription();
        }
        const callbacks: any = {};
        callbacks['retryAfterAuthentication'] = copyTheLinkWithTheDescription;
        callbacks[200] = () => {
            const logged: any = JnAjax.getLogin() || {};
            copyToTheClipboard(linkToShare(window.location.href, filterId, logged.email), 'Cole a mensagem para quem deve ver esta busca: o link abre os filtros, por 24 horas, com o descritivo da vaga.');
        };
        callbacks[422] = () => notify({ summary: 'Descritivo não gravado', detail: 'O descritivo precisa ter de 100 a 5.000 caracteres.', severity: 'warn' });
        callbacks['onUnexpectedHttpStatus'] = () => notify({ summary: 'Descritivo não gravado', detail: 'Não foi possível gravar o descritivo agora. Tente copiar o link de novo.', severity: 'error' });
        JnAjax.doAnAjaxRequest('recruiter/{email}/resume-filter-description', callbacks, 'POST', { filterId, description }, {}, 'http://localhost:8081');
    };

    // "Copiar este link para enviar para alguém" (desde 2026-11-26): sem descritivo, só os filtros (A e C); com ele e logado,
    // o descritivo vai junto (D); com ele e sem login, a pergunta se o descritivo vai junto (B1 sim, B2 não)
    const copyTheLink = () => {
        if (!filterId) return;
        if (!skillsText.trim()) return copyTheLinkWithoutTheDescription();
        const logged: any = JnAjax.getLogin() || {};
        if (logged.email) return copyTheLinkWithTheDescription();
        setAskToShareTheDescription(true);
    };

    // "Contactar candidatos aderentes": o modal de vaga nova com os filtros desta busca
    const [positionFromTheSearch, setPositionFromTheSearch] = useState<{ form: PositionForm; skillGroups: any[]; skillsContext: any } | null>(null);
    const contactTheCandidates = () => {
        const state = skillStore.getState();
        // cópias: o modal tem a store dele
        const skillGroups = JSON.parse(JSON.stringify(state.groups || []));
        const skillsContext = JSON.parse(JSON.stringify(state.context || {}));
        setPositionFromTheSearch({ form: positionFormOfTheSearch(form, skillsText, allDddsWithHomeOffice), skillGroups, skillsContext });
    };

    const seeTheResumes = () => {
        const logged: any = JnAjax.getLogin() || {};
        // sem login, o modal de login; ao entrar, repete o clique
        if (!logged.email) return JnAjax.getHandler401(seeTheResumes)();
        setResumesShown(true);
    };

    if (readingTheFilters) {
        return (
            <div className="panel">
                <div role="status" className="flex items-center gap-3 py-6">
                    <Loader size="md" />
                    <span>Carregando os filtros da busca...</span>
                </div>
            </div>
        );
    }

    const regionsValue = form.ddd.length == allRegions.length ? [TODAS_AS_REGIOES, ...form.ddd] : form.ddd;
    const selectRegions = (values: string[], changed: string) => {
        if (changed == TODAS_AS_REGIOES) {
            set({ ddd: values.includes(TODAS_AS_REGIOES) ? allRegions : [] });
            return;
        }
        set({ ddd: values.filter((value) => value != TODAS_AS_REGIOES) });
    };
    const selectLanguages = (names: string[]) =>
        set({ spokenLanguage: names.map((name) => form.spokenLanguage.filter((language) => language.name == name)[0] || { name, level: 1 }), hasLanguages: names.length > 0 });
    const setLanguageLevel = (name: string, level: number) => set({ spokenLanguage: form.spokenLanguage.map((language) => (language.name == name ? { ...language, level } : language)) });
    const tooManySkills = requiredSkills.length > REQUIRED_SKILLS_MAX;

    const salaryRange = (name: string, filtered: boolean, min: number | '', max: number | '', changes: (filtered: boolean, min: number | '', max: number | '') => Partial<PositionForm>) => (
        <div className="mb-4">
            <div className="flex min-w-0 items-start gap-2">
                <HelpButton
                    title={`Filtrar pela pretensão ${name}`}
                    explanation={`Caso esta opção estiver marcada, só entram os currículos com pretensão ${name} dentro da faixa informada nos campos que serão mostrados, em reais. Com as duas faixas, basta uma pretensão do currículo estar dentro da faixa do seu tipo.`}
                />
                <Checkbox className="min-w-0" checked={filtered} onChange={(event) => set(changes(event.currentTarget.checked, min, max))} label={`Filtrar pela pretensão ${name}`} />
            </div>
            {filtered && (
                <div className="mt-2 grid max-w-xl grid-cols-1 gap-3 pl-[3.75rem] sm:grid-cols-2">
                    <NumberInput
                        label={`Pretensão ${name} de (R$)`}
                        classNames={{ label: 'font-semibold text-dark dark:text-white-light' }}
                        value={min}
                        min={LIMITS.salaryMin}
                        max={LIMITS.salaryMax}
                        thousandSeparator="."
                        decimalSeparator=","
                        allowDecimal={false}
                        allowNegative={false}
                        onChange={(value) => set(changes(filtered, value === '' ? '' : Number(value), max))}
                    />
                    <NumberInput
                        label={`Pretensão ${name} até (R$)`}
                        classNames={{ label: 'font-semibold text-dark dark:text-white-light' }}
                        value={max}
                        min={LIMITS.salaryMin}
                        max={LIMITS.salaryMax}
                        thousandSeparator="."
                        decimalSeparator=","
                        allowDecimal={false}
                        allowNegative={false}
                        onChange={(value) => set(changes(filtered, min, value === '' ? '' : Number(value)))}
                    />
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-5">
            <div className="panel">
                {/* a contagem dos currículos dos filtros (spinner enquanto o backend não responde) e o link da lista deles, fixa
                    no topo, logo abaixo do header fixo (56px): o efeito de cada filtro sempre à vista, sem rolar a tela */}
                <div className="sticky z-20 -mx-5 -mt-5 mb-4 bg-white px-5 pb-1 pt-5 dark:bg-[#0e1726]" style={{ top: STICKY_TOP }}>
                    <ResumesOfTheFiltersMessage request={request} {...resumesOfTheFilters} onSeeTheResumes={seeTheResumes} />
                </div>
                {filterExpired && (
                    <div role="alert" className="mb-4 flex items-start gap-2 rounded-md border border-warning/30 bg-warning-light px-3 py-2.5 text-sm font-semibold leading-snug text-warning dark:bg-warning-dark-light">
                        Este filtro está expirado!
                    </div>
                )}
                <div className="max-w-4xl">
                    <LabelComponent
                        explanation="Obrigatória: a área dos currículos procurados. A área de tecnologia da informação (TI) permite filtrar também pelas habilidades."
                        labelValue="Área:"
                        property="resumeType"
                        errors={{}}
                    >
                        <Select id="resumeType" data={resumeTypeOptions} value={form.resumeType || null} allowDeselect={false} onChange={(value) => value && set({ resumeType: value })} />
                    </LabelComponent>
                    <div className="mb-5">
                        <label className={fieldLabel}>Regiões</label>
                        <p className="mb-2 text-sm text-white-dark">Sem região escolhida, os currículos de todas as regiões entram na busca.</p>
                        <SummaryMultiSelect
                            data={regionOptions}
                            value={regionsValue}
                            onChange={selectRegions}
                            placeholder="Todas as regiões"
                            searchPlaceholder="Digite a cidade ou o estado que você procura"
                            nothingFoundMessage="Nenhuma região encontrada"
                            summaryLabel={(count) => `${count} ${count == 1 ? 'região selecionada' : 'regiões selecionadas'}`}
                            countValue={(value) => value != TODAS_AS_REGIOES}
                            maxDisplayedPills={2}
                        />
                    </div>
                    <LabelComponent
                        explanation="As senioridades dos currículos procurados: escolha uma ou mais. O currículo entra quando os anos de experiência dele estão na faixa de qualquer uma delas. Sem senioridade, todas."
                        labelValue="Senioridades:"
                        property="seniority"
                        errors={{}}
                    >
                        <MultiSelect
                            id="seniority"
                            data={seniorityOptions}
                            value={form.seniority}
                            placeholder={form.seniority.length ? undefined : 'Todas as senioridades'}
                            onChange={(values) => set({ seniority: seniorityOptions.filter((option) => values.includes(option.value)).map((option) => option.value) })}
                        />
                    </LabelComponent>
                    <div className="mb-5">
                        <label className={fieldLabel}>Idiomas exigidos além do português</label>
                        <SummaryMultiSelect
                            data={languageOptions}
                            value={form.spokenLanguage.map((language) => language.name)}
                            onChange={selectLanguages}
                            placeholder="Nenhum idioma exigido"
                            searchPlaceholder="Digite o idioma que você procura"
                            nothingFoundMessage="Nenhum idioma encontrado"
                            summaryLabel={(count) => `${count} idiomas selecionados`}
                            maxDisplayedPills={6}
                        />
                    </div>
                    {form.spokenLanguage.map((language) => (
                        <div key={language.name} className="mb-4 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:items-start md:gap-4">
                            <label className="mb-1.5 block font-semibold text-dark dark:text-white-light md:mb-0 md:pt-2">O nível exigido em idioma {language.name} é:</label>
                            <Select data={languageLevelOptions} value={String(language.level)} allowDeselect={false} onChange={(value) => value && setLanguageLevel(language.name, Number(value))} />
                        </div>
                    ))}
                </div>
                <CheckBoxComponent
                    explanation="Caso esta opção estiver marcada, só entram os currículos de pessoas com deficiência (PCD)."
                    checkBoxLabel="Somente pessoas com deficiência (PCD)"
                    setValue={(pcd) => set({ pcd })}
                    value={form.pcd}
                />
                <CheckBoxComponent
                    explanation="Caso esta opção estiver marcada, só entram os currículos de pessoas disponíveis para viagens nacionais ou internacionais."
                    checkBoxLabel="Somente quem tem disponibilidade para viagens"
                    setValue={(travel) => set({ travel })}
                    value={form.travel}
                />
                <IntegerFieldComponent
                    explanation="Caso esta opção estiver marcada, o prazo para começar não filtra. Caso esta opção não estiver marcada, você deverá informar no campo de texto que será mostrado em até quantos dias o candidato precisa poder começar."
                    checkBoxLabel="Contratação imediata"
                    textFieldLabel="Dias para o candidato começar"
                    setValue={(disponibility) => set({ disponibility })}
                    value={form.disponibility}
                    defaultValue={7}
                    minValue={1}
                    maxValue={LIMITS.disponibilityMax}
                />
                <IntegerFieldComponent
                    explanation="Caso esta opção estiver marcada, a duração do emprego não filtra. Caso esta opção não estiver marcada, você deverá informar no campo de texto que será mostrado a duração, em meses, do emprego temporário que o candidato precisa aceitar."
                    checkBoxLabel="Não é vaga temporária"
                    textFieldLabel="Duração do emprego temporário (em meses)"
                    setValue={(temporallyJobTime) => set({ temporallyJobTime })}
                    value={form.temporallyJobTime}
                    defaultValue={1}
                    maxValue={LIMITS.temporallyJobTimeMax}
                />
                {salaryRange('CLT', form.hasClt, form.cltMin, form.cltMax, (hasClt, cltMin, cltMax) => ({ hasClt, cltMin, cltMax }))}
                {salaryRange('PJ', form.hasPj, form.pjMin, form.pjMax, (hasPj, pjMin, pjMax) => ({ hasPj, pjMin, pjMax }))}
                <CheckBoxComponent
                    explanation="Caso esta opção estiver marcada, só entram os candidatos que aceitam negociar a pretensão salarial."
                    checkBoxLabel="Apenas candidatos que negociem pretensão salarial"
                    setValue={(negotiableClaim) => set({ negotiableClaim })}
                    value={form.negotiableClaim}
                />
                <div className="max-w-4xl">
                    {/* o texto da vaga num modal (desde 2026-11-26; antes, um campo da tela que lia as habilidades ao sair dele) */}
                    {isTechPosition(form) && (
                        <div className="mb-5">
                            <div className="flex min-w-0 items-center gap-2">
                                <HelpButton title={ADD_SKILLS_EXPLANATION} explanation={ADD_SKILLS_EXPLANATION} />
                                <button type="button" className="font-semibold text-primary underline hover:no-underline" title={ADD_SKILLS_EXPLANATION} onClick={openTheDescriptionModal} disabled={loadingSkills}>
                                    Adicionar habilidades
                                </button>
                            </div>
                            {tooManySkills && (
                                <p className="mt-1 pl-[2.25rem] text-sm text-danger">
                                    No máximo {REQUIRED_SKILLS_MAX} habilidades obrigatórias; retire {requiredSkills.length - REQUIRED_SKILLS_MAX}.
                                </p>
                            )}
                            {loadingSkills && (
                                <div className="mt-2 flex items-center gap-2 pl-[2.25rem] text-sm">
                                    <Loader size="xs" />
                                    <span>Lendo as habilidades do texto...</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                {isTechPosition(form) && showSkillLists && (
                    <div className="mb-6 border-b border-white-light pb-2 dark:border-[#1b2e4b]">
                        <TabSkills2 store={skillStore} getAccordionList={getImplicitSkills} source={skillsSourceOf(skillsText)} accordionView={broadSkillsView} withMoveAll />
                    </div>
                )}
                {/* no fim da tela (desde 2026-11-25): compartilhar a busca e abrir uma vaga para os candidatos dela */}
                <div className="mt-6 flex flex-wrap gap-3">
                    {/* só com currículos encontrados (desde 2026-11-27): sem nenhum, não há o que mandar a alguém */}
                    {(resumesOfTheFilters.found?.resumes || 0) > 0 && (
                        <button type="button" className="btn btn-outline-primary" onClick={copyTheLink} disabled={!filterId}>
                            Copiar este link para enviar para alguém
                        </button>
                    )}
                    <button type="button" className="btn btn-primary" onClick={contactTheCandidates}>
                        Contactar candidatos aderentes
                    </button>
                </div>
            </div>
            <Modal visible={descriptionModalOpened} setVisible={setDescriptionModalOpened} title="Adicionar habilidades" size="lg">
                <LabelComponent
                    explanation="Cole o texto da vaga ou descreva as habilidades que procura. Ao clicar em Ok, as habilidades encontradas nele aparecem nas listas da tela, como no cadastro de vaga: as obrigatórias filtram os currículos (o currículo precisa ter todas); as desejáveis não filtram. Arraste as habilidades entre as listas."
                    labelValue="Texto da vaga ou descritivo das habilidades requeridas:"
                    property="skillsText"
                    errors={{}}
                >
                    <Textarea
                        id="skillsText"
                        value={descriptionDraft}
                        maxLength={LIMITS.descriptionMax}
                        placeholder="Cole aqui o texto da vaga ou descreva as habilidades requeridas."
                        autosize
                        minRows={8}
                        maxRows={20}
                        data-autofocus
                        onChange={(event) => setDescriptionDraft(event.currentTarget.value)}
                    />
                </LabelComponent>
                <div className="mt-4 flex justify-end gap-2">
                    <button type="button" className="btn btn-outline-dark" onClick={() => setDescriptionModalOpened(false)}>
                        Cancelar
                    </button>
                    <button type="button" className="btn btn-primary" onClick={confirmTheDescription}>
                        Ok
                    </button>
                </div>
            </Modal>
            <ConfirmModal
                visible={askToShareTheDescription}
                onHide={() => setAskToShareTheDescription(false)}
                header="Incluir o descritivo da vaga no link?"
                message="Quer que o descritivo da vaga seja incluído no link, para ser carregado quando o link for aberto? Para isso, você precisará entrar com o seu e-mail, que irá no link."
                acceptLabel="Sim, incluir"
                rejectLabel="Não, só os filtros"
                accept={copyTheLinkWithTheDescription}
                reject={copyTheLinkWithoutTheDescription}
            />
            <Modal
                visible={positionFromTheSearch != null}
                setVisible={(visible) => !visible && setPositionFromTheSearch(null)}
                title="Abrir nova vaga para os candidatos desta busca"
                size="90%"
                closeOnClickOutside={false}
                closeOnEscape={false}
            >
                {positionFromTheSearch && <PositionFormModal position={null} fromSearch={positionFromTheSearch} onSaved={() => {}} onCancel={() => setPositionFromTheSearch(null)} />}
            </Modal>
            {/* a lista dos currículos encontrados num modal (desde 2026-11-26; antes, no pé da tela): aberto também logo depois
                do login que o link pede, quando a lista no pé da tela parecia não ter vindo */}
            <Modal
                visible={resumesShown && !!resumesOfTheFilters.found}
                setVisible={(visible) => !visible && setResumesShown(false)}
                title={`Currículos encontrados (${resumesOfTheFilters.found?.ids.length || 0})`}
                size="90%"
            >
                {resumesShown && resumesOfTheFilters.found && <ResumesOfThePositionFilters ids={resumesOfTheFilters.found.ids} sort={[]} desiredSkills={[]} />}
            </Modal>
        </div>
    );
};
