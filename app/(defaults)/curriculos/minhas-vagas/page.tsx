// 'use client'

import { useVagas } from '@/presentation/contexts/vagasContex';
import IconArchive from '@/presentation/icons/icon-archive';
import IconAward from '@/presentation/icons/icon-award';
import IconCreditCard from '@/presentation/icons/icon-credit-card';
import ListaDeVagas from '@/presentation/modules/MeuRecrutamento/MinhasVagas/application/lista-vagas';
import { MinhasVagasTabs } from '@/presentation/modules/MeuRecrutamento/MinhasVagas/application/minhas-vagas-tabs';
import { VagasContainer } from '@/presentation/modules/MeuRecrutamento/MinhasVagas/application/vagas-container';
import { Metadata } from 'next';
import Link from 'next/link';
import React, { useState } from 'react';

export const metadata: Metadata = {
    title: 'Minhas vagas',
};

// export type ReceiptMode = any;

// export type ReceiptOption = {
//   id: string;
//   iconName: any;
//   name: string;
//   description: string;
//   receiptMode: ReceiptMode;
// };


const MinhasVagas = () => {
    // const { recordsData } = useVagas();
    // const receiptOptions: ReceiptOption[] = [
    //     {
    //       iconName: 'truck',
    //       id: 'realizar-recebimento',
    //       name: 'Ativas',
    //       description: 'Vagas ativas',
    //       receiptMode: <ListaDeVagas vagas={recordsData.ativas} tipo="ativas" />,
    //     },
    //     {
    //       iconName: 'fileSearchV2',
    //       id: 'visualizar-historico',
    //       name: 'Encerradas',
    //       description: 'Vagas encerradas',
    //       receiptMode: <ListaDeVagas vagas={recordsData.encerradas} tipo="encerradas" />,
    //     },
    //   ];

    //   const [countMode, setCountMode] = useState<ReceiptMode>();
    //   const [selectedMode, setSelectedMode] = useState<ReceiptMode | null>(null);
    return (
        <VagasContainer />
        // <div>
        //     <ul className="flex space-x-2 rtl:space-x-reverse">
        //         <li>
        //             <Link href="#" className="text-primary hover:underline">
        //             Minhas Vagas
        //             </Link>
        //         </li>
        //     </ul>
        //     <MinhasVagasTabs />
        // </div>
    //     <>
    //     <div className="self-stretch flex-grow-0 flex flex-col justify-start items-stretch gap-[8px] mb-[12px] ">
    //     <span className="self-stretch flex-grow-0 font-barlow text-[24px] md:text-[30px] font-bold leading-[30px] tracking-[-0.6px] text-left md:text-center lg:text-left text-gray-900">
    //       Quais Vagas você deseja visualizar?
    //     </span>
    //     <p className="self-stretch flex-grow-0 font-barlow text-[14px] tracking-[-0.6px] text-left md:text-center lg:text-left text-gray-500">
    //       Selecione quais das listas de vagas que você deseja visualizar.
    //     </p>
    //   </div>
    //   <ul className="w-full grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 gap-[8px] sm:gap-[16px]">
    //     {receiptOptions?.map((receiptOption) => (
    //              <div
    //              key={receiptOption.id}
    //              className="cursor-pointer"
    //                     onClick={() => setSelectedMode(receiptOption.receiptMode)}
    //              >
    //              <div className="bg-white mt-[8px] rounded-[12px]">
    //                <div className="border-b-[1px] border-gray-400/20">
    //                  <div className="flex justify-between p-[16px]">
    //                    <div className="flex gap-[16px] ">
    //                      <div className="rounded-[6px] bg-green-50 w-[40px] h-[40px] p-[10px] flex flex-row justify-center items-center gap-[13px]">
    //                        <IconAward className="w-[20px] h-[20px]"  />
    //                      </div>
    //                      <div className="flex flex-col">
    //                        <span className="text-[16px] font-barlow leading-normal font-bold text-gray-7000">
    //                          {receiptOption.name}
    //                        </span>
    //                        <span className="h-10 flex-grow font-barlow text-sm font-normal leading-6 text-left text-gray-5000">
    //                          {receiptOption.description}
    //                        </span>
    //                      </div>
    //                    </div>
    //                  </div>
    //                </div>
    //              </div>
    //            </div>
    //     ))}
    //   </ul>
    //   {selectedMode && (
    //             <div className="mt-8">
    //                 {selectedMode}
    //             </div>
    //         )}
    //   </>
    );
};

export default MinhasVagas;
