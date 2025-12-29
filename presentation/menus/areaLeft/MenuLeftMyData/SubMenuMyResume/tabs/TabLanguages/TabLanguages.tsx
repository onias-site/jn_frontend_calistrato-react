import React from 'react';
import { TabPanel } from 'primereact/tabview';
import PanelCodeHighlight from '@/presentation/utils/panel-code-highlight';
import LanguagesStore, { ChooserLanguages, ILanguagesStore } from './ChooserLanguages';
import {TabLanguagesFooter} from './TabLanguagesFooter';
import './TabLanguages.css';
export const TabLanguages: React.FC<any> = ({}) => {
    return (
        <TabPanel header="Idiomas" leftIcon="pi pi-language mr-2">
            <PanelCodeHighlight>
                <ChooserLanguages />
                <TabLanguagesFooter/>
            </PanelCodeHighlight>
        </TabPanel>
    );
};
