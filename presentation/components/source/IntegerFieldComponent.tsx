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
 * Um checkbox que, desmarcado, mostra um campo numérico logo abaixo, recuado na linha do texto do checkbox (até 2026-11-08
 * o campo ficava à direita, numa segunda coluna, e parecia de outra pergunta). Marcado, o valor é 0 ("não se aplica");
 * desmarcado, volta ao valor padrão.
 */
export const IntegerFieldComponent: React.FC<IntegerFieldProps> = ({ explanation, setValue, defaultValue, minValue, textFieldLabel, checkBoxLabel, value, maxValue }) => {
    const min = minValue ?? defaultValue;
    const isInvalid = () => value < min || value > maxValue;
    const checked = value == 0;

    return (
        <div className="mb-4">
            <div className="flex min-w-0 items-start gap-2">
                <HelpButton title={checkBoxLabel} explanation={explanation} />
                <Checkbox className="min-w-0" checked={checked} onChange={(e) => (e.currentTarget.checked ? setValue(0) : setValue(defaultValue))} label={checkBoxLabel} />
            </div>

            {!checked && (
                // o recuo alinha o campo com o texto do checkbox (botão de ajuda + caixa + espaços)
                <div className="mt-2 pl-[3.75rem]">
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
                        classNames={{ root: 'max-w-xs', label: 'font-semibold text-dark dark:text-white-light' }}
                    />
                </div>
            )}
        </div>
    );
};
