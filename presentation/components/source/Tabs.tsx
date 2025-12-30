import React, { useState, useRef } from 'react';
import { TabMenu } from 'primereact/tabmenu';
import PanelCodeHighlight from '@/presentation/utils/panel-code-highlight';
import { Toast } from 'primereact/toast';

export class TabsModel {
    constructor(public label: string, public icon: string, public isValid: () => boolean = () => true, public successMessage: string = '', public errorMessage: string = '') {}
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
            goToNext();
            return;
        }
        setActiveIndex(index);
    };

    const goToPrevious = () => {
        if (!activeIndex) {
            firstButtonClick();
            return;
        }
        setActiveIndex(activeIndex - 1);
    };
    const goToNext = () => {
        const tab = tabs[activeIndex];

        const nextTab = tabs[activeIndex + 1];

        if (!nextTab) {
            if (!tab.isValid()) {
                toast.current.show({ severity: 'error', summary: 'Falha!!!', detail: tab.errorMessage, life: 3000 });
                return;
            }
            tab.successMessage && toast.current.show({ severity: 'success', summary: 'Sucesso!!!', detail: tab.successMessage, life: 3000 });
            return;
        }

        if (!tab.isValid) {
            setActiveIndex(activeIndex + 1);
            return;
        }

        if (!tab.isValid()) {
            toast.current.show({ severity: 'error', summary: 'Falha!!!', detail: tab.errorMessage, life: 10000 });
            return;
        }
        tab.successMessage && toast.current.show({ severity: 'success', summary: 'Sucesso!!!', detail: tab.successMessage, life: 10000 });
        setActiveIndex(activeIndex + 1);
    };
    return (
        <PanelCodeHighlight>
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
                        <button onClick={() => goToNext()} type="button" className="btn btn-primary ltr:ml-auto rtl:mr-auto">
                            {nextLabel}
                        </button>
                    )}
                </div>
            </div>
        </PanelCodeHighlight>
    );
};
