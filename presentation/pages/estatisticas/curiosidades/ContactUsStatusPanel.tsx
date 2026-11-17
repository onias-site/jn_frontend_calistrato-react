'use client';
import React from 'react';
import { CuriosityFrame, ReactApexChart, fontFamily } from './curiositiesCommons';
import { contactUsStatusChart } from './moreCuriositiesData';

/**
 * Sugestão 7 (2026-11-17): os chamados de cada tipo, respondidos e ainda sem resposta, empilhados (o histórico dos
 * abertos, contactUsTypes, menos os que esperam, pendingContactUsTypes). Substitui a pizza "Chamados abertos por tipo".
 */
export const ContactUsStatusPanel = ({ opened, pending }: { opened?: Record<string, number>; pending?: Record<string, number> }) => {
    const { categories, series } = contactUsStatusChart(opened, pending);
    const options: any = {
        chart: { type: 'bar', stacked: true, fontFamily, toolbar: { show: false }, animations: { enabled: false } },
        colors: ['#1baf7a', '#eda100'],
        plotOptions: { bar: { horizontal: true, borderRadius: 3, barHeight: '60%' } },
        xaxis: { categories, labels: { formatter: (value: number) => String(Math.round(value)) } },
        yaxis: { labels: { style: { fontSize: '12px', fontWeight: 600, colors: '#0e1726' }, maxWidth: 200 } },
        dataLabels: { enabled: true, style: { fontSize: '11px' }, formatter: (value: number) => (value ? String(value) : '') },
        legend: { position: 'top', horizontalAlign: 'left' },
        grid: { borderColor: '#e0e6ed' },
    };
    return (
        <CuriosityFrame title="Chamados por tipo" note="Todos os chamados já abertos de cada tipo: os respondidos e os que ainda esperam o suporte.">
            {categories.length == 0 && <p className="text-white-dark">Ainda sem dados.</p>}
            {categories.length > 0 && <ReactApexChart type="bar" height={70 + categories.length * 40} options={options} series={series} />}
        </CuriosityFrame>
    );
};
