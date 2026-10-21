import { ResumesOfTheWeek } from '@/presentation/pages/meu-recrutamento/curriculos-da-semana/ResumesOfTheWeek';
import { Metadata } from 'next';
import Link from 'next/link';
import React from 'react';

export const metadata: Metadata = {
    title: 'Currículos da semana',
};

const CurriculosDaSemana = () => {
    return (
        <div>
            <ul className="flex space-x-2 rtl:space-x-reverse">
                <li>
                    <Link href="#" className="text-primary hover:underline">
                        Currículos da semana
                    </Link>
                </li>
            </ul>
            <ResumesOfTheWeek />
        </div>
    );
};

export default CurriculosDaSemana;
