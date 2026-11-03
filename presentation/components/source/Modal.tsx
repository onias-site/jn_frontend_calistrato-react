'use client';
import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';

// largura do diálogo por largura máxima da tela (breakpoints do PrimeReact): quase a tela toda no celular, 3/4 no tablet
export const dialogBreakpoints = { '960px': '75vw', '640px': '92vw' };

export interface ModalProps {
    setVisible: (visible: boolean) => void;
    children: React.ReactNode;
    visible: boolean;
    title: string;
}

export const Modal: React.FC<ModalProps> = ({children, visible, title, setVisible }) => {

    return (
        // 50vw só em tela larga: num celular de 360 px dava 180 px, e o modal de login espremia o rótulo e o campo
        <Dialog header={title} visible={visible} style={{ width: '50vw' }} breakpoints={dialogBreakpoints} onHide={() => visible && setVisible(false)}>
            {children}
        </Dialog>
    );

}

