'use client';
import IconHome from '@/presentation/icons/icon-home';
import React, { useState } from 'react';
import ListaDeVagas from './lista-vagas';
// import { Tabs } from '@mantine/core';
import { useVagas } from '@/presentation/contexts/vagasContex';

export const MinhasVagasTabs = () => {
    const [tabs, setTabs] = useState<string>('ativas');
    const toggleTabs = (name: string) => {
        setTabs(name);
    };

    const { recordsData } = useVagas();

    return (
        // <div className="pt-5">
        //     <Tabs value={activeTab} onTabChange={setActiveTab}>
        //         <Tabs.List>
        //             <Tabs.Tab  value="ativas" icon={<IconHome />} className='text-white '>
        //                 Em aberto
        //             </Tabs.Tab>
        //             <Tabs.Tab value="encerradas">Encerradas</Tabs.Tab>
        //         </Tabs.List>

        //         <Tabs.Panel value="ativas">
        //             <ListaDeVagas vagas={recordsData.ativas} tipo="ativas" />
        //         </Tabs.Panel>

        //         <Tabs.Panel value="encerradas">
        //             <div className=" flex flex-row gap-6 sm:col-span-2"></div>
        //             <ListaDeVagas vagas={recordsData.encerradas} tipo="encerradas" />
        //         </Tabs.Panel>
        //     </Tabs>
        // </div>
        <div className="pt-5">
            <div>
                <ul className="mb-5 overflow-y-auto whitespace-nowrap border-b border-[#ebedf2] font-semibold dark:border-[#191e3a] sm:flex">
                    <li className="inline-block">
                        <button
                            onClick={() => toggleTabs('ativas')}
                            className={`flex items-center gap-2 border-b border-transparent p-4 hover:border-primary hover:text-primary ${tabs === 'ativas' ? '!border-primary text-primary' : ''}`}
                        >
                            <IconHome />
                            Em aberto
                        </button>
                    </li>
                    <li className="inline-block">
                        <button
                            onClick={() => toggleTabs('encerradas')}
                            className={`flex gap-2 border-b border-transparent p-4 hover:border-primary hover:text-primary ${tabs === 'encerradas' ? '!border-primary text-primary' : ''}`}
                        >
                            Encerradas
                        </button>
                    </li>
                </ul>
            </div>
            {tabs === 'ativas' ? (
                <div>
                    <ListaDeVagas vagas={recordsData.ativas} tipo="ativas" />
                </div>
            ) : (
                ''
            )}
            {tabs === 'encerradas' ? (
                <div>

                    <ListaDeVagas vagas={recordsData.encerradas} tipo="encerradas" />
                </div>
            ) : (
                ''
            )}
        </div>
    );
};
