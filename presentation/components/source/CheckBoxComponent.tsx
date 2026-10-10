'use client';

import React, { useState } from 'react';
import { Checkbox } from 'primereact/checkbox';
import { Tooltip } from 'primereact/tooltip';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';

export interface CheckBoxComponentProps {
    setValue: (value: any) => void;
    checkBoxLabel: string;
    explanation: string;
    value: any;
}
export const CheckBoxComponent: React.FC<CheckBoxComponentProps> = ({ explanation, setValue, checkBoxLabel, value }) => {
    const [visible, setVisible] = useState(false);
    return (
        <div className="mb-5 min-w-0">
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
            {/* o botão e o checkbox não encolhem; o texto quebra em linhas em vez de empurrar a tela para o lado */}
            <div className="flex items-center gap-2">
                <Tooltip target="#btnHelp" content="Clique aqui para saber mais detalhes sobre este campo" position="bottom" />
                <Button icon="pi pi-question-circle" id="btnHelp" className="shrink-0" onClick={() => setVisible(true)} />
                <Checkbox id={checkBoxLabel} className="shrink-0" checked={value} onChange={(e) => setValue(e.checked)} />
                <label htmlFor={checkBoxLabel} className="letraPequena min-w-0" style={{ maxWidth: '300px' }} onClick={() => setValue(!value)}>
                    {checkBoxLabel}
                </label>
            </div>
        </div>
    );
};
