'use client';
import React, { useState } from 'react';
import { ActionIcon, Modal, Tooltip } from '@mantine/core';
import IconHelpCircle from '@/presentation/icons/icon-help-circle';

export interface HelpButtonProps {
    // título do modal de ajuda (em geral o rótulo do campo)
    title: string;
    explanation: React.ReactNode;
    tooltip?: string;
    size?: number;
}

/** O botão "?" ao lado de um rótulo: mostra uma dica ao passar o mouse e abre um modal com a explicação ao clicar. */
export const HelpButton: React.FC<HelpButtonProps> = ({ title, explanation, tooltip = 'Clique aqui para saber mais detalhes sobre este campo', size = 18 }) => {
    const [opened, setOpened] = useState(false);
    return (
        <>
            <Modal opened={opened} onClose={() => setOpened(false)} title={title} size="lg">
                <div className="whitespace-pre-line leading-relaxed">{explanation}</div>
            </Modal>
            <Tooltip label={tooltip} position="bottom">
                <ActionIcon
                    variant="subtle"
                    color="primary"
                    radius="xl"
                    size="sm"
                    aria-label={tooltip}
                    className="shrink-0"
                    onClick={(e: React.MouseEvent) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setOpened(true);
                    }}
                >
                    <span style={{ width: size, height: size }} className="flex items-center justify-center [&>svg]:h-full [&>svg]:w-full">
                        <IconHelpCircle />
                    </span>
                </ActionIcon>
            </Tooltip>
        </>
    );
};
