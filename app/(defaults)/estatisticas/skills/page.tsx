import { SkillStatistics } from '@/presentation/pages/estatisticas/skills/SkillStatistics';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Grupos de vagas do telegram',
};

const EstatisticasSkills = () => {
    return <SkillStatistics />;
};

export default EstatisticasSkills;
