'use client';
import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';

export interface ModalProps {
    setVisible: (visible: boolean) => void;
    children: React.ReactNode;
    visible: boolean;
    title: string;
}

export const Modal: React.FC<ModalProps> = ({children, visible, title, setVisible }) => {

    return (
        <Dialog header={title} visible={visible} style={{ width: '50vw' }} onHide={() => visible && setVisible(false)}>
            {children}
        </Dialog>
    );

}

