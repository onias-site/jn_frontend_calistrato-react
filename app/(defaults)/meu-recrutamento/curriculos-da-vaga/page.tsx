import { ResumesOfThePosition } from '@/presentation/pages/meu-recrutamento/curriculos-da-vaga/ResumesOfThePosition';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Currículos da vaga',
};

// o link "Ver todos" do e-mail "{n} Cvs recebidos para a vaga" (desde 2026-11-24); o título visível fica no componente
const CurriculosDaVaga = () => {
    return (
        <div>
            <ResumesOfThePosition />
        </div>
    );
};

export default CurriculosDaVaga;