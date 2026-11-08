import { Metadata } from 'next';
import React from 'react';
import PageTitle from '@/presentation/layouts/page-title';
import SubMenuMyResume from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/SubMenuMyResume';

export const metadata: Metadata = {
    title: 'Sobre mim',
};

const SobreMim = () => {
    return (
        <div>
            <PageTitle>Sobre mim</PageTitle>
            <div className="mt-6">
                <SubMenuMyResume />
            </div>
        </div>
    );
};

export default SobreMim;
