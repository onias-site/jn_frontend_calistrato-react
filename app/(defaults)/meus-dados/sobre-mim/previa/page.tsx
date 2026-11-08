import { Metadata } from 'next';
import React from 'react';
import { ResumePreviewPage } from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/ResumePreviewPage';

export const metadata: Metadata = {
    title: 'Prévia do currículo',
};

// rota fora do menu: só se chega aqui pelo "Ver prévia" da tela Sobre mim ou depois de salvar o currículo
const Previa = () => <ResumePreviewPage />;

export default Previa;
