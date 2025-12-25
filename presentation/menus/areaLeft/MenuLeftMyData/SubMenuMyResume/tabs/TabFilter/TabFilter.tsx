import React from 'react';
import { TabPanel } from 'primereact/tabview';
import RegioesComponent from './RegioesComponent';
import PanelCodeHighlight from '@/presentation/utils/panel-code-highlight';
import { Checkbox } from 'primereact/checkbox';

export const TabFilter: React.FC<any> = ({}) => {
    return (
        <TabPanel header="Filtros" leftIcon="pi pi-filter mr-2">
            <PanelCodeHighlight>
                <RegioesComponent />
                <div className="flex flex-row gap-8">
                    <div className="mb-5 text-center">
                        <div className="align-items-center flex">
                            <Checkbox
                                inputId="ingredient3"
                                name="pizza"
                                value="Pepper"
                                // onChange={onIngredientsChange} checked={ingredients.includes('Pepper')}
                            />
                            <label htmlFor="ingredient3" className="letraPequena ml-2" >
                                Negocio minhas pretensões salariais
                            </label>
                        </div>
                    </div>
                    <div className="mb-5 text-center">&nbsp;</div>
                    <div className="mb-5 text-center">&nbsp;</div>

                    <div className="mb-5 text-center">
                        <div className="align-items-center flex">
                            <Checkbox
                                inputId="ingredient3"
                                name="pizza"
                                value="Pepper"
                                // onChange={onIngredientsChange} checked={ingredients.includes('Pepper')}
                            />
                            <label htmlFor="ingredient3" className="letraPequena" >
                                Possuo necessidades especiais (PCD)
                            </label>
                        </div>
                    </div>
                </div>


            </PanelCodeHighlight>
        </TabPanel>
    );
};
