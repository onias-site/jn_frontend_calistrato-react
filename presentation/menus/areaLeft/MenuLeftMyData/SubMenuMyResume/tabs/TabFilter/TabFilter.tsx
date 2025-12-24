import React from 'react';
import {TabPanel } from 'primereact/tabview';
import RegioesComponent from './RegioesComponent';
export const TabFilter: React.FC<any> = ({  }) => {

    return (
        <TabPanel header="Filtros" leftIcon="pi pi-filter mr-2">
            <RegioesComponent/>
		</TabPanel>
    );
}

