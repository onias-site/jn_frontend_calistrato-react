'use client';

import React, { useState } from 'react';
import { Tooltip } from 'primereact/tooltip';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
// o ícone do botão de ajuda (pi-question-circle) vem desta fonte; sem o import aqui, ele some nas páginas que não a
// importam por conta própria (o modal de login, por exemplo, abre em qualquer página)
import 'primeicons/primeicons.css';

export interface LabelComponentProps {
    children: React.ReactNode;
    explanation: string;
    labelValue: string;
    property: string;

    errors: any;
    // rótulo à esquerda numa coluna de largura fixa e campo à direita, com fonte menor: em linhas seguidas, os rótulos
    // ficam alinhados uns abaixo dos outros e os campos também (formulários como os do modal de login)
    stacked?: boolean;
}
export const LabelComponent: React.FC<LabelComponentProps> = ({ children, labelValue, property, errors, explanation, stacked }) => {
    const color = errors[property] ? '#e24c4c' : 'black';
    const [visible, setVisible] = useState(false);
    if (stacked) {
        return (
            <div className="mb-4 flex items-center gap-3 text-left">
                <Dialog header={labelValue} visible={visible} style={{ width: '50vw' }} onHide={() => setVisible(false)}>
                    <p className="m-0">{explanation}</p>
                </Dialog>
                <div className="flex w-44 shrink-0 items-center gap-1">
                    <label htmlFor={property} style={{ color }} className="text-xs font-normal leading-tight">
                        {labelValue}
                    </label>
                    <Tooltip target="#btnHelp" content="Clique aqui para saber mais detalhes sobre este campo" position="bottom" />
                    <Button
                        icon="pi pi-question-circle"
                        id="btnHelp"
                        text
                        rounded
                        className="h-6 w-6 shrink-0 p-0"
                        onClick={(e) => {
                            e && e.preventDefault && e.preventDefault();
                            setVisible(true);
                        }}
                    />
                </div>
                <div className="min-w-0 flex-1">{children}</div>
            </div>
        );
    }
    return (
        <div className="mb-5 text-center">
            <Dialog
                header={labelValue}
                visible={visible}
                style={{ width: '50vw' }}
                onHide={() => {
                    if (!visible) return;
                    setVisible(false);
                }}
            >
                <p className="m-0">{explanation}</p>
            </Dialog>
            <div className="flex-column flex">
                <Tooltip target="#btnHelp" content="Clique aqui para saber mais detalhes sobre este campo" position="bottom" />
                <Button
                    icon="pi pi-question-circle"
                    id="btnHelp"
                    // sem isso, um campo de largura total ao lado espreme o botão até sumir
                    className="shrink-0"
                    onClick={(e) => {
                        e && e.preventDefault && e.preventDefault()
                        setVisible(true);
                    }}
                />
                <label htmlFor={property} style={{ width: '25%', color }} className="letraPequena">
                    {labelValue}
                </label>
                {children}
            </div>
        </div>
    );
};
