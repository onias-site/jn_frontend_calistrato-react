'use client';
import React, { useState } from 'react';
import { CheckIcon, Combobox, Group, Input, Pill, PillsInput, ScrollArea, useCombobox } from '@mantine/core';

export interface SummaryMultiSelectOption {
    value: string;
    label: string;
}

export interface SummaryMultiSelectProps {
    id?: string;
    data: SummaryMultiSelectOption[];
    value: string[];
    // recebe a lista nova e o valor que foi marcado ou desmarcado
    onChange: (values: string[], changed: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    nothingFoundMessage?: string;
    // até quantas escolhas aparecem como etiquetas; acima disso aparece só o resumo
    maxDisplayedPills?: number;
    // o resumo mostrado quando há mais escolhas que etiquetas (recebe quantas estão escolhidas)
    summaryLabel?: (count: number) => string;
    error?: boolean | string;
    disabled?: boolean;
    // os valores que contam no resumo (por padrão todos); serve para não contar opções que são só atalhos da tela
    countValue?: (value: string) => boolean;
}

/**
 * Lista de escolha múltipla com busca: as escolhas aparecem como etiquetas até um limite e, acima dele, como um resumo
 * ("12 regiões selecionadas"), para o campo não crescer com dezenas de etiquetas.
 */
export const SummaryMultiSelect: React.FC<SummaryMultiSelectProps> = ({
    id,
    data,
    value,
    onChange,
    placeholder = 'Selecione',
    searchPlaceholder = 'Digite para filtrar',
    nothingFoundMessage = 'Nada encontrado',
    maxDisplayedPills = 3,
    summaryLabel = (count) => `${count} selecionados`,
    error,
    disabled,
    countValue = () => true,
}) => {
    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
        onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
    });
    const [search, setSearch] = useState('');

    const toggle = (optionValue: string) => {
        const newValues = value.includes(optionValue) ? value.filter((item) => item !== optionValue) : [...value, optionValue];
        onChange(newValues, optionValue);
    };

    const labelOf = (optionValue: string) => (data.find((option) => option.value === optionValue) || { label: optionValue }).label;

    const options = data
        .filter((option) => option.label.toLowerCase().includes(search.trim().toLowerCase()))
        .map((option) => (
            <Combobox.Option value={option.value} key={option.value} active={value.includes(option.value)}>
                <Group gap="sm" wrap="nowrap">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center">{value.includes(option.value) && <CheckIcon size={12} />}</span>
                    <span>{option.label}</span>
                </Group>
            </Combobox.Option>
        ));

    const counted = value.filter(countValue);
    const showSummary = counted.length > maxDisplayedPills;
    const pills = value.map((item) => (
        <Pill key={item} withRemoveButton={!disabled} onRemove={() => toggle(item)}>
            {labelOf(item)}
        </Pill>
    ));

    return (
        <Combobox store={combobox} onOptionSubmit={toggle} withinPortal={false} disabled={disabled}>
            <Combobox.DropdownTarget>
                <PillsInput
                    id={id}
                    pointer
                    onClick={() => combobox.toggleDropdown()}
                    rightSection={<Combobox.Chevron />}
                    rightSectionPointerEvents="none"
                    error={error}
                    disabled={disabled}
                >
                    <Pill.Group>
                        {value.length === 0 && <Input.Placeholder>{placeholder}</Input.Placeholder>}
                        {value.length > 0 && showSummary && <span className="py-0.5 font-semibold">{summaryLabel(counted.length)}</span>}
                        {value.length > 0 && !showSummary && pills}
                        <Combobox.EventsTarget>
                            <PillsInput.Field type="hidden" onBlur={() => combobox.closeDropdown()} onKeyDown={(event) => event.key === 'Backspace' && event.preventDefault()} />
                        </Combobox.EventsTarget>
                    </Pill.Group>
                </PillsInput>
            </Combobox.DropdownTarget>

            <Combobox.Dropdown>
                <Combobox.Search value={search} onChange={(event) => setSearch(event.currentTarget.value)} placeholder={searchPlaceholder} />
                <Combobox.Options>
                    <ScrollArea.Autosize mah={260} type="scroll">
                        {options.length > 0 ? options : <Combobox.Empty>{nothingFoundMessage}</Combobox.Empty>}
                    </ScrollArea.Autosize>
                </Combobox.Options>
            </Combobox.Dropdown>
        </Combobox>
    );
};
