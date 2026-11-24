'use client';

import React from 'react';
import { Checkbox } from '@mantine/core';
import { HelpButton } from '@/presentation/components/source/HelpButton';

export interface CheckBoxComponentProps {
    setValue: (value: any) => void;
    checkBoxLabel: string;
    explanation: string;
    value: any;
    // o rótulo com elementos (um link, por exemplo); sem ele, o rótulo é o checkBoxLabel, que segue como id e título da ajuda
    labelContent?: React.ReactNode;
}
export const CheckBoxComponent: React.FC<CheckBoxComponentProps> = ({ explanation, setValue, checkBoxLabel, value, labelContent }) => {
    return (
        <div className="mb-4 flex min-w-0 items-start gap-2">
            <HelpButton title={checkBoxLabel} explanation={explanation} />
            <Checkbox id={checkBoxLabel} className="min-w-0" checked={!!value} onChange={(e) => setValue(e.currentTarget.checked)} label={labelContent || checkBoxLabel} />
        </div>
    );
};
