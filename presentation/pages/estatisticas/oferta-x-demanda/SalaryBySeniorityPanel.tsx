'use client';
import React from 'react';
import { ChartFrame, ReactApexChart, SmallSampleWarning, Statistics, fontFamily, readySources, sourceTotalsLabel, statisticsOf } from './chartCommons';
import { salaryBySeniority, shortMoney } from './moreChartsData';
import { money } from './supplyAndDemandData';

/** CLT em tons cheios, PJ em tons claros; azul para os CVs, laranja para os vistos e verde para as vagas, como no resto da tela. */
const colors = ['#2a78d6', '#eb6834', '#1baf7a', '#9ec5f0', '#f5b89c', '#8fdcc0'];

/**
 * Gráfico 2 (2026-11-17): a média das pretensões CLT e PJ de cada senioridade, dos currículos, dos currículos vistos
 * e das vagas (o meio de cada faixa oferecida; as médias da tabela "Totais e médias" em colunas, para ver a escada salarial).
 */
export const SalaryBySeniorityPanel = ({ title, statistics }: { title: string; statistics: Statistics }) => {
    const chart = salaryBySeniority(readySources.map((source) => ({ source, averages: statisticsOf(statistics, source)?.averages })));
    const options: any = {
        chart: { type: 'bar', fontFamily, toolbar: { show: false }, animations: { enabled: false } },
        colors,
        plotOptions: { bar: { columnWidth: '75%', borderRadius: 3 } },
        xaxis: { categories: chart.categories },
        yaxis: { labels: { formatter: (value: number) => shortMoney(value) } },
        dataLabels: { enabled: false },
        legend: { position: 'top', horizontalAlign: 'left' },
        tooltip: { y: { formatter: (value: number) => (value ? money(value) : 'ninguém informou') } },
        grid: { borderColor: '#e0e6ed' },
    };
    return (
        <ChartFrame title={title} detail={sourceTotalsLabel(statistics)} note="Média das pretensões de quem informou; sem barra quando ninguém da senioridade informou.">
            <SmallSampleWarning statistics={statistics} />
            <ReactApexChart type="bar" height={340} options={options} series={chart.series} />
        </ChartFrame>
    );
};
