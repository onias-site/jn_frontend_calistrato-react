import { Metadata } from 'next';
import React from 'react';
import SubMenuMyResume from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/SubMenuMyResume';

export const metadata: Metadata = {
    title: 'Sobre mim',
};

const SobreMim = () => {
    return (
        <SubMenuMyResume/>
    );
};

export default SobreMim;
