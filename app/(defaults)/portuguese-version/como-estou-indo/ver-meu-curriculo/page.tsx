import { getTranslation } from '@/i18n';
import Link from 'next/link';
import React from 'react';
import SubMenuMyResume from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/SubMenuMyResume';

const SobreMim = () => {
    const { t } = getTranslation();
    return (
        <SubMenuMyResume/>
    );
};

export default SubMenuMyResume;
