import { SkillStatistics } from '@/presentation/pages/estatisticas/skills/SkillStatistics';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Vagas no Telegram',
};

const EstatisticasSkills = () => {
    // a tela abre já pesquisada com os filtros padrão (mês anterior, Pleno, Home office), como a home
    return <SkillStatistics searchOnOpening />;
};

export default EstatisticasSkills;
