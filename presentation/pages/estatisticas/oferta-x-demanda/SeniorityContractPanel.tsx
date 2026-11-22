'use client';
import React from 'react';
import { ChartFrame, ReactApexChart, SmallSampleWarning, Statistics, fontFamily, readySources, sourceTotalsLabel, statisticsOf } from './chartCommons';
import { HeatRow, seniorityContractRows } from './moreChartsData';
import { Source, countLabel, percentText } from './supplyAndDemandData';

const shades = { blue: ['#eaf2fb', '#9ec5f0', '#2a78d6', '#1c4f8f'], orange: ['#fdf0ea', '#f5b89c', '#eb6834', '#a8441c'], green: ['#e8f7f1', '#8fdcc0', '#1baf7a', '#127a55'] };

const ranges = (palette: string[]) => [
    { from: 0, to: 0, color: '#f4f5f7' },
    { from: 0.1, to: 25, color: palette[0] },
    { from: 25.1, to: 50, color: palette[1] },
    { from: 50.1, to: 75, color: palette[2] },
    { from: 75.1, to: 100, color: palette[3] },
];

const Heatmap = ({ source, rows, palette }: { source: Source; rows: HeatRow[]; palette: string[] }) => {
    const options: any = {
        chart: { type: 'heatmap', fontFamily, toolbar: { show: false }, animations: { enabled: false } },
        plotOptions: { heatmap: { radius: 3, enableShades: false, colorScale: { ranges: ranges(palette) } } },
        dataLabels: { enabled: true, formatter: (value: number) => percentText(value), style: { colors: ['#0e1726'], fontSize: '12px' } },
        legend: { show: false },
        xaxis: { labels: { style: { fontSize: '11px' } } },
        tooltip: {
            y: {
                formatter: (value: number, tooltip: any) => {
                    const row = rows[tooltip.seriesIndex];
                    const cell = row.data[tooltip.dataPointIndex];
                    return `${countLabel(source, cell.count)} de ${row.total} (${percentText(value)})`;
                },
            },
        },
        stroke: { width: 2, colors: ['#ffffff'] },
        title: { text: source.button, style: { fontSize: '13px', fontWeight: 600 } },
    };
    return <ReactApexChart type="heatmap" height={300} options={options} series={rows} />;
};

/**
 * Gráfico 4 (2026-11-17): senioridade x forma de contratação, um mapa de calor por fonte (CVs, CVs vistos e Vagas): cada
 * célula é a porcentagem da senioridade (a linha) que aceita aquela forma; cor mais forte, porcentagem maior.
 */
export const SeniorityContractPanel = ({ title, statistics }: { title: string; statistics: Statistics }) => {
    const palettes = [shades.blue, shades.orange, shades.green];
    return (
        <ChartFrame title={title} detail={sourceTotalsLabel(statistics)} note="Em cada senioridade (linha), quanto aceita cada forma de contratação; a linha soma 100%.">
            <SmallSampleWarning statistics={statistics} />
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {readySources.map((source, index) => (
                    <Heatmap key={source.id} source={source} rows={seniorityContractRows(statisticsOf(statistics, source)?.charts?.seniorityContract)} palette={palettes[index % palettes.length]} />
                ))}
            </div>
        </ChartFrame>
    );
};
