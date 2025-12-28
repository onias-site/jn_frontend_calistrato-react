
import React from 'react';
// import PanelCodeHighlight from '@/presentation/utils/panel-code-highlight';
import { TabView } from 'primereact/tabview';
import "primereact/resources/themes/lara-light-cyan/theme.css";

import 'primeicons/primeicons.css';
import './SubMenuMyResume.css'
import 'primereact/resources/primereact.min.css';

import { TabFilter } from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/tabs/TabFilter/TabFilter';
import { TabLanguages } from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/tabs/TabLanguages/TabLanguages';
import { TabResume } from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/tabs/TabResume/TabResume';
import { TabSalary } from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/tabs/TabSalary/TabSalary';
import { TabSkills } from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/tabs/TabSkills/TabSkills';

const SubMenuMyResume: React.FC<any> = ({}) => {
    return (
        <div className="card">
            <TabView>
                <TabResume/>
                <TabLanguages/>
                <TabSkills skillsGroups = {[
                    {skills:['JAVA', 'JAVA', 'JAVA', 'JAVA', 'JAVA', 'JAVA', 'JAVA', 'JAVA', 'JAVA', 'JAVA', 'JAVA', 'JAVA', 'JAVA', 'JAVA', 'JAVA', 'JAVA', 'JAVA', 'JAVA', 'JAVA', 'JAVA', 'JAVA', 'JAVA', 'JAVA', 'JAVA', 'JAVA', 'JAVA', 'JAVA'], name: 'show', title: 'Os recrutadores IRÃO me encontrar por'},
                    {skills:[], name: 'hide', title: 'Os recrutadores NÂO vão me encontrar por'}
                ]}/>
                <TabFilter/>
                <TabSalary/>
            </TabView>
        </div>
    );
};

export default SubMenuMyResume;
