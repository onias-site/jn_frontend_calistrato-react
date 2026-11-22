'use client';
import React, { useState } from 'react';
import { Checkbox, MultiSelect, NumberInput, Select, Tabs, TagsInput, Textarea, TextInput } from '@mantine/core';
import JnAjax from '@/app/JnAjax';
import { LoadingButton } from '@/presentation/components/source/LoadingButton';
import { notify } from '@/presentation/components/source/notify';
import { dddRegions } from '@/presentation/components/regions/dddRegions';
import { resumeTypes } from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/tabs/TabResume/FormResume';
import { languages } from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/tabs/TabLanguages/ChooserLanguages';
import {
    Contact,
    LIMITS,
    Position,
    PositionForm,
    SortRule,
    contactTypeOptions,
    emptyForm,
    formOf,
    frequencyOptions,
    languageLevelOptions,
    pendingRequirements,
    positionOf,
    requestBodyOf,
    seniorityOptions,
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
const dddOptions = dddRegions.map((region) => ({ value: region.id, label: `${region.id} – ${region.nome}` }));
const languageOptions = languages.map((language) => language.name);

/**
 * O modal de "Criar vaga" e de "Editar" da tela "Meu Recrutamento → Vagas" (desde 2026-11-21), em abas: a vaga, os
 * requisitos, a faixa salarial e o envio dos currículos com os contatos. A lista do que falta fica embaixo e trava o
 * botão de gravar. A gravação é assíncrona no backend: a tela põe na lista o que enviou, sem reler.
 */
export const PositionFormModal = ({ position, onSaved, onCancel }: PositionFormModalProps) => {
    const creating = position == null;
    const [form, setForm] = useState<PositionForm>(creating ? emptyForm() : formOf(position));
    const [saving, setSaving] = useState(false);
    const errors = pendingRequirements(form, creating);
    const set = (changes: Partial<PositionForm>) => setForm({ ...form, ...changes });

    const setSort = (index: number, changes: Partial<SortRule>) => set({ sort: form.sort.map((rule, i) => (i == index ? { ...rule, ...changes } : rule)) });
    const setContact = (index: number, changes: Partial<Contact>) => set({ contact: form.contact.map((contact, i) => (i == index ? { ...contact, ...changes } : contact)) });
    const setLanguage = (index: number, changes: any) => set({ spokenLanguage: form.spokenLanguage.map((language, i) => (i == index ? { ...language, ...changes } : language)) });

    const save = () => {
        if (errors.length) return;
        setSaving(true);
        const body = requestBodyOf(form);
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
    };

    const removeButton = (onClick: () => void, disabled = false) => (
        <button type="button" className="btn btn-outline-danger btn-sm" onClick={onClick} disabled={disabled}>
            Remover
        </button>
    );

    const salaryRange = (name: string, checked: boolean, min: number | '', max: number | '', onCheck: (value: boolean) => void, onMin: (value: number | '') => void, onMax: (value: number | '') => void) => (
        <div className="mb-4">
            <Checkbox label={`Contratação ${name}`} checked={checked} onChange={(event) => onCheck(event.currentTarget.checked)} />
            {checked && (
                <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <NumberInput label="De (R$)" value={min} min={LIMITS.salaryMin} max={LIMITS.salaryMax} thousandSeparator="." decimalSeparator="," allowDecimal={false} onChange={(value) => onMin(value === '' ? '' : Number(value))} />
                    <NumberInput label="Até (R$)" value={max} min={LIMITS.salaryMin} max={LIMITS.salaryMax} thousandSeparator="." decimalSeparator="," allowDecimal={false} onChange={(value) => onMax(value === '' ? '' : Number(value))} />
                </div>
            )}
        </div>
    );

    return (
        <div className="flex flex-col gap-4">
            <Tabs defaultValue="position">
                <Tabs.List className="mb-4 flex-nowrap overflow-x-auto">
                    <Tabs.Tab value="position" className="whitespace-nowrap font-semibold">Vaga</Tabs.Tab>
                    <Tabs.Tab value="requirements" className="whitespace-nowrap font-semibold">Requisitos</Tabs.Tab>
                    <Tabs.Tab value="salary" className="whitespace-nowrap font-semibold">Salário</Tabs.Tab>
                    <Tabs.Tab value="sending" className="whitespace-nowrap font-semibold">Envio e contatos</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="position">
                    <div className="flex flex-col gap-3">
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
                        <Select label="Área" data={resumeTypeOptions} value={form.resumeType} withAsterisk allowDeselect={false} onChange={(value) => set({ resumeType: value || '' })} />
                        <Select label="Senioridade" data={seniorityOptions} value={form.seniority || null} withAsterisk placeholder="Escolha" onChange={(value) => set({ seniority: value || '' })} />
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <TextInput type="date" label="Início" value={form.expirationMin} min={creating ? today() : undefined} withAsterisk onChange={(event) => set({ expirationMin: event.currentTarget.value })} />
                            <TextInput type="date" label="Expira em" value={form.expirationMax} min={form.expirationMin || undefined} withAsterisk onChange={(event) => set({ expirationMax: event.currentTarget.value })} />
                        </div>
                    </div>
                </Tabs.Panel>

                <Tabs.Panel value="requirements">
                    <div className="flex flex-col gap-3">
                        <MultiSelect label="Regiões (DDD)" data={dddOptions} value={form.ddd} searchable withAsterisk placeholder="Escolha as regiões" maxValues={LIMITS.dddMax} onChange={(value) => set({ ddd: value })} />
                        <TagsInput
                            label="Habilidades obrigatórias"
                            description="Digite e tecle Enter. O currículo precisa ter estas habilidades."
                            value={form.requiredSkills}
                            onChange={(value) => set({ requiredSkills: value.map((name) => name.trim().toUpperCase()).filter(Boolean) })}
                        />
                        <TagsInput
                            label="Habilidades desejáveis"
                            description="Digite e tecle Enter. Contam a favor do currículo, mas não são exigidas."
                            value={form.desiredSkills}
                            onChange={(value) => set({ desiredSkills: value.map((name) => name.trim().toUpperCase()).filter(Boolean) })}
                        />
                        <div>
                            <div className="mb-2 text-sm font-medium">Idiomas</div>
                            {form.spokenLanguage.map((language, index) => (
                                <div key={index} className="mb-2 grid grid-cols-1 items-end gap-2 sm:grid-cols-[1fr_1fr_auto]">
                                    <Select data={languageOptions} value={language.name || null} searchable placeholder="Idioma" onChange={(value) => setLanguage(index, { name: value || '' })} />
                                    <Select data={languageLevelOptions} value={String(language.level)} allowDeselect={false} onChange={(value) => setLanguage(index, { level: Number(value) })} />
                                    {removeButton(() => set({ spokenLanguage: form.spokenLanguage.filter((_, i) => i != index) }))}
                                </div>
                            ))}
                            <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => set({ spokenLanguage: [...form.spokenLanguage, { name: '', level: 1 }] })}>
                                Acrescentar idioma
                            </button>
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <NumberInput
                                label="Dias para começar"
                                description={`0 = imediato; até ${LIMITS.disponibilityMax}`}
                                value={form.disponibility}
                                min={0}
                                max={LIMITS.disponibilityMax}
                                allowDecimal={false}
                                onChange={(value) => set({ disponibility: value === '' ? '' : Number(value) })}
                            />
                            <NumberInput
                                label="Duração do temporário (meses)"
                                description={`0 = não é temporário; até ${LIMITS.temporallyJobTimeMax}`}
                                value={form.temporallyJobTime}
                                min={0}
                                max={LIMITS.temporallyJobTimeMax}
                                allowDecimal={false}
                                onChange={(value) => set({ temporallyJobTime: value === '' ? '' : Number(value) })}
                            />
                        </div>
                        <Checkbox label="Vaga para pessoas com deficiência (PCD)" checked={form.pcd} onChange={(event) => set({ pcd: event.currentTarget.checked })} />
                        <Checkbox label="Exige disponibilidade para viagens" checked={form.travel} onChange={(event) => set({ travel: event.currentTarget.checked })} />
                    </div>
                </Tabs.Panel>

                <Tabs.Panel value="salary">
                    {salaryRange('CLT', form.hasClt, form.cltMin, form.cltMax, (hasClt) => set({ hasClt }), (cltMin) => set({ cltMin }), (cltMax) => set({ cltMax }))}
                    {salaryRange('PJ', form.hasPj, form.pjMin, form.pjMax, (hasPj) => set({ hasPj }), (pjMin) => set({ pjMin }), (pjMax) => set({ pjMax }))}
                    <Checkbox label="Salário negociável" checked={form.negotiableClaim} onChange={(event) => set({ negotiableClaim: event.currentTarget.checked })} />
                </Tabs.Panel>

                <Tabs.Panel value="sending">
                    <div className="flex flex-col gap-3">
                        <Select label="Frequência de envio dos currículos" data={frequencyOptions} value={form.frequencyType} allowDeselect={false} onChange={(value) => set({ frequencyType: value || 'daily' })} />
                        <Checkbox label="Divulgar a vaga nos grupos" checked={form.mustSendInGroups} onChange={(event) => set({ mustSendInGroups: event.currentTarget.checked })} />
                        <Checkbox label="Enviar a vaga aos currículos compatíveis" checked={form.mustSendToResumes} onChange={(event) => set({ mustSendToResumes: event.currentTarget.checked })} />
                        <div>
                            <div className="mb-2 text-sm font-medium">Ordem dos currículos encontrados</div>
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
                        <div>
                            <div className="mb-2 text-sm font-medium">Contatos para os candidatos</div>
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
                    </div>
                </Tabs.Panel>
            </Tabs>

            {errors.length > 0 && (
                <ul className="list-inside list-disc text-sm text-danger">
                    {errors.map((error) => (
                        <li key={error}>{error}</li>
                    ))}
                </ul>
            )}
            <div className="flex justify-end gap-2">
                <button type="button" className="btn btn-outline-dark" onClick={onCancel} disabled={saving}>
                    Cancelar
                </button>
                <LoadingButton className="btn btn-primary" label={creating ? 'Criar vaga' : 'Salvar'} loading={saving} invalid={errors.length > 0} onClick={save} />
            </div>
        </div>
    );
};
