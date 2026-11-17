'use client';
import React from 'react';
import { CuriosityFrame, ReactApexChart, fontFamily } from './curiositiesCommons';
import { channelGoalChart } from './moreCuriositiesData';

/**
 * Sugestão 6 (2026-11-17): a origem cruzada com o objetivo do usuário, uma barra por origem com os objetivos
 * empilhados: qual canal traz candidatos e qual traz recrutadores (contador channelGoals da js).
 */
export const ChannelGoalPanel = ({ counts }: { counts?: Record<string, number> }) => {
    const { categories, series } = channelGoalChart(counts);
    const options: any = {
        chart: { type: 'bar', stacked: true, fontFamily, toolbar: { show: false }, animations: { enabled: false } },
        colors: ['#2a78d6', '#eb6834'],
        plotOptions: { bar: { horizontal: true, borderRadius: 3, barHeight: '60%' } },
        xaxis: { categories, labels: { formatter: (value: number) => String(Math.round(value)) } },
        yaxis: { labels: { style: { fontSize: '12px', fontWeight: 600, colors: '#0e1726' }, maxWidth: 200 } },
        dataLabels: { enabled: true, style: { fontSize: '11px' }, formatter: (value: number) => (value ? String(value) : '') },
        legend: { position: 'top', horizontalAlign: 'left' },
        grid: { borderColor: '#e0e6ed' },
    };
    return (
        <CuriosityFrame title="Origem x objetivo do usuário" note="De onde vem cada usuário e o que veio buscar.">
            {categories.length == 0 && <p className="text-white-dark">Ainda sem dados.</p>}
            {categories.length > 0 && <ReactApexChart type="bar" height={70 + categories.length * 44} options={options} series={series} />}
        </CuriosityFrame>
    );
};
