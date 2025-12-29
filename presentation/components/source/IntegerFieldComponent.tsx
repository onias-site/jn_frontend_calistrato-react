'use client';

import React from 'react';
import { Checkbox } from 'primereact/checkbox';
import { InputText } from 'primereact/inputtext';


export interface IntegerFieldProps {
    setValue: (value: any) => void;
    textFieldLabel: string;
    checkBoxLabel: string;
    defaultValue: number;
    value: any;
}
export const IntegerFieldComponent: React.FC<IntegerFieldProps> = ({ setValue, defaultValue, textFieldLabel, checkBoxLabel, value }) => {
    return (
        <div className="flex flex-row gap-8">
            <div className="mb-5 text-center">
                <div className="align-items-center flex">
                    <Checkbox onChange={(e) => (e.checked ? setValue(0) : setValue(defaultValue))} checked={value <= 0} />
                    <label htmlFor="ingredient3" className="letraPequena ml-2">
                        {checkBoxLabel}
                    </label>
                </div>
            </div>

            <div className="mb-5 text-center">&nbsp;</div>
            <div className="mb-5 text-center">&nbsp;</div>

            {value > 0 && (
                <div className="mb-5 text-center">
                    <div className="align-items-center flex">
                        <label htmlFor="ingredient3" className="letraPequena ml-2">
                            {textFieldLabel}
                        </label>
                        <InputText value={value} onChange={(e) => setValue(e.target.value)} />
                    </div>
                </div>
            )}
        </div>
    );
};
