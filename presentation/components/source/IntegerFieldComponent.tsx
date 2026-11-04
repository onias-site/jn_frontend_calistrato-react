'use client';

import React from 'react';
import { Checkbox, NumberInput } from '@mantine/core';
import { HelpButton } from '@/presentation/components/source/HelpButton';

export interface IntegerFieldProps {
    setValue: (value: any) => void;
    textFieldLabel: string;
    checkBoxLabel: string;
    defaultValue: number;
    // menor valor aceito; sem ele, o próprio valor padrão é o mínimo
    minValue?: number;
    maxValue: number;
    value: any;
    explanation: string;
}

/**
 * Um checkbox que, desmarcado, mostra um campo numérico ao lado (ou abaixo, no celular). Marcado, o valor é 0 ("não se
 * aplica"); desmarcado, volta ao valor padrão.
 */
export const IntegerFieldComponent: React.FC<IntegerFieldProps> = ({ explanation, setValue, defaultValue, minValue, textFieldLabel, checkBoxLabel, value, maxValue }) => {
    const min = minValue ?? defaultValue;
    const isInvalid = () => value < min || value > maxValue;
    const checked = value == 0;

    return (
        <div className="mb-4 grid gap-x-8 gap-y-3 sm:grid-cols-2 sm:items-start">
            <div className="flex min-w-0 items-start gap-2">
                <HelpButton title={checkBoxLabel} explanation={explanation} />
                <Checkbox className="min-w-0" checked={checked} onChange={(e) => (e.currentTarget.checked ? setValue(0) : setValue(defaultValue))} label={checkBoxLabel} />
            </div>

            {!checked && (
                <NumberInput
                    id={textFieldLabel}
                    label={textFieldLabel}
                    value={value}
                    min={min}
                    max={maxValue}
                    allowDecimal={false}
                    allowNegative={false}
                    error={isInvalid() ? `Informe um valor entre ${min} e ${maxValue}` : undefined}
                    onChange={(newValue) => setValue(newValue === '' ? '' : Number(newValue))}
                    classNames={{ label: 'font-semibold text-dark dark:text-white-light' }}
                />
            )}
        </div>
    );
};
