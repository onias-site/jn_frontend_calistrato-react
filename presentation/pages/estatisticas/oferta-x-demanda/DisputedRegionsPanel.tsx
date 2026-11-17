'use client';
import React from 'react';
import { ChartFrame, ReactApexChart, fontFamily } from './chartCommons';
import { DISPUTED_MINIMUM_RESUMES, DISPUTED_REGIONS, disputedRegions } from './moreChartsData';
import { TotalsByRegion } from './supplyAndDemandData';

const ratioText = (ratio: number) => ratio.toLocaleString('pt-BR', { maximumFractionDigits: 2 });

/**
 * Gráfico 3 (2026-11-17): as regiões mais disputadas do país, pelas visualizações por currículo ativo (os totais por
 * ddd que a tela já carrega para as pastas).
 */
export const DisputedRegionsPanel = ({ byRegion }: { byRegion?: TotalsByRegion }) => {
    const regions = disputedRegions(byRegion);
    const options: any = {
        chart: { type: 'bar', fontFamily, toolbar: { show: false }, animations: { enabled: false } },
        colors: ['#eb6834'],
        plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: '65%', dataLabels: { position: 'top' } } },
        xaxis: { categories: regions.map((item) => item.label), max: Math.max(...regions.map((item) => item.ratio), 1) * 1.3, labels: { formatter: (value: number) => ratioText(value) } },
        yaxis: { labels: { style: { fontSize: '12px', fontWeight: 600, colors: '#0e1726' }, maxWidth: 230 } },
        dataLabels: { enabled: true, offsetX: 28, style: { fontSize: '11px', colors: ['#3b3f5c'] }, formatter: (value: number) => ratioText(value), dropShadow: { enabled: false } },
        legend: { show: false },
        tooltip: {
            y: {
                title: { formatter: () => '' },
                formatter: (value: number, tooltip: any) => {
                    const item = regions[tooltip.dataPointIndex];
                    return `${item.views} visualizações para ${item.resumes} currículos: ${ratioText(value)} por currículo`;
                },
            },
        },
        grid: { borderColor: '#e0e6ed' },
    };
    return (
        <ChartFrame
            title="Regiões mais disputadas"
            detail="visualizações por currículo"
            note={`As ${DISPUTED_REGIONS} regiões com mais visualizações por currículo ativo, entre as que têm pelo menos ${DISPUTED_MINIMUM_RESUMES} currículos. Muita procura para pouca oferta.`}
        >
            {regions.length == 0 && <p className="text-white-dark">Nenhuma região com currículos suficientes.</p>}
            {regions.length > 0 && <ReactApexChart type="bar" height={60 + regions.length * 26} options={options} series={[{ name: 'Visualizações por currículo', data: regions.map((item) => item.ratio) }]} />}
        </ChartFrame>
    );
};
