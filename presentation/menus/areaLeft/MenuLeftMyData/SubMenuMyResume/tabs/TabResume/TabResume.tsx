
import React from 'react';
import { TabPanel } from 'primereact/tabview';

import { InputTextarea } from 'primereact/inputtextarea';
import { InputText } from 'primereact/inputtext';
import PanelCodeHighlight from '@/presentation/utils/panel-code-highlight';
import { AutoComplete } from 'primereact/autocomplete';
import FileResume from './FileResume';
import { Tooltip } from 'primereact/tooltip';
import {FormResume} from './FormResume';
import './TabResume.css';

export interface TabResumeProps{

}

export const TabResume: React.FC<TabResumeProps> = ({}) => {
    return (
        <TabPanel header="Curriculo" leftIcon="pi pi-file mr-2">
            <FormResume/>
        </TabPanel>
    );
};
