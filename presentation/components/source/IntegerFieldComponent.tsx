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
    maxValue: number;
    value: any;
    explanation: string;
}
export const IntegerFieldComponent: React.FC<IntegerFieldProps> = ({ explanation, setValue, defaultValue, textFieldLabel, checkBoxLabel, value, maxValue }) => {
    const isInvalid = () => {
        if (value < defaultValue) {
            return true;
        }

        if (value > maxValue) {
            return true;
        }

        return false;
    };
    const [visible, setVisible] = useState(false);
    return (
        <div className="flex flex-row gap-8">
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

            <div className="mb-5 text-center">
                <div className="align-items-center flex">
                    <Tooltip target="#btnHelp" content="Clique aqui para saber mais detalhes sobre este campo" position="bottom" />
                    <Button icon="pi pi-question-circle" id="btnHelp" onClick={() => setVisible(true)} />
                    <Checkbox onChange={(e) => (e.checked ? setValue(0) : setValue(defaultValue))} checked={value == 0} />
                    <label className="letraPequena ml-2">{checkBoxLabel}</label>
                </div>
            </div>

            <div className="mb-5 text-center">&nbsp;</div>
            <div className="mb-5 text-center">&nbsp;</div>

            {value != 0 && (
                <div className="mb-5 text-center">
                    <div className="align-items-center flex">
                        <label htmlFor="ingredient3" className="letraPequena ml-2" style={{ width: '300px', color: isInvalid() ? '#e24c4c' : 'black' }}>
                            {textFieldLabel}
                        </label>
                        <InputText keyfilter="pint" invalid={isInvalid()} value={value} onChange={(e) => setValue(e.target.value)} style={{ width: '100px' }} />
                    </div>
                </div>
            )}
        </div>
    );
};
