'use client';
import React from 'react';
import { Modal } from '@mantine/core';
import IconInfoTriangle from '@/presentation/icons/icon-info-triangle';
import IconHelpCircle from '@/presentation/icons/icon-help-circle';

export interface ConfirmModalProps {
    visible: boolean;
    onHide: () => void;
    header: string;
    message: React.ReactNode;
    acceptLabel?: string;
    rejectLabel?: string;
    accept: () => void;
    reject?: () => void;
    // ação destrutiva (excluir, desistir): o botão de confirmar fica vermelho e o ícone é o de alerta
    danger?: boolean;
}

/** Pergunta de sim ou não antes de uma ação. Fechar pelo X ou pelo Esc vale como "não". */
export const ConfirmModal: React.FC<ConfirmModalProps> = ({ visible, onHide, header, message, acceptLabel = 'Sim', rejectLabel = 'Não', accept, reject, danger = false }) => {
    const close = () => {
        reject && reject();
        onHide();
    };
    return (
        <Modal opened={visible} onClose={close} title={header} size="md">
            <div className="flex items-start gap-3">
                <span className={`mt-0.5 shrink-0 ${danger ? 'text-danger' : 'text-primary'}`}>
                    {danger ? <IconInfoTriangle className="h-7 w-7" /> : <IconHelpCircle className="h-7 w-7" />}
                </span>
                <div className="leading-relaxed">{message}</div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
                <button type="button" className="btn btn-outline-dark" onClick={close}>
                    {rejectLabel}
                </button>
                <button
                    type="button"
                    className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
                    onClick={() => {
                        onHide();
                        accept();
                    }}
                >
                    {acceptLabel}
                </button>
            </div>
        </Modal>
    );
};
