import { BackendConcepts } from '@/presentation/pages/nosso-backend/BackendConcepts';
import { Metadata } from 'next';
import PageTitle from '@/presentation/layouts/page-title';
import React from 'react';

export const metadata: Metadata = {
    title: 'Nosso Backend',
};

const NossoBackend = () => {
    return (
        <div>
            <PageTitle>Nosso Backend</PageTitle>
            <BackendConcepts />
        </div>
    );
};

export default NossoBackend;
