import { PrivacyPolicy } from '@/presentation/pages/privacidade/PrivacyPolicy';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Política de privacidade',
};

const Privacidade = () => <PrivacyPolicy />;

export default Privacidade;
