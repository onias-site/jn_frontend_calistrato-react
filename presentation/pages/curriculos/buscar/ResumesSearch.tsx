'use client';
import React, { useEffect, useState } from 'react';
import { Checkbox, Loader, MultiSelect, NumberInput, Select, Textarea } from '@mantine/core';
import { sha1 } from 'js-sha1';
import JnAjax from '@/app/JnAjax';
import { LabelComponent } from '@/presentation/components/source/LabelComponent';
import { Modal } from '@/presentation/components/source/Modal';
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
import { addressWithTheFilter, emptySearch, FILTER_PARAMETER, positionFormOfTheSearch, ResumesSearch as Search, searchFormOf } from './resumesSearchData';

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
    const [resumesShown, setResumesShown] = useState(false);
    const { form } = search;
    const set = (changes: Partial<PositionForm>) => setSearch((current) => ({ ...current, form: { ...current.form, ...changes } }));
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

    // aberta com o id dos filtros no endereço: os campos ficam como estavam
    useEffect(() => {
        const filterId = new URLSearchParams(window.location.search).get(FILTER_PARAMETER);
        if (!filterId) return;
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
        };
        // sem os filtros (expiraram 24 horas depois da última busca deles) a tela fica como está
        callbacks[404] = () => setReadingTheFilters(false);
        callbacks[422] = () => setReadingTheFilters(false);
        callbacks['onUnexpectedHttpStatus'] = () => setReadingTheFilters(false);
        JnAjax.doAnAjaxRequest(`resume-filter/${encodeURIComponent(filterId)}`, callbacks, 'GET', null as any, {}, 'http://localhost:8081');
    }, []);

    const login: any = JnAjax.getLogin() || {};
    // enquanto os filtros do endereço não chegam, nada é contado (a contagem da busca vazia seria jogada fora)
    const request = readingTheFilters ? null : filtersRequestOf(form, isTechPosition(form) ? requiredSkills : [], login.email, false);
    const resumesOfTheFilters = useResumesOfTheFilters(request);
    const filterId = resumesOfTheFilters.found?.id;

    // o id dos filtros contados vai para o endereço, sem recarregar a tela
    useEffect(() => {
        if (!filterId) return;
        window.history.replaceState(null, '', addressWithTheFilter(window.location.href, filterId));
    }, [filterId]);

    // o texto da vaga limpo: as três seções de habilidades somem, e as obrigatórias deixam de filtrar
    const changeSkillsText = (text: string) => {
        setSkillsText(text);
        if (text.trim()) return;
        skillStore.getState().setGroups(groupsOfTheRequiredSkills([]) as any, getImplicitSkills);
        skillStore.getState().setContext({});
    };

    // ao sair do texto da vaga, como ao sair da aba Vaga do modal: as habilidades do texto, só quando ele mudou
    const loadSkillsFromText = () => {
        const text = skillsText.trim();
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
            JnAjax.getHandler401(loadSkillsFromText)();
        };
        callbacks['onUnexpectedHttpStatus'] = () => {
            setLoadingSkills(false);
            notify({ summary: 'Habilidades não encontradas', detail: 'Não foi possível ler as habilidades do texto agora. Saia do campo de novo para tentar outra vez.', severity: 'error' });
        };
        setLoadingSkills(true);
        JnAjax.doAnAjaxRequest('skills/fromText', callbacks, 'POST', requestSkillsToBackEnd, {}, 'http://localhost:8081');
    };

    // "Copiar este link para enviar para alguém": o endereço com o id dos filtros, que reabre a busca como está
    const copyTheLink = () => {
        if (!filterId) return;
        const link = window.location.origin + addressWithTheFilter(window.location.href, filterId);
        const copied = () => notify({ summary: 'Link copiado', detail: 'Cole o link para quem deve ver esta busca: os filtros valem por 24 horas.', severity: 'success' });
        const failed = () => notify({ summary: 'Não foi possível copiar', detail: link, severity: 'warn' });
        navigator.clipboard.writeText(link).then(copied, failed);
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
                    {isTechPosition(form) && (
                        <LabelComponent
                            explanation="Cole o texto da vaga ou descreva as habilidades que procura. Ao sair do campo, as habilidades encontradas nele aparecem nas listas abaixo, como no cadastro de vaga: as obrigatórias filtram os currículos (o currículo precisa ter todas); as desejáveis não filtram. Arraste as habilidades entre as listas."
                            labelValue="Texto da vaga ou descritivo das habilidades requeridas:"
                            property="skillsText"
                            errors={tooManySkills ? { skillsText: `No máximo ${REQUIRED_SKILLS_MAX} habilidades obrigatórias; retire ${requiredSkills.length - REQUIRED_SKILLS_MAX}.` } : {}}
                        >
                            <Textarea
                                id="skillsText"
                                value={skillsText}
                                maxLength={LIMITS.descriptionMax}
                                placeholder="Cole aqui o texto da vaga ou descreva as habilidades requeridas."
                                autosize
                                minRows={5}
                                maxRows={20}
                                disabled={loadingSkills}
                                onChange={(event) => changeSkillsText(event.currentTarget.value)}
                                onBlur={loadSkillsFromText}
                            />
                            {loadingSkills && (
                                <div className="mt-2 flex items-center gap-2 text-sm">
                                    <Loader size="xs" />
                                    <span>Lendo as habilidades do texto...</span>
                                </div>
                            )}
                        </LabelComponent>
                    )}
                </div>
                {isTechPosition(form) && showSkillLists && (
                    <div className="mb-6 border-b border-white-light pb-2 dark:border-[#1b2e4b]">
                        <TabSkills2 store={skillStore} getAccordionList={getImplicitSkills} source={skillsSourceOf(skillsText)} accordionView={broadSkillsView} withMoveAll />
                    </div>
                )}
                {/* no fim da tela (desde 2026-11-25): compartilhar a busca e abrir uma vaga para os candidatos dela */}
                <div className="mt-6 flex flex-wrap gap-3">
                    <button type="button" className="btn btn-outline-primary" onClick={copyTheLink} disabled={!filterId}>
                        Copiar este link para enviar para alguém
                    </button>
                    <button type="button" className="btn btn-primary" onClick={contactTheCandidates}>
                        Contactar candidatos aderentes
                    </button>
                </div>
            </div>
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
