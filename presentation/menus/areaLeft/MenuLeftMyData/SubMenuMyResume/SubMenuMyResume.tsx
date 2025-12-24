import React from 'react';
import PanelCodeHighlight from '@/presentation/utils/panel-code-highlight';
import { TabView, TabPanel } from 'primereact/tabview';
import "primereact/resources/themes/lara-light-cyan/theme.css";

import 'primeicons/primeicons.css';

import { TabFilter } from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/tabs/TabFilter/TabFilter';
import { TabLanguages } from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/tabs/TabLanguages/TabLanguages';
import { TabResume } from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/tabs/TabResume/TabResume';
import { TabSalary } from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/tabs/TabSalary/TabSalary';
import { TabSkills } from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/tabs/TabSkills/TabSkills';

const SubMenuMyResume: React.FC<any> = ({}) => {
    return (
        <PanelCodeHighlight title="Dados">
            <TabView>
                <TabResume/>
                <TabLanguages/>
                <TabSkills/>
                <TabFilter/>
                <TabSalary/>
            </TabView>
        </PanelCodeHighlight>
    );
};

export default SubMenuMyResume;
