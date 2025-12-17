'use client';
import IconHome from '@/presentation/icons/icon-home';
import React, { useState } from 'react';
import FormularioCandidato from '@/presentation/modules/MeusDados/SobreMim/application/formulario-candidato';
import PreviewCandidatoComponent from './preview-candidato-ind';


export const SobreMimTabs = () => {
    const [tabs, setTabs] = useState<string>('meusdados');
    const toggleTabs = (name: string) => {
        setTabs(name);
    };


    return (
        <div className="pt-5">
            <div>
                <ul className="mb-5 overflow-y-auto whitespace-nowrap border-b border-[#ebedf2] font-semibold dark:border-[#191e3a] sm:flex">
                    <li className="inline-block">
                        <button
                            onClick={() => toggleTabs('meusdados')}
                            className={`flex items-center gap-2 border-b border-transparent p-4 hover:border-primary hover:text-primary ${tabs === 'meusdados' ? '!border-primary text-primary' : ''}`}
                        >
                            <IconHome />
                            Meus Dados
                        </button>
                    </li>
                    <li className="inline-block">
                        <button
                            onClick={() => toggleTabs('visperfil')}
                            className={`flex gap-2 border-b border-transparent p-4 hover:border-primary hover:text-primary ${tabs === 'visperfil' ? '!border-primary text-primary' : ''}`}
                        >
                            Visualizar perfil
                        </button>
                    </li>
                </ul>
            </div>
            {tabs === 'meusdados' ? (
                <div>
                    <FormularioCandidato />
                </div>
            ) : (
                ''
            )}
             {tabs === 'visperfil' ? (
                <div>
                    <div className="mt-3 flex flex-row gap-6 pb-4 sm:col-span-2">
                    </div>
                    <PreviewCandidatoComponent />
                </div>
            ) : (
                ''
            )}
        </div>
    );
};
