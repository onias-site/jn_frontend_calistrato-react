import { UnsubscribeFromResumesEmail } from '@/presentation/pages/recrutador/UnsubscribeFromResumesEmail';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Descadastrar',
};

const Descadastrar = () => <UnsubscribeFromResumesEmail />;

export default Descadastrar;
