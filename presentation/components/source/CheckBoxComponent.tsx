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
        <div className="mb-5 text-center">
            <Dialog
                header={checkBoxLabel}
                visible={visible}
                style={{ width: '50vw' }}
                onHide={() => {
                    if (!visible) return;
                    setVisible(false);
                }}
            >
                <p className="m-0">{explanation}</p>
            </Dialog>
            <div className="align-items-center flex">
                <Tooltip target="#btnHelp" content="Clique aqui para saber mais detalhes sobre este campo" position="bottom" />
                <Button icon="pi pi-question-circle" id="btnHelp" onClick={() => setVisible(true)} />
                <Checkbox checked={value} onChange={(e) => setValue(e.checked)} />
                <label htmlFor="ingredient3" className="letraPequena">
                    {checkBoxLabel}
                </label>
            </div>
        </div>
    );
};
