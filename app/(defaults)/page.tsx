import { SkillStatistics } from '@/presentation/pages/estatisticas/skills/SkillStatistics';
import { Metadata } from 'next';

export const metadata: Metadata = {
title: 'Home',
};

const Home = () => <SkillStatistics initialSeniority="senior" searchOnOpening />;

export default Home;
