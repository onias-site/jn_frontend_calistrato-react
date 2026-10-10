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
}
export const LabelComponent: React.FC<LabelComponentProps> = ({ children, labelValue, property, errors, explanation }) => {
    const color = errors[property] ? '#e24c4c' : 'black';
    const [visible, setVisible] = useState(false);
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
