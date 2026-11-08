import { ResumeViewersOfTheMonth } from '@/presentation/pages/meus-dados/quem-me-viu/ResumeViewersOfTheMonth';
import { Metadata } from 'next';
import PageTitle from '@/presentation/layouts/page-title';
import React from 'react';

export const metadata: Metadata = {
    title: 'Quem me viu',
};

const QuemMeViu = () => {
    return (
        <div>
            <PageTitle>Quem me viu</PageTitle>
            <ResumeViewersOfTheMonth />
        </div>
    );
};

export default QuemMeViu;
