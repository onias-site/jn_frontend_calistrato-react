'use client';

import React from 'react';
import IconAward from '@/presentation/icons/icon-award';

interface OptionsVagasProps {
    onSelect: (tipo: 'ativas' | 'encerradas') => void;
}

export const OptionsVagas: React.FC<OptionsVagasProps> = ({ onSelect }) => {

    const receiptOptions = [
        {
            iconName: 'truck',
            id: 'realizar-recebimento',
            name: 'Ativas',
            description: 'Vagas ativas',
            receiptMode: 'ativas' as const,
        },
        {
            iconName: 'fileSearchV2',
            id: 'visualizar-historico',
            name: 'Encerradas',
            description: 'Vagas encerradas',
            receiptMode: 'encerradas' as const,
        },
    ];

    return (
        <div>
            <div className="mb-[12px] flex flex-grow-0 flex-col items-stretch justify-start gap-[8px] self-stretch ">
                <span className="font-barlow flex-grow-0 self-stretch text-left text-[24px] font-bold leading-[30px] tracking-[-0.6px] text-gray-900 md:text-center md:text-[30px] lg:text-left">
                    Quais Vagas você deseja visualizar?
                </span>
                <p className="font-barlow flex-grow-0 self-stretch text-left text-[14px] tracking-[-0.6px] text-gray-500 md:text-center lg:text-left">
                    Selecione quais das listas de vagas que você deseja visualizar.
                </p>
            </div>
            <ul className="grid w-full grid-cols-1 gap-[16px] sm:grid-cols-2 sm:gap-[20px] lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {receiptOptions.map((receiptOption) => (
                    <div
                        key={receiptOption.id}
                        className="cursor-pointer h-full transform transition-all duration-300 ease-in-out hover:scale-105 hover:-translate-y-2 hover:shadow-lg"
                        onClick={() => onSelect(receiptOption.receiptMode)}
                    >
                        <div className="rounded-[16px] bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-200 dark:border-gray-700">
                            <div className="p-[24px]">
                                <div className="flex flex-col items-center text-center gap-[16px]">
                                    <div className="flex h-[60px] w-[60px] flex-row items-center justify-center rounded-[12px] bg-green-50 dark:bg-green-900/20 p-[15px] transition-colors duration-300">
                                        <IconAward className="h-[30px] w-[30px] text-green-600 dark:text-green-400" />
                                    </div>
                                    <div className="flex flex-col gap-[8px]">
                                        <span className="font-barlow text-gray-900 dark:text-gray-100 text-[20px] font-bold leading-normal">{receiptOption.name}</span>
                                        <span className="font-barlow text-gray-600 dark:text-gray-400 text-[16px] font-normal leading-6">{receiptOption.description}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </ul>
        </div>
    );
};
