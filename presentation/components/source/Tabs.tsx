'use client';
import React, { useState } from 'react';
import { Tabs as MantineTabs } from '@mantine/core';
import { notify } from '@/presentation/components/source/notify';
import IconInfoTriangle from '@/presentation/icons/icon-info-triangle';
import IconChevron from '@/presentation/icons/icon-chevron';
import IconCircleCheck from '@/presentation/icons/icon-circle-check';

export interface TabsModel {
    // aviso mostrado acima do conteúdo da aba
    title?: string;
    label: string;
    icon?: React.ReactNode;
    // devolve as pendências que impedem de sair da aba (e pode ter efeitos colaterais, como carregar dados)
    onMoveOnFowardTabs?: () => string[];
    // getPendingRequirements não pode ter efeitos colaterais: é chamado a cada renderização para habilitar ou não o botão de avançar
    getPendingRequirements?: () => string[];
    // os campos da aba já mostram cada pendência embaixo de si: o rodapé não repete a lista, só desabilita o avançar
    fieldsShowPendingRequirements?: boolean;
}

export interface TabsProps {
    tabs: TabsModel[];
    lastButtonLabel: string;
    lastButtonIcon?: React.ReactNode;
    firstButtonLabel?: string;
    firstButtonIcon?: React.ReactNode;
    children: React.ReactNode;
    firstButtonClick?: () => void;
    // botões mostrados ao lado do último botão (o de concluir), só na última aba
    lastButtonSiblings?: React.ReactNode;
    // atalho mostrado à esquerda do botão de avançar em todas as abas menos a última (ex.: salvar sem passar pelas
    // demais abas); devolve as pendências, mostradas como as do avançar
    shortcutButton?: TabsShortcutButton;
}

export interface TabsShortcutButton {
    label: string;
    icon?: React.ReactNode;
    onClick: () => string[] | void;
}

/**
 * Abas em sequência (um assistente): cada aba só deixa avançar quando as suas pendências estão resolvidas, e o botão de
 * avançar leva o nome e o ícone da aba seguinte. Na última aba o botão de avançar é o de concluir.
 */
export const Tabs: React.FC<TabsProps> = ({
    firstButtonClick,
    tabs,
    children,
    lastButtonLabel,
    lastButtonIcon = <IconCircleCheck className="h-4 w-4" />,
    firstButtonLabel = '',
    firstButtonIcon = <IconChevron direction="left" className="h-4 w-4" />,
    lastButtonSiblings,
    shortcutButton,
}) => {
    const [activeIndex, setActiveIndex] = useState(0);
    // "Voltar" e "Avançar" (até 2026-11-08 os botões levavam o nome da aba vizinha, o que confundia: "Idiomas" parecia um atalho)
    const previousLabel = activeIndex > 0 ? 'Voltar' : firstButtonLabel;
    const nextLabel = tabs[activeIndex + 1] ? 'Avançar' : lastButtonLabel;
    const previousIcon = activeIndex > 0 ? <IconChevron direction="left" className="h-4 w-4" /> : firstButtonIcon;
    const nextIcon = tabs[activeIndex + 1] ? <IconChevron direction="right" className="h-4 w-4" /> : lastButtonIcon;

    const changeTab = (index: number) => {
        if (index > activeIndex) {
            goToNextTab();
            return;
        }
        setActiveIndex(index);
    };

    const goToPrevious = () => {
        if (activeIndex) {
            setActiveIndex(activeIndex - 1);
            return;
        }
        firstButtonClick && firstButtonClick();
    };

    const tab = tabs[activeIndex];
    const isLastTab = !tabs[activeIndex + 1];
    const pendingRequirements = (tab.getPendingRequirements && tab.getPendingRequirements()) || [];
    const canMoveForward = !pendingRequirements.length;

    // devolve true quando havia pendências (e as mostrou)
    const showErrors = (errors: string[] | void) => {
        if (!errors || !errors.length) {
            return false;
        }
        errors.forEach((detail: string) => notify({ severity: 'error', summary: 'Falha!!!', detail, life: 10000 }));
        return true;
    };

    const goToNextTab = () => {
        const index = activeIndex + 1;
        const hasError = tab.onMoveOnFowardTabs && tab.onMoveOnFowardTabs();

        // quando os campos mostram as pendências, as notificações seriam repetição
        if (tab.fieldsShowPendingRequirements ? hasError && hasError.length : showErrors(hasError)) {
            return;
        }
        const hasNextTab = !!tabs[index];
        setActiveIndex(hasNextTab ? index : activeIndex);
    };

    const panels = React.Children.toArray(children);

    return (
        <div className="panel">
            <MantineTabs value={String(activeIndex)} onChange={(value) => changeTab(Number(value))} keepMounted={false}>
                {/* numa tela estreita as abas rolam na horizontal em vez de quebrar o nome em duas linhas */}
                <MantineTabs.List className="mb-5 flex-nowrap overflow-x-auto">
                    {tabs.map((item, index) => (
                        <MantineTabs.Tab key={index} value={String(index)} leftSection={item.icon} className="whitespace-nowrap font-semibold">
                            {item.label}
                        </MantineTabs.Tab>
                    ))}
                </MantineTabs.List>
            </MantineTabs>

            {tab.title && <p className="mb-5 text-center text-sm text-primary">{`* ${tab.title}`}</p>}

            {panels[activeIndex]}

            <div className="mt-6 border-t border-white-light pt-5 dark:border-[#1b2e4b]">
                {/* as pendências ficam numa caixa acima dos botões (até 2026-11-08 ficavam espremidas ao lado do Avançar) */}
                {!canMoveForward && !tab.fieldsShowPendingRequirements && (
                    <div role="alert" className="mb-4 rounded-md border border-danger/30 bg-danger-light px-4 py-3 text-sm text-danger dark:bg-danger-dark-light">
                        <div className="mb-1 font-semibold">Para continuar, resolva:</div>
                        <ul className="space-y-1">
                            {pendingRequirements.map((requirement: string) => (
                                <li key={requirement} className="flex items-start gap-1.5">
                                    <IconInfoTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                                    <span>{requirement}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    {previousLabel ? (
                        <button onClick={goToPrevious} type="button" className="btn btn-outline-dark shrink-0 gap-2 whitespace-nowrap">
                            {previousIcon}
                            {previousLabel}
                        </button>
                    ) : (
                        <span />
                    )}
                    <div className="hidden sm:block sm:flex-1" />
                    {isLastTab && lastButtonSiblings && <div className="flex shrink-0 gap-3">{lastButtonSiblings}</div>}
                    {!isLastTab && shortcutButton && (
                        <button onClick={() => showErrors(shortcutButton.onClick())} type="button" className="btn btn-success shrink-0 gap-2 whitespace-nowrap">
                            {shortcutButton.icon}
                            {shortcutButton.label}
                        </button>
                    )}
                    {nextLabel && (
                        // o botão fica sempre habilitado: o clique é o que destaca as pendências nos campos (até 2026-11-08 ficava
                        // desabilitado, e numa aba com os erros nos campos nada explicava o porquê)
                        <button onClick={goToNextTab} type="button" className="btn btn-primary shrink-0 gap-2 whitespace-nowrap">
                            {nextIcon}
                            {nextLabel}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
