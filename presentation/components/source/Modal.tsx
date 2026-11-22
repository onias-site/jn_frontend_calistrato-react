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
    // o Mantine fecha pelo Esc todos os modais abertos, não só o de cima: o da vaga passa false, para o Esc num modal
    // aberto de dentro dele (sugestão de habilidade, ajuste de hierarquia, login) não fechá-lo junto e perder o formulário
    closeOnEscape?: boolean;
    // a camada do modal; o padrão do Mantine é 200. O de login passa uma acima: aberto de dentro de outro modal (o link
    // "Ver quais são estes currículos" do modal da vaga), ficava por trás dele, que foi montado depois
    zIndex?: number;
}

/** O modal padrão das telas: fecha pelo X, pelo Esc e pelo clique fora (estes dois últimos podem ser desligados). */
export const Modal: React.FC<ModalProps> = ({ children, visible, title, setVisible, size = 'lg', closeOnClickOutside = true, closeOnEscape = true, zIndex }) => {
    return (
        <MantineModal
            opened={visible}
            onClose={() => visible && setVisible(false)}
            title={title}
            size={size}
            closeOnClickOutside={closeOnClickOutside}
            closeOnEscape={closeOnEscape}
            zIndex={zIndex}
        >
            {children}
        </MantineModal>
    );
};
