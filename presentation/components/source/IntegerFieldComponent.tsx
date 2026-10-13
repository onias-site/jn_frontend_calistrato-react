'use client';

import React, { useState } from 'react';
import { Checkbox } from 'primereact/checkbox';
import { InputText } from 'primereact/inputtext';
import { Tooltip } from 'primereact/tooltip';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';

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
export const IntegerFieldComponent: React.FC<IntegerFieldProps> = ({ explanation, setValue, defaultValue, minValue, textFieldLabel, checkBoxLabel, value, maxValue }) => {
    const isInvalid = () => {
        if (value < (minValue ?? defaultValue)) {
            return true;
        }

        if (value > maxValue) {
            return true;
        }

        return false;
    };
    const [visible, setVisible] = useState(false);
    return (
        // a partir do sm, duas colunas de largura igual (checkbox | campo numérico): como todas as linhas do formulário
        // usam a mesma grade, os campos de linhas diferentes ficam alinhados um embaixo do outro, e os textos quebram
        // dentro da sua coluna. No celular o campo desce para a linha de baixo, em vez de espremer os dois
        <div className="mb-5 flex flex-wrap items-center gap-x-8 gap-y-3 sm:grid sm:grid-cols-2">
            <Dialog
                header={checkBoxLabel}
                visible={visible}
                style={{ width: '50vw' }}
                breakpoints={{ '960px': '75vw', '641px': '95vw' }}
                onHide={() => {
                    if (!visible) return;
                    setVisible(false);
                }}
            >
                <p className="m-0">{explanation}</p>
            </Dialog>

            <div className="flex min-w-0 items-center gap-2">
                <Tooltip target="#btnHelp" content="Clique aqui para saber mais detalhes sobre este campo" position="bottom" />
                <Button icon="pi pi-question-circle" id="btnHelp" className="shrink-0" onClick={() => setVisible(true)} />
                <Checkbox className="shrink-0" onChange={(e) => (e.checked ? setValue(0) : setValue(defaultValue))} checked={value == 0} />
                <label onClick={() => (value != 0 ? setValue(0) : setValue(defaultValue))} className="letraPequena min-w-0" style={{ maxWidth: '300px' }}>
                    {checkBoxLabel}
                </label>
            </div>

            {value != 0 && (
                <div className="flex min-w-0 items-center gap-2">
                    {/* o rótulo ocupa o que sobra da coluna: o campo fica na borda direita, alinhado entre as linhas */}
                    <label htmlFor={textFieldLabel} className="letraPequena min-w-0 flex-1" style={{ color: isInvalid() ? '#e24c4c' : 'black' }}>
                        {textFieldLabel}
                    </label>
                    <InputText id={textFieldLabel} className="shrink-0" keyfilter="pint" invalid={isInvalid()} value={value} onChange={(e) => setValue(e.target.value)} style={{ width: '100px' }} />
                </div>
            )}
        </div>
    );
};
