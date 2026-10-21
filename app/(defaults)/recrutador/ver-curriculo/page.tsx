import { ViewResumeFromEmail } from '@/presentation/pages/recrutador/ViewResumeFromEmail';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Ver currículo',
};

const VerCurriculo = () => <ViewResumeFromEmail />;

export default VerCurriculo;
