import React from 'react';
import { TabPanel } from 'primereact/tabview';
import { ChooserSkills, ChooserSkillsProps } from './ChooserSkills';
export const TabSkills: React.FC<ChooserSkillsProps> = ({ skillsGroups }) => {

    return (
        <TabPanel header="Habilidades" leftIcon="pi pi-check mr-2">
            <ChooserSkills skillsGroups={skillsGroups} />

            <div className="mb-5 text-center">
                <div className="flex-column flex">
                    <button id="btnGoToLanguages" style={{ width: '15%' }} type="button" className="btn btn-danger ltr:ml-auto rtl:mr-auto">
                        Alterar idiomas
                    </button>
                    <label htmlFor="username" style={{ width: '70%' }} className="letraPequena">
                        &nbsp;
                    </label>
                    <button id="btnGoToLanguages" type="button" className="btn btn-primary ltr:ml-auto rtl:mr-auto">
                        Selecionar filtros
                    </button>
                </div>
            </div>
        </TabPanel>
    );
};
