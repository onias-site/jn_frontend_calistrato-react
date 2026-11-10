'use client';
import React from 'react';
import { Modal as MantineModal, MantineSize } from '@mantine/core';

export interface ModalProps {
    setVisible: (visible: boolean) => void;
    children: React.ReactNode;
    visible: boolean;
    title: string;
    size?: MantineSize | string | number;
    // o modal de login passa false: um clique acidental fora dele perdia a tela (R08-1)
    closeOnClickOutside?: boolean;
}

/** O modal padrão das telas: fecha pelo X, pelo Esc e pelo clique fora (este último pode ser desligado). */
export const Modal: React.FC<ModalProps> = ({ children, visible, title, setVisible, size = 'lg', closeOnClickOutside = true }) => {
    return (
        <MantineModal opened={visible} onClose={() => visible && setVisible(false)} title={title} size={size} closeOnClickOutside={closeOnClickOutside}>
            {children}
        </MantineModal>
    );
};
