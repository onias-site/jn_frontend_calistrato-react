'use client';
import React, { useState } from 'react';
import { Checkbox, MultiSelect, NumberInput, Select, Textarea, TextInput } from '@mantine/core';
import { sha1 } from 'js-sha1';
import JnAjax from '@/app/JnAjax';
import { Tabs } from '@/presentation/components/source/Tabs';
import { HelpButton } from '@/presentation/components/source/HelpButton';
import { CheckBoxComponent } from '@/presentation/components/source/CheckBoxComponent';
import { IntegerFieldComponent } from '@/presentation/components/source/IntegerFieldComponent';
import { SummaryMultiSelect } from '@/presentation/components/source/SummaryMultiSelect';
import { notify } from '@/presentation/components/source/notify';
import { dddRegions } from '@/presentation/components/regions/dddRegions';
import { resumeTypes } from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/tabs/TabResume/FormResume';
import { languages } from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/tabs/TabLanguages/ChooserLanguages';
import { TabSkills2, createSkillStore, getImplicitSkills } from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/tabs/TabSkills/TabSkills';
import { HOME_OFFICE, TODAS_AS_REGIOES } from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/tabs/TabFilter/RegioesComponent';
import IconFile from '@/presentation/icons/icon-file';
import IconGlobe from '@/presentation/icons/icon-globe';
import IconGithub from '@/presentation/icons/icon-github';
import IconSettings from '@/presentation/icons/icon-settings';
import IconDollarSign from '@/presentation/icons/icon-dollar-sign';
import IconSave from '@/presentation/icons/icon-save';
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
    pendingRequirements,
    positionOf,
    positionTabErrors,
    requestBodyOf,
    salaryTabErrors,
    seniorityOptions,
    skillGroupsFromText,
    skillGroupsOfThePosition,
    sortFieldOptions,
    sortTypeOptions,
    today,
} from './positionsData';

type PositionFormModalProps = {
    // sem vaga, "Criar vaga": o título vem vazio e é obrigatório; com vaga, "Editar": o título (parte da chave) fica travado
    position: Position | null;
    onSaved: (position: Position) => void;
    onCancel: () => void;
};

const resumeTypeOptions = resumeTypes.map((type) => ({ value: String(type.id), label: type.label }));
const regionOptions = [{ value: TODAS_AS_REGIOES, label: 'Qualquer estado / cidade' }, ...dddRegions.filter((region) => region.id != HOME_OFFICE).map((region) => ({ value: region.id, label: region.nome }))];
const allRegions = regionOptions.map((option) => option.value).filter((value) => value != TODAS_AS_REGIOES);
const languageOptions = languages.map((language) => ({ value: language.name, label: language.name }));
const fieldLabel = 'mb-1.5 block font-semibold text-dark dark:text-white-light';

/**
 * O modal de "Criar vaga" e de "Editar" da tela "Meu Recrutamento → Vagas", em abas sequenciais como o cadastro de
 * currículo (desde 2026-11-22): a primeira, "Vaga", tem título, descrição, área, contatos e as datas de início e de fim;
 * as demais são as do currículo, na mesma ordem e com os mesmos ícones: Idiomas, Habilidades, Opções e Salários. Como
 * no currículo, sair da primeira aba numa vaga de tecnologia manda a descrição ao skills/fromText, que preenche as duas
 * listas de arrastar e soltar (obrigatórias e desejáveis) e os conhecimentos implícitos; a aba Habilidades só aparece
 * com alguma habilidade encontrada. As listas ficam numa store só deste modal (createSkillStore). Cada
 * aba só deixa avançar com as suas pendências resolvidas; na última, o botão grava. A gravação é assíncrona no backend: a
 * tela põe na lista o que enviou, sem reler.
 */
