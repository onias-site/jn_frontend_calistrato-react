'use client';

import React from 'react';
import { HelpButton } from '@/presentation/components/source/HelpButton';
import IconInfoTriangle from '@/presentation/icons/icon-info-triangle';

export interface LabelComponentProps {
    children: React.ReactNode;
    explanation: string;
    labelValue: string;
    property: string;
    errors: any;
    // rótulo acima do campo em qualquer largura (formulários estreitos, como os do modal de login); sem ele, a partir do
    // md o rótulo fica numa coluna à esquerda do campo
    stacked?: boolean;
}

/**
 * Rótulo com botão de ajuda e o campo ao lado: no celular o rótulo fica acima do campo; a partir do md, rótulo numa coluna
 * de um terço e o campo nos dois terços restantes, de modo que os campos de linhas seguidas fiquem alinhados.
 */
export const LabelComponent: React.FC<LabelComponentProps> = ({ children, labelValue, property, errors, explanation, stacked = false }) => {
    const invalid = !!errors[property];
    // errors[property] pode ser só true (destaca o campo) ou a mensagem (destaca e explica embaixo do campo)
    const message = typeof errors[property] == 'string' ? errors[property] : '';
    const grid = stacked ? '' : 'md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:items-start md:gap-4';
    const labelRow = stacked ? '' : 'md:mb-0 md:pt-2';
    return (
        <div className={`mb-5 ${grid}`}>
            <div className={`mb-1.5 flex items-start gap-1.5 ${labelRow}`}>
                {labelValue && (
                    <label htmlFor={property} className={`mb-0 font-semibold leading-snug ${invalid ? 'text-danger' : 'text-dark dark:text-white-light'}`}>
                        {labelValue}
                    </label>
                )}
                {explanation && <HelpButton title={labelValue || 'Ajuda'} explanation={explanation} />}
            </div>
            <div className="min-w-0">
                {children}
                {message && (
                    <div role="alert" className="mt-1.5 flex items-start gap-1.5 text-sm text-danger">
                        <IconInfoTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{message}</span>
                    </div>
                )}
            </div>
        </div>
    );
};
