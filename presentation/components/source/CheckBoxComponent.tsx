'use client';

import React from 'react';
import { Checkbox } from '@mantine/core';
import { HelpButton } from '@/presentation/components/source/HelpButton';

export interface CheckBoxComponentProps {
    setValue: (value: any) => void;
    checkBoxLabel: string;
    explanation: string;
    value: any;
}
export const CheckBoxComponent: React.FC<CheckBoxComponentProps> = ({ explanation, setValue, checkBoxLabel, value }) => {
    return (
        <div className="mb-4 flex min-w-0 items-start gap-2">
            <HelpButton title={checkBoxLabel} explanation={explanation} />
            <Checkbox id={checkBoxLabel} className="min-w-0" checked={!!value} onChange={(e) => setValue(e.currentTarget.checked)} label={checkBoxLabel} />
        </div>
    );
};
