'use client';
import React from 'react';
import { ChartFrame, ReactApexChart, fontFamily, lineColors } from './chartCommons';
import { weekdayAverages, weekdays } from './moreChartsData';
import { TotalsByRegion } from './supplyAndDemandData';

const averageText = (value: number) => value.toLocaleString('pt-BR', { maximumFractionDigits: 1 });

/**
 * Gráfico 6 (2026-11-17): a média por dia da semana dos currículos inseridos e das visualizações feitas no país (o
 * contador por dia que o gráfico de linhas já usa), para saber quando os recrutadores procuram.
 */
export const WeekdayPanel = ({ byDay }: { byDay?: TotalsByRegion }) => {
    const { days, series } = weekdayAverages(byDay, new Date());
    const options: any = {
        chart: { type: 'bar', fontFamily, toolbar: { show: false }, animations: { enabled: false } },
        colors: lineColors,
        plotOptions: { bar: { columnWidth: '70%', borderRadius: 3, dataLabels: { position: 'top' } } },
        xaxis: { categories: weekdays },
        yaxis: { labels: { formatter: (value: number) => averageText(value) } },
        dataLabels: { enabled: true, offsetY: -18, style: { fontSize: '10px', colors: ['#3b3f5c'] }, formatter: (value: number) => averageText(value) },
        legend: { position: 'top', horizontalAlign: 'left' },
        tooltip: { y: { formatter: (value: number) => `${averageText(value)} por dia, em média` } },
        grid: { borderColor: '#e0e6ed' },
    };
    return (
        <ChartFrame
            title="Por dia da semana"
            detail={days ? `média de ${days} ${days == 1 ? 'dia' : 'dias'}` : undefined}
            note="Média de registros inseridos em cada dia da semana, até ontem; os dias sem nenhum contam como zero. Contam só os registros ainda ativos."
        >
            {days == 0 && <p className="text-white-dark">Ainda não há dias completos no contador.</p>}
            {days > 0 && <ReactApexChart type="bar" height={320} options={options} series={series} />}
        </ChartFrame>
    );
};
