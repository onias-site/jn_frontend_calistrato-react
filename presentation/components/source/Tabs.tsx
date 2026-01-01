import React, { useState, useRef } from 'react';
import { TabMenu } from 'primereact/tabmenu';
import PanelCodeHighlight from '@/presentation/utils/panel-code-highlight';
import { Toast } from 'primereact/toast';

export class TabsModel {
    constructor(public title: string = '', public label: string, public icon: string, public onMoveOnFowardTabs: () => string[] = () => []) {}
}

export interface TabsProps {
    tabs: TabsModel[];
    lastButtonLabel: string;
    firstButtonLabel: string;
    children: React.ReactNode;
    firstButtonClick: () => void;
}

export const Tabs: React.FC<TabsProps> = ({ firstButtonClick, tabs, children, lastButtonLabel, firstButtonLabel }) => {
    const toast = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const previousLabel = activeIndex > 0 ? tabs[activeIndex - 1].label : firstButtonLabel;
    const nextLabel = (tabs[activeIndex + 1] && tabs[activeIndex + 1].label) || lastButtonLabel;

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
            <div className="mb-5 text-center">
                <div className="flex-column flex">
                    {previousLabel ? (
                        <button onClick={() => goToPrevious()} style={{ width: '15%' }} type="button" className="btn btn-danger ltr:ml-auto rtl:mr-auto">
                            {previousLabel}
                        </button>
                    ) : (
                        <label style={{ width: '15%' }} className="letraPequena">
                            &nbsp;
                        </label>
                    )}
                    <label style={{ width: '70%' }} className="letraPequena">
                        &nbsp;
                    </label>
                    {nextLabel && (
                        <button onClick={() => goToNextTab()} type="button" className="btn btn-primary ltr:ml-auto rtl:mr-auto">
                            {nextLabel}
                        </button>
                    )}
                </div>
            </div>
        </PanelCodeHighlight>
    );
};
