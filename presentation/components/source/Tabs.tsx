import React, { useState, useRef } from 'react';
import { TabMenu } from 'primereact/tabmenu';
import PanelCodeHighlight from '@/presentation/utils/panel-code-highlight';
import { Toast } from 'primereact/toast';

export class TabsModel {
    // getPendingRequirements não pode ter efeitos colaterais: é chamado a cada renderização para habilitar ou não o botão de avançar
    constructor(
        public title: string = '',
        public label: string,
        public icon: string,
        public onMoveOnFowardTabs: () => string[] = () => [],
        public getPendingRequirements: () => string[] = () => [],
    ) {}
}

export interface TabsProps {
    tabs: TabsModel[];
    lastButtonLabel: string;
    lastButtonIcon?: string;
    firstButtonLabel: string;
    firstButtonIcon?: string;
    children: React.ReactNode;
    firstButtonClick: () => void;
}

export const Tabs: React.FC<TabsProps> = ({ firstButtonClick, tabs, children, lastButtonLabel, lastButtonIcon = 'pi pi-check', firstButtonLabel, firstButtonIcon = 'pi pi-arrow-left' }) => {
    const toast = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const previousLabel = activeIndex > 0 ? tabs[activeIndex - 1].label : firstButtonLabel;
    const nextLabel = (tabs[activeIndex + 1] && tabs[activeIndex + 1].label) || lastButtonLabel;
    // cada botão mostra o ícone da aba para onde leva, o mesmo do menu de abas
    const previousIcon = activeIndex > 0 ? tabs[activeIndex - 1].icon : firstButtonIcon;
    const nextIcon = (tabs[activeIndex + 1] && tabs[activeIndex + 1].icon) || lastButtonIcon;

    const changeTab = (index: any) => {
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
    const pendingRequirements = (tab.getPendingRequirements && tab.getPendingRequirements()) || [];
    const canMoveForward = !pendingRequirements.length;

    const goToNextTab = () => {
        const index = activeIndex + 1;
        const hasError = tab.onMoveOnFowardTabs && tab.onMoveOnFowardTabs();

        if (hasError && hasError.length) {
            for(let item in hasError){
                const detail = hasError[item];
                toast.current.show({ severity: 'error', summary: 'Falha!!!', detail, life: 10000 });
            }
            return;
        }
        const hasNextTab = !!tabs[index];
        setActiveIndex(hasNextTab ? index : activeIndex);
    };
    return (
        <PanelCodeHighlight title = {!tab.title? '' : '* ' + tab.title} cssClassTitle = 'tituloDaAba'>
            <Toast ref={toast} />
            <TabMenu model={tabs} activeIndex={activeIndex} onTabChange={(e) => changeTab(e.index)} />
            {children[activeIndex]}
            <div className="mb-5">
                {/* botões do tamanho do texto, sem quebrar linha; numa tela estreita as pendências sobem para uma linha só delas,
                    acima dos botões, em vez de espremer tudo numa linha */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    {previousLabel ? (
                        <button onClick={() => goToPrevious()} type="button" className="btn btn-danger shrink-0 whitespace-nowrap">
                            <i className={previousIcon} style={{ marginRight: '8px' }} />
                            {previousLabel}
                        </button>
                    ) : (
                        <span />
                    )}
                    <div style={{ color: '#e24c4c', textAlign: 'right', paddingRight: '12px' }} className="letraPequena order-first w-full min-w-0 sm:order-none sm:w-auto sm:flex-1">
                        {canMoveForward
                            ? ' '
                            : pendingRequirements.map((requirement: string) => (
                                  <div key={requirement}>
                                      <i className="pi pi-exclamation-circle" style={{ fontSize: '0.8rem', marginRight: '6px' }} />
                                      {requirement}
                                  </div>
                              ))}
                    </div>
                    {nextLabel && (
                        <span style={canMoveForward ? {} : { cursor: 'not-allowed' }} className="shrink-0">
                            <button
                                onClick={() => goToNextTab()}
                                disabled={!canMoveForward}
                                style={canMoveForward ? {} : { pointerEvents: 'none' }}
                                type="button"
                                className="btn btn-primary whitespace-nowrap"
                            >
                                <i className={nextIcon} style={{ marginRight: '8px' }} />
                                {nextLabel}
                            </button>
                        </span>
                    )}
                </div>
            </div>
        </PanelCodeHighlight>
    );
};