export const PositionFormModal = ({ position, onSaved, onCancel }: PositionFormModalProps) => {
    const creating = position == null;
    const [form, setForm] = useState<PositionForm>(creating ? emptyForm() : formOf(position));
    const [saving, setSaving] = useState(false);
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
    const [hasTabSkills, setHasTabSkills] = useState(skillGroups.some((group) => group.list.length > 0));
    const showTabSkills = hasTabSkills && isTechPosition(form);
    const set = (changes: Partial<PositionForm>) => setForm((current) => ({ ...current, ...changes }));

    const setSort = (index: number, changes: Partial<SortRule>) => set({ sort: form.sort.map((rule, i) => (i == index ? { ...rule, ...changes } : rule)) });
    const setContact = (index: number, changes: Partial<Contact>) => set({ contact: form.contact.map((contact, i) => (i == index ? { ...contact, ...changes } : contact)) });

    // a descrição que deu as habilidades da aba já não é a do campo: falta passar pela aba Habilidades
    const skillsOutdated = () => isTechPosition(form) && skillStore.getState().context.cacheHash != sha1(form.description.trim());

    // ao sair da aba Vaga, como ao sair da aba Currículo: as habilidades da descrição, só quando ela mudou
    const loadSkillsFromText = (): string[] => {
        const errors = positionTabErrors(form, creating);
        if (errors.length) return errors;
        if (!skillsOutdated()) return [];
        const text = form.description.trim();
        const cacheHash = sha1(text);
        const skillState = skillStore.getState();
        // as desejáveis voltam como excluídas, para não reaparecerem entre as obrigatórias
        const requestSkillsToBackEnd = { excludedSkill: skillState.getWordsFromGroup(DESIRED_SKILLS), text };
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

    // devolve as pendências de todas as abas; sem nenhuma, envia e devolve vazio (a convenção do Tabs)
    const save = (): string[] => {
        if (skillsOutdated()) return ['Aba Vaga: a descrição mudou. Avance até a aba Habilidades para conferir as habilidades encontradas nela antes de salvar.'];
        const skillErrors = showTabSkills ? skillStore.getState().getPendingRequirements() : [];
        const errors = [...pendingRequirements(form, creating), ...skillErrors];
        if (errors.length || saving) return errors;
        setSaving(true);
        const body = requestBodyOf(form, skillStore.getState().loadSkillsContext());
        const callbacks: any = {};
        callbacks[200] = () => {
            setSaving(false);
            notify({ summary: creating ? 'Vaga criada' : 'Vaga salva', detail: 'A lista já mostra a vaga como você a gravou.' });
            onSaved(positionOf(body));
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

    const tabs: any[] = [
        { label: 'Vaga', icon: <IconFile className="h-4 w-4" />, getPendingRequirements: () => positionTabErrors(form, creating), onMoveOnFowardTabs: loadSkillsFromText },
        { label: 'Idiomas', icon: <IconGlobe className="h-4 w-4" />, getPendingRequirements: () => languagesTabErrors(form), onMoveOnFowardTabs: () => languagesTabErrors(form) },
        { label: 'Opções', icon: <IconSettings className="h-4 w-4" />, getPendingRequirements: () => optionsTabErrors(form), onMoveOnFowardTabs: () => optionsTabErrors(form) },
        { label: 'Salários', icon: <IconDollarSign className="h-4 w-4" />, getPendingRequirements: () => salaryTabErrors(form), onMoveOnFowardTabs: save },
    ];
    // a aba Habilidades entra depois de Idiomas, como no currículo, com o número de habilidades obrigatórias
    const requiredGroup = skillGroups.filter((group) => group.name == REQUIRED_SKILLS)[0];
    const requiredCount = requiredGroup ? requiredGroup.list.length : 0;
    const tabSkills = {
        label: `${requiredCount} Habilidades`,
        icon: <IconGithub className="h-4 w-4" />,
        title: 'Caso as habilidades estiverem desatualizadas / incorretas, volte à aba Vaga e corrija a descrição, para que possamos atualizar corretamente a lista de habilidades',
        getPendingRequirements: () => skillStore.getState().getPendingRequirements(),
        onMoveOnFowardTabs: () => skillStore.getState().getPendingRequirements(),
    };
    showTabSkills && tabs.splice(2, 0, tabSkills);

    const removeButton = (onClick: () => void, disabled = false) => (
        <button type="button" className="btn btn-outline-danger btn-sm" onClick={onClick} disabled={disabled}>
            Remover
        </button>
    );

    // ---- aba Vaga
    const positionTab = (
        <div className="flex flex-col gap-4">
            <TextInput
                label="Título"
                description={creating ? `De ${LIMITS.titleMin} a ${LIMITS.titleMax} caracteres. Não muda depois de criada.` : 'O título identifica a vaga e não pode ser alterado.'}
                value={form.title}
                maxLength={LIMITS.titleMax}
                withAsterisk
                disabled={!creating}
                onChange={(event) => set({ title: event.currentTarget.value })}
            />
            <Textarea
                label="Descrição"
                description={`De ${LIMITS.descriptionMin} a ${LIMITS.descriptionMax.toLocaleString('pt-BR')} caracteres (${form.description.trim().length}).`}
                value={form.description}
                maxLength={LIMITS.descriptionMax}
                withAsterisk
                autosize
                minRows={4}
                maxRows={12}
                onChange={(event) => set({ description: event.currentTarget.value })}
            />
            <Select label="Área da vaga" data={resumeTypeOptions} value={form.resumeType} withAsterisk allowDeselect={false} onChange={(value) => set({ resumeType: value || '' })} />
            <div>
                <label className={fieldLabel}>Contatos para os candidatos</label>
                {form.contact.map((contact, index) => (
                    <div key={index} className="mb-2 grid grid-cols-1 items-end gap-2 sm:grid-cols-[1fr_2fr_auto]">
                        <Select data={contactTypeOptions} value={contact.type} allowDeselect={false} onChange={(value) => setContact(index, { type: (value as Contact['type']) || 'email' })} />
                        <TextInput
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
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <TextInput type="date" label="Início da vaga" value={form.expirationMin} min={creating ? today() : undefined} withAsterisk onChange={(event) => set({ expirationMin: event.currentTarget.value })} />
                <TextInput type="date" label="Fim da vaga (expira em)" value={form.expirationMax} min={form.expirationMin || undefined} withAsterisk onChange={(event) => set({ expirationMax: event.currentTarget.value })} />
            </div>
        </div>
    );

    // ---- aba Idiomas (como a do currículo: o checkbox abre a lista, e cada idioma escolhido pede o nível)
    const selectLanguages = (names: string[]) =>
        set({ spokenLanguage: names.map((name) => form.spokenLanguage.filter((language) => language.name == name)[0] || { name, level: 1 }) });
    const setLanguageLevel = (name: string, level: number) => set({ spokenLanguage: form.spokenLanguage.map((language) => (language.name == name ? { ...language, level } : language)) });
    const languagesTab = (
        <div>
            <div className="mb-5">
                <Checkbox checked={form.hasLanguages} onChange={(event) => set({ hasLanguages: event.currentTarget.checked })} label="A vaga exige conhecimento em outro(s) idioma(s) além do português" />
            </div>
            {form.hasLanguages && (
                <div className="mb-6">
                    <label className={fieldLabel}>Idiomas exigidos</label>
                    <SummaryMultiSelect
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
                        <label className="mb-1.5 block font-semibold text-dark dark:text-white-light md:mb-0 md:pt-2">Nível exigido em {language.name}:</label>
                        <Select data={languageLevelOptions} value={String(language.level)} allowDeselect={false} onChange={(value) => value && setLanguageLevel(language.name, Number(value))} comboboxProps={{ withinPortal: false }} />
                    </div>
                ))}
        </div>
    );

    // ---- aba Opções (regiões como as do currículo, mais o que é só da vaga: senioridade, envio e ordem dos currículos)
    const homeOffice = form.ddd.includes(HOME_OFFICE);
    const regionsValue = form.ddd.length == allRegions.length ? [TODAS_AS_REGIOES, ...form.ddd] : form.ddd;
    const selectRegions = (values: string[], changed: string) => {
        if (changed == TODAS_AS_REGIOES) {
            set({ ddd: values.includes(TODAS_AS_REGIOES) ? allRegions : [] });
            return;
        }
        set({ ddd: values.filter((value) => value != TODAS_AS_REGIOES) });
    };
    const optionsTab = (
        <div>
            <div className="mb-5">
                <label className="mb-2 block font-semibold text-dark dark:text-white-light">Onde a vaga é</label>
                <Checkbox className="mb-3" checked={homeOffice} onChange={(event) => set({ ddd: event.currentTarget.checked ? [HOME_OFFICE] : [] })} label="Vaga somente home office" />
                {!homeOffice && (
                    <SummaryMultiSelect
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
            <div className="mb-5 max-w-md">
                <Select label="Senioridade" data={seniorityOptions} value={form.seniority || null} withAsterisk placeholder="Escolha" onChange={(value) => set({ seniority: value || '' })} />
            </div>
            <CheckBoxComponent explanation="Marcada, a vaga é oferecida aos currículos de pessoas com deficiência (PCD)." checkBoxLabel="Vaga para pessoas com deficiência (PCD)" setValue={(pcd) => set({ pcd })} value={form.pcd} />
            <CheckBoxComponent explanation="Marcada, a vaga só é oferecida aos currículos com disponibilidade para viagens nacionais ou internacionais." checkBoxLabel="A vaga exige disponibilidade para viagens" setValue={(travel) => set({ travel })} value={form.travel} />
            <IntegerFieldComponent
                explanation="Marcada, a vaga busca quem pode começar já. Desmarcada, informe em quantos dias o candidato pode começar."
                checkBoxLabel="Contratação imediata"
                textFieldLabel="Dias para o candidato começar"
                setValue={(disponibility) => set({ disponibility })}
                value={form.disponibility}
                defaultValue={7}
                minValue={1}
                maxValue={LIMITS.disponibilityMax}
            />
            <IntegerFieldComponent
                explanation="Marcada, a vaga é por prazo indeterminado. Desmarcada, informe a duração, em meses, do emprego temporário."
                checkBoxLabel="Não é vaga temporária"
                textFieldLabel="Duração do emprego temporário (em meses)"
                setValue={(temporallyJobTime) => set({ temporallyJobTime })}
                value={form.temporallyJobTime}
                defaultValue={1}
                maxValue={LIMITS.temporallyJobTimeMax}
            />
            <div className="mb-5 mt-6 border-t border-white-light pt-5 dark:border-[#1b2e4b]">
                <div className="mb-4 max-w-md">
                    <Select label="Frequência de envio dos currículos encontrados" data={frequencyOptions} value={form.frequencyType} allowDeselect={false} onChange={(value) => set({ frequencyType: value || 'daily' })} />
                </div>
                <CheckBoxComponent explanation="Marcada, a vaga é divulgada nos grupos de vagas." checkBoxLabel="Divulgar a vaga nos grupos" setValue={(mustSendInGroups) => set({ mustSendInGroups })} value={form.mustSendInGroups} />
                <CheckBoxComponent explanation="Marcada, a vaga é enviada às pessoas cujos currículos combinam com ela." checkBoxLabel="Enviar a vaga aos currículos compatíveis" setValue={(mustSendToResumes) => set({ mustSendToResumes })} value={form.mustSendToResumes} />
            </div>
            <div>
                <label className={fieldLabel}>Ordem dos currículos encontrados</label>
                {form.sort.map((rule, index) => (
                    <div key={index} className="mb-2 grid grid-cols-1 items-end gap-2 sm:grid-cols-[2fr_1fr_auto]">
                        <MultiSelect data={sortFieldOptions} value={rule.field} placeholder="Critérios" onChange={(value) => setSort(index, { field: value })} />
                        <Select data={sortTypeOptions} value={rule.type} allowDeselect={false} onChange={(value) => setSort(index, { type: (value as SortRule['type']) || 'desc' })} />
                        {removeButton(() => set({ sort: form.sort.filter((_, i) => i != index) }), form.sort.length == 1)}
                    </div>
                ))}
                <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => set({ sort: [...form.sort, { type: 'desc', field: [] }] })}>
                    Acrescentar critério
                </button>
            </div>
        </div>
    );

    // ---- aba Salários (o checkbox "não ofereço" como o "não aceito" do currículo; desmarcado, a faixa de e até)
    const salaryRange = (name: string, offered: boolean, min: number | '', max: number | '', changes: (offered: boolean, min: number | '', max: number | '') => Partial<PositionForm>) => (
        <div className="mb-4">
            <div className="flex min-w-0 items-start gap-2">
                <HelpButton title={`Não ofereço contratação ${name}`} explanation={`Marcada, a vaga não é de contrato ${name}. Desmarcada, informe a faixa salarial mensal ${name}, em reais.`} />
                <Checkbox className="min-w-0" checked={!offered} onChange={(event) => set(changes(!event.currentTarget.checked, min, max))} label={`Não ofereço contratação ${name}`} />
            </div>
            {offered && (
                <div className="mt-2 grid max-w-xl grid-cols-1 gap-3 pl-[3.75rem] sm:grid-cols-2">
                    <NumberInput label="De (R$)" value={min} min={LIMITS.salaryMin} max={LIMITS.salaryMax} thousandSeparator="." decimalSeparator="," allowDecimal={false} allowNegative={false} onChange={(value) => set(changes(offered, value === '' ? '' : Number(value), max))} />
                    <NumberInput label="Até (R$)" value={max} min={LIMITS.salaryMin} max={LIMITS.salaryMax} thousandSeparator="." decimalSeparator="," allowDecimal={false} allowNegative={false} onChange={(value) => set(changes(offered, min, value === '' ? '' : Number(value)))} />
                </div>
            )}
        </div>
    );
    const salaryTab = (
        <div>
            {salaryRange('CLT', form.hasClt, form.cltMin, form.cltMax, (hasClt, cltMin, cltMax) => ({ hasClt, cltMin, cltMax }))}
            {salaryRange('PJ', form.hasPj, form.pjMin, form.pjMax, (hasPj, pjMin, pjMax) => ({ hasPj, pjMin, pjMax }))}
            <CheckBoxComponent
                explanation="Marcada, a vaga também é oferecida aos currículos cuja pretensão salarial é negociável."
                checkBoxLabel="O salário é negociável"
                setValue={(negotiableClaim) => set({ negotiableClaim })}
                value={form.negotiableClaim}
            />
        </div>
    );

    const saveLabel = creating ? 'Criar vaga' : 'Salvar dados';
    const saveShortcut = creating ? undefined : { label: 'Salvar dados', icon: <IconSave className="h-4 w-4" />, onClick: save };

    return (
        <Tabs tabs={tabs} lastButtonLabel={saveLabel} lastButtonIcon={<IconSave className="h-4 w-4" />} firstButtonLabel="Cancelar" firstButtonClick={onCancel} shortcutButton={saveShortcut}>
            {positionTab}
            {languagesTab}
            {showTabSkills && <TabSkills2 store={skillStore} getAccordionList={getImplicitSkills} withSuggestions={false} />}
            {optionsTab}
            {salaryTab}
        </Tabs>
    );
};
