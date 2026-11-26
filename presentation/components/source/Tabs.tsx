'use client';
import React, { useState } from 'react';
import { Loader, Tabs as MantineTabs } from '@mantine/core';
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
    // a aba ainda carrega o seu conteúdo (desde 2026-11-23): fica desabilitada, com um spinner no lugar do ícone
    loading?: boolean;
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
    // cada mudança deste valor leva de volta à primeira aba (ex.: depois de salvar)
    resetSignal?: number;
    // cada objeto novo leva à aba do índice dado (ex.: à aba que aparece depois de salvar); com showErrors (desde
    // 2026-11-25), a aba abre já com as pendências à vista e o foco no primeiro campo em erro (ou, sem campo marcado, na
    // caixa das pendências)
    goToTab?: { index: number; showErrors?: boolean };
    // atalho mostrado à esquerda do botão de avançar em todas as abas menos a última (ex.: salvar sem passar pelas
    // demais abas); devolve as pendências, mostradas como as do avançar
    shortcutButton?: TabsShortcutButton;
    // o avançar espera um processamento (desde 2026-11-23, a leitura das habilidades da descrição da vaga): fica
    // desabilitado e girando, e as abas seguintes não abrem
    forwardLoading?: boolean;
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
    resetSignal = 0,
    goToTab,
    forwardLoading = false,
}) => {
    const [activeIndex, setActiveIndex] = useState(0);
    // a caixa de pendências só aparece depois de o usuário tentar avançar ou salvar nesta aba: a aba não abre já em erro
    const [attempted, setAttempted] = useState(false);
    const goTo = (index: number) => {
        setAttempted(false);
        setActiveIndex(index);
    };
    React.useEffect(() => {
        resetSignal && goTo(0);
    }, [resetSignal]);
    const focusTheError = React.useRef(false);
    React.useEffect(() => {
        if (!goToTab || !tabs[goToTab.index]) return;
        goTo(goToTab.index);
        if (!goToTab.showErrors) return;
        setAttempted(true);
        focusTheError.current = true;
    }, [goToTab]);
    // a aba nova abre do começo: sem isto, quem avança pelo botão do fim da aba (num modal ou numa página com rolagem)
    // cai no fim da aba seguinte e não vê o que fica no topo dela (ex.: a contagem de currículos da aba Opções da vaga)
    const top = React.useRef<HTMLDivElement>(null);
    const firstRender = React.useRef(true);
    React.useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }
        top.current && top.current.scrollIntoView({ block: 'start' });
    }, [activeIndex]);
    // depois de a aba com o erro aparecer (e de o topo dela rolar para a vista): o campo em erro, ou a caixa das pendências
    React.useEffect(() => {
        if (!focusTheError.current) return;
        // a cada renderização o temporizador recomeça: o foco vai quando a aba para de mudar
        const timer = setTimeout(() => {
            focusTheError.current = false;
            const area = top.current;
            if (!area) return;
            const field = area.querySelector<HTMLElement>('[aria-invalid="true"]');
            if (field) {
                field.scrollIntoView({ block: 'center' });
                field.focus({ preventScroll: true });
                return;
            }
            const box = area.querySelector<HTMLElement>('[role="alert"]');
            box && box.scrollIntoView({ block: 'center' });
        }, 50);
        return () => clearTimeout(timer);
    });
    // "Voltar" e "Avançar" (até 2026-11-08 os botões levavam o nome da aba vizinha, o que confundia: "Idiomas" parecia um atalho)
    const previousLabel = activeIndex > 0 ? 'Voltar' : firstButtonLabel;
    const nextLabel = tabs[activeIndex + 1] ? 'Avançar' : lastButtonLabel;
    const previousIcon = activeIndex > 0 ? <IconChevron direction="left" className="h-4 w-4" /> : firstButtonIcon;
    const nextIcon = tabs[activeIndex + 1] ? <IconChevron direction="right" className="h-4 w-4" /> : lastButtonIcon;

    const changeTab = (index: number) => {
        if (tabs[index] && tabs[index].loading) return;
        if (index > activeIndex && forwardLoading) return;
        if (index > activeIndex) {
            goToNextTab();
            return;
        }
        goTo(index);
    };

    const goToPrevious = () => {
        if (activeIndex) {
            goTo(activeIndex - 1);
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
        setAttempted(true);
        const hasError = tab.onMoveOnFowardTabs && tab.onMoveOnFowardTabs();

        // quando os campos mostram as pendências, as notificações seriam repetição
        if (tab.fieldsShowPendingRequirements ? hasError && hasError.length : showErrors(hasError)) {
            return;
        }
        const hasNextTab = !!tabs[index];
        hasNextTab && goTo(index);
    };

    const panels = React.Children.toArray(children);

    return (
        // scroll-mt: o cabeçalho fixo do modal não cobre a barra das abas
        <div className="panel scroll-mt-24" ref={top}>
            <MantineTabs value={String(activeIndex)} onChange={(value) => changeTab(Number(value))} keepMounted={false}>
                {/* numa tela estreita as abas rolam na horizontal em vez de quebrar o nome em duas linhas */}
                <MantineTabs.List className="mb-5 flex-nowrap overflow-x-auto">
                    {tabs.map((item, index) => (
                        <MantineTabs.Tab
                            key={index}
                            value={String(index)}
                            leftSection={item.loading ? <Loader size={14} /> : item.icon}
                            disabled={!!item.loading}
                            aria-busy={!!item.loading}
                            className="whitespace-nowrap font-semibold"
                        >
                            {item.label}
                        </MantineTabs.Tab>
                    ))}
                </MantineTabs.List>
            </MantineTabs>

            {tab.title && <p className="mb-5 text-center text-sm text-primary">{`* ${tab.title}`}</p>}

            {panels[activeIndex]}

            <div className="mt-6 border-t border-white-light pt-5 dark:border-[#1b2e4b]">
                {/* as pendências ficam numa caixa acima dos botões (até 2026-11-08 ficavam espremidas ao lado do Avançar) */}
                {attempted && !canMoveForward && !tab.fieldsShowPendingRequirements && (
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
                        <button
                            onClick={() => {
                                setAttempted(true);
                                showErrors(shortcutButton.onClick());
                            }}
                            type="button"
                            className="btn btn-success shrink-0 gap-2 whitespace-nowrap"
                        >
                            {shortcutButton.icon}
                            {shortcutButton.label}
                        </button>
                    )}
                    {nextLabel && (
                        // o botão fica sempre habilitado: o clique é o que destaca as pendências nos campos (até 2026-11-08 ficava
                        // desabilitado, e numa aba com os erros nos campos nada explicava o porquê)
                        // (a exceção é a espera de um processamento, forwardLoading: desabilitado e girando)
                        <button
                            onClick={goToNextTab}
                            type="button"
                            disabled={forwardLoading}
                            aria-busy={forwardLoading}
                            className="btn btn-primary shrink-0 gap-2 whitespace-nowrap disabled:cursor-wait disabled:opacity-70"
                        >
                            {forwardLoading ? <Loader size={16} color="white" /> : nextIcon}
                            {nextLabel}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
