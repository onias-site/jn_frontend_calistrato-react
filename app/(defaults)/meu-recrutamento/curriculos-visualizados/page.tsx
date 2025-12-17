
import { MeusCurriculosVisualizadosTabs } from '@/presentation/pages/meu-recrutamento/curriculo-vis/components/meus-curriculos-visualizados-tabs';
import { Metadata } from 'next';
import Link from 'next/link';
import React from 'react';

export const metadata: Metadata = {
    title: 'Cvc Visualizados',
};

const MinhasVagas = () => {
    return (
        <div>
            <ul className="flex space-x-2 rtl:space-x-reverse">
                <li>
                    <Link href="#" className="text-primary hover:underline">
                       Currículos Visualizados
                    </Link>
                </li>
            </ul>
            <MeusCurriculosVisualizadosTabs />
        </div>
    );
};

export default MinhasVagas;
