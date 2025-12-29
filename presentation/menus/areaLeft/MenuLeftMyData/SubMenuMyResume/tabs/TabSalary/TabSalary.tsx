import React from 'react';
import { TabPanel } from 'primereact/tabview';
import PanelCodeHighlight from '@/presentation/utils/panel-code-highlight';
import { FormSalary } from './FormSalary';

export const TabSalary: React.FC<any> = ({}) => {
    return (
        <TabPanel header="Salário" leftIcon="pi pi-money-bill mr-2">
            <PanelCodeHighlight>
                <FormSalary />
                <div className="mb-5 text-center">
                    <div className="flex-column flex">
                        <button id="btnGoToLanguages" style={{ width: '15%' }} type="button" className="btn btn-danger ltr:ml-auto rtl:mr-auto">
                            Alterar filtros
                        </button>
                        <label htmlFor="username" style={{ width: '70%' }} className="letraPequena">
                            &nbsp;
                        </label>
                        <button id="btnGoToLanguages" type="button" className="btn btn-primary ltr:ml-auto rtl:mr-auto">
                           Salvar dados
                        </button>
                    </div>
                </div>
            </PanelCodeHighlight>
        </TabPanel>
    );
};
