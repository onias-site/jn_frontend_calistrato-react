'use client';
import React from 'react';
import { ChartFrame, ReactApexChart, SmallSampleWarning, Statistics, fontFamily, readySources, sourceTotalsLabel, statisticsOf } from './chartCommons';
import { GAP_MINIMUM_RECORDS, gapsOfTheRegion, pointsText } from './moreChartsData';
import { percentText } from './supplyAndDemandData';

const SOUGHT = '#eb6834';

const SPARE = '#8a9bb0';

/**
 * Gráfico 1 (2026-11-17): o que os recrutadores procuram mais do que existe na região. Barras divergentes com a
 * diferença, em pontos percentuais, entre a fatia do item nos currículos vistos e nos currículos: à direita (laranja) o
 * que está em falta, à esquerda (cinza) o que sobra.
 */
export const GapPanel = ({ title, statistics }: { title: string; statistics: Statistics }) => {
    const [resumes, viewed] = readySources.map((source) => ({ source, total: statisticsOf(statistics, source)?.total || 0, charts: statisticsOf(statistics, source)?.charts }));
    const gaps = gapsOfTheRegion(resumes, viewed);
    const values = gaps.map((item) => item.gap);
    const widest = Math.max(...values.map(Math.abs), 1) * 1.35;
    const options: any = {
        chart: { type: 'bar', fontFamily, toolbar: { show: false }, animations: { enabled: false } },
        plotOptions: {
            bar: {
                horizontal: true,
                borderRadius: 4,
                barHeight: '65%',
                colors: { ranges: [{ from: -1000, to: 0, color: SPARE }, { from: 0, to: 1000, color: SOUGHT }] },
                dataLabels: { position: 'top' },
            },
        },
        colors: [SOUGHT],
        xaxis: { categories: gaps.map((item) => item.label), min: -widest, max: widest, tickAmount: 6, labels: { formatter: (value: number) => pointsText(Math.round(value)) } },
        yaxis: { labels: { style: { fontSize: '13px', fontWeight: 600, colors: '#0e1726' }, maxWidth: 280 } },
        dataLabels: { enabled: true, offsetX: 34, style: { fontSize: '11px', colors: ['#3b3f5c'] }, formatter: (value: number) => pointsText(value), dropShadow: { enabled: false } },
        legend: { show: false },
        tooltip: {
            y: {
                title: { formatter: () => '' },
                formatter: (value: number, tooltip: any) => {
                    const item = gaps[tooltip.dataPointIndex];
                    return `CVs ${percentText(item.resumes)} (${item.resumesCount}) → vistos ${percentText(item.viewed)} (${item.viewedCount}): ${pointsText(value)}`;
                },
            },
        },
        grid: { borderColor: '#e0e6ed', xaxis: { lines: { show: true } } },
    };
    return (
        <ChartFrame
            title={title}
            detail={sourceTotalsLabel(statistics)}
            wide
            note={`Diferença em pontos percentuais entre a fatia do item nos currículos vistos e nos currículos da região. Laranja: os recrutadores procuram mais do que existe. Cinza: sobra. Só itens com pelo menos ${GAP_MINIMUM_RECORDS} registros.`}
        >
            <SmallSampleWarning statistics={statistics} />
            {gaps.length == 0 && <p className="text-white-dark">Sem visualizações suficientes nesta região para comparar.</p>}
            {gaps.length > 0 && <ReactApexChart type="bar" height={70 + gaps.length * 30} options={options} series={[{ name: 'Diferença', data: values }]} />}
        </ChartFrame>
    );
};
