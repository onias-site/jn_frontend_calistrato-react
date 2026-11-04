'use client';

import React from 'react';
import { HelpButton } from '@/presentation/components/source/HelpButton';

export interface LabelComponentProps {
    children: React.ReactNode;
    explanation: string;
    labelValue: string;
    property: string;
    errors: any;
    // mantido por compatibilidade: hoje todos os rótulos usam a mesma grade
    stacked?: boolean;
}

/**
 * Rótulo com botão de ajuda e o campo ao lado: no celular o rótulo fica acima do campo; a partir do md, rótulo numa coluna
 * de um terço e o campo nos dois terços restantes, de modo que os campos de linhas seguidas fiquem alinhados.
 */
export const LabelComponent: React.FC<LabelComponentProps> = ({ children, labelValue, property, errors, explanation }) => {
    const invalid = !!errors[property];
    return (
        <div className="mb-5 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:items-start md:gap-4">
            <div className="mb-1.5 flex items-start gap-1.5 md:mb-0 md:pt-2">
                {labelValue && (
                    <label htmlFor={property} className={`mb-0 font-semibold leading-snug ${invalid ? 'text-danger' : 'text-dark dark:text-white-light'}`}>
                        {labelValue}
                    </label>
                )}
                {explanation && <HelpButton title={labelValue || 'Ajuda'} explanation={explanation} />}
            </div>
            <div className="min-w-0">{children}</div>
        </div>
    );
};
