'use client';
import React from 'react';
import { CuriosityFrame, ReactApexChart, fontFamily } from './curiositiesCommons';
import { RANKING_SIZE, rankingOf } from './moreCuriositiesData';

/**
 * Sugestão 3 (2026-11-17): os gráficos de muitos itens (empresas, consultorias, skills evitadas) em ranking de barras,
 * os RANKING_SIZE maiores, no lugar da pizza com "Outras".
 */
export const RankingPanel = ({ title, help, counts, labels, excluded }: { title: string; help?: string; counts?: Record<string, number>; labels?: Record<string, string>; excluded?: string[] }) => {
    const { items, distinct } = rankingOf(counts, labels, excluded);
    const values = items.map((item) => item.total);
    const options: any = {
        chart: { type: 'bar', fontFamily, toolbar: { show: false }, animations: { enabled: false } },
        colors: ['#2a78d6'],
        plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: '65%', dataLabels: { position: 'top' } } },
        // cada barra mostra o seu número: o eixo, com valores pequenos, repetiria rótulos arredondados ("0 0 1 1")
        xaxis: { categories: items.map((item) => item.label), max: Math.max(...values, 1) * 1.25, labels: { show: false }, axisTicks: { show: false } },
        yaxis: { labels: { style: { fontSize: '12px', fontWeight: 600, colors: '#0e1726' }, maxWidth: 220 } },
        dataLabels: { enabled: true, offsetX: 24, style: { fontSize: '11px', colors: ['#3b3f5c'] }, dropShadow: { enabled: false } },
        legend: { show: false },
        tooltip: { y: { title: { formatter: () => '' } } },
        grid: { borderColor: '#e0e6ed' },
    };
    const detail = distinct > RANKING_SIZE ? `os ${RANKING_SIZE} maiores de ${distinct}` : undefined;
    return (
        <CuriosityFrame title={title} help={help} detail={detail}>
            {items.length == 0 && <p className="text-white-dark">Ainda sem dados.</p>}
            {items.length > 0 && <ReactApexChart type="bar" height={50 + items.length * 30} options={options} series={[{ name: title, data: values }]} />}
        </CuriosityFrame>
    );
};
