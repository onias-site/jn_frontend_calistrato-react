'use client';
import React from 'react';
import { Modal as MantineModal, MantineSize } from '@mantine/core';

export interface ModalProps {
    setVisible: (visible: boolean) => void;
    children: React.ReactNode;
    visible: boolean;
    title: string;
    size?: MantineSize | string | number;
}

/** O modal padrão das telas: fecha pelo X, pelo Esc e pelo clique fora. */
export const Modal: React.FC<ModalProps> = ({ children, visible, title, setVisible, size = 'lg' }) => {
    return (
        <MantineModal opened={visible} onClose={() => visible && setVisible(false)} title={title} size={size}>
            {children}
        </MantineModal>
    );
};
