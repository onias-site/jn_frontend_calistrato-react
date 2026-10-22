import { ViewedResumesOfTheMonth } from '@/presentation/pages/meu-recrutamento/curriculos-visualizados/ViewedResumesOfTheMonth';
import { Metadata } from 'next';
import Link from 'next/link';
import React from 'react';

export const metadata: Metadata = {
    title: 'Currículos visualizados',
};

const CurriculosVisualizados = () => {
    return (
        <div>
            <ul className="flex space-x-2 rtl:space-x-reverse">
                <li>
                    <Link href="#" className="text-primary hover:underline">
                        Currículos visualizados
                    </Link>
                </li>
            </ul>
            <ViewedResumesOfTheMonth />
        </div>
    );
};

export default CurriculosVisualizados;
