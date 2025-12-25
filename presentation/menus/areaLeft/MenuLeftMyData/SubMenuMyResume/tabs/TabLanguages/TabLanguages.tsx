import React from 'react';
import { TabPanel } from 'primereact/tabview';
import PanelCodeHighlight from '@/presentation/utils/panel-code-highlight';
import { ChooserLanguages } from './ChooserLanguages';
import './TabLanguages.css';
export const TabLanguages: React.FC<any> = ({}) => {
    return (
        <TabPanel header="Idiomas" leftIcon="pi pi-language mr-2">
            <PanelCodeHighlight>
                <ChooserLanguages />
                <div className="mb-5 text-center">
                    <div className="flex-column flex">
                        <button id="btnGoToLanguages" style={{ width: '15%' }} type="button" className="btn btn-danger ltr:ml-auto rtl:mr-auto">
                            Alterar currículo
                        </button>
                        <label htmlFor="username" style={{ width: '70%' }} className="letraPequena">
                            &nbsp;
                        </label>
                        <button id="btnGoToLanguages" type="button" className="btn btn-primary ltr:ml-auto rtl:mr-auto">
                            Selecionar habilidades
                        </button>
                    </div>
                </div>
            </PanelCodeHighlight>
        </TabPanel>
    );
};
