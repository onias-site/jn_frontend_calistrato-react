import { SobreMimTabs } from '@/presentation/modules/MeusDados/SobreMim/application/sobre-mim-tabs';
import { getTranslation } from '@/i18n';
import { Metadata } from 'next';
import Link from 'next/link';
import React from 'react';

export const metadata: Metadata = {
    title: 'Sobre mim',
};

const SobreMim = () => {
    const { t } = getTranslation();
    return (
        <div>
            <ul className="flex space-x-2 rtl:space-x-reverse">
                <li>
                    <Link href="#" className="text-primary hover:underline">
                    {t('about_me')}
                    </Link>
                </li>
            </ul>
            <SobreMimTabs />
        </div>
    );
};

export default SobreMim;
