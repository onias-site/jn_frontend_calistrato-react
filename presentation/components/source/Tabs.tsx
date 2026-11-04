'use client';
import React, { useState } from 'react';
import { Tabs as MantineTabs } from '@mantine/core';
import { notify } from '@/presentation/components/source/notify';
import IconInfoTriangle from '@/presentation/icons/icon-info-triangle';
import IconArrowLeft from '@/presentation/icons/icon-arrow-left';
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
    firstButtonIcon = <IconArrowLeft className="h-4 w-4" />,
    lastButtonSiblings,
    shortcutButton,
}) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const previousLabel = activeIndex > 0 ? tabs[activeIndex - 1].label : firstButtonLabel;
    const nextLabel = (tabs[activeIndex + 1] && tabs[activeIndex + 1].label) || lastButtonLabel;
    const previousIcon = activeIndex > 0 ? tabs[activeIndex - 1].icon : firstButtonIcon;
    const nextIcon = (tabs[activeIndex + 1] && tabs[activeIndex + 1].icon) || lastButtonIcon;

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

        if (showErrors(hasError)) {
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
                {/* numa tela estreita as pendências sobem para uma linha só delas, acima dos botões */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    {previousLabel ? (
                        <button onClick={goToPrevious} type="button" className="btn btn-outline-danger shrink-0 gap-2 whitespace-nowrap">
                            {previousIcon}
                            {previousLabel}
                        </button>
                    ) : (
                        <span />
                    )}
                    <div className="order-first w-full min-w-0 text-sm text-danger sm:order-none sm:w-auto sm:flex-1 sm:text-right">
                        {!canMoveForward &&
                            pendingRequirements.map((requirement: string) => (
                                <div key={requirement} className="flex items-center justify-end gap-1.5">
                                    <IconInfoTriangle className="h-4 w-4 shrink-0" />
                                    <span>{requirement}</span>
                                </div>
                            ))}
                    </div>
                    {isLastTab && lastButtonSiblings && <div className="flex shrink-0 gap-3">{lastButtonSiblings}</div>}
                    {!isLastTab && shortcutButton && (
                        <button onClick={() => showErrors(shortcutButton.onClick())} type="button" className="btn btn-success shrink-0 gap-2 whitespace-nowrap">
                            {shortcutButton.icon}
                            {shortcutButton.label}
                        </button>
                    )}
                    {nextLabel && (
                        <span title={canMoveForward ? undefined : 'Resolva as pendências para continuar'} className="shrink-0">
                            <button onClick={goToNextTab} disabled={!canMoveForward} type="button" className="btn btn-primary gap-2 whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-60">
                                {nextIcon}
                                {nextLabel}
                            </button>
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};
