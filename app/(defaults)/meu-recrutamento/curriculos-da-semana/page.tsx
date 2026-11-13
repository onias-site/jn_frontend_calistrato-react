import { ResumesOfTheWeek } from '@/presentation/pages/meu-recrutamento/curriculos-da-semana/ResumesOfTheWeek';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Currículos da semana',
};

// o título visível ("Currículos da semana do recrutador <e-mail>") fica no ResumesOfTheWeek: o e-mail só existe no navegador
const CurriculosDaSemana = () => {
    return (
        <div>
            <ResumesOfTheWeek />
        </div>
    );
};

export default CurriculosDaSemana;
