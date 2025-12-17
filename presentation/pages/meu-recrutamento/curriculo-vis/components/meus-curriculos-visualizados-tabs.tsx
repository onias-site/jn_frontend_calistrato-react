'use client';
import IconHome from '@/presentation/icons/icon-home';
import React, { useState } from 'react';
import MeusCurriculosVisualizados from '../meus-curriculos-visualizados';

export const MeusCurriculosVisualizadosTabs = () => {
    const [tabs, setTabs] = useState<string>('home');
    const toggleTabs = (name: string) => {
        setTabs(name);
    };


    return (
        <div className="pt-5">
            <div>
                <ul className="mb-5 overflow-y-auto whitespace-nowrap border-b border-[#ebedf2] font-semibold dark:border-[#191e3a] sm:flex">
                    <li className="inline-block">
                        <button
                            onClick={() => toggleTabs('home')}
                            className={`flex items-center gap-2 border-b border-transparent p-4 hover:border-primary hover:text-primary ${tabs === 'home' ? '!border-primary text-primary' : ''}`}
                        >
                            <IconHome />
                            Currículos
                        </button>
                    </li>
                </ul>
            </div>
            {tabs === 'home' ? (
                <div>
                    <MeusCurriculosVisualizados />
                </div>
            ) : (
                ''
            )}
        </div>
    );
};
