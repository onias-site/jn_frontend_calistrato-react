'use client';
import React from 'react';
import { CuriosityFrame, ReactApexChart, fontFamily } from './curiositiesCommons';
import { newUsersByWeekday, weekdays } from './moreCuriositiesData';

const averageText = (value: number) => value.toLocaleString('pt-BR', { maximumFractionDigits: 1 });

/** Sugestão 8 (2026-11-17): a média de novos usuários em cada dia da semana (o contador por dia que a linha já usa). */
export const NewUsersWeekdayPanel = ({ byDay }: { byDay?: Record<string, number> }) => {
    const { days, data } = newUsersByWeekday(byDay, new Date());
    const options: any = {
        chart: { type: 'bar', fontFamily, toolbar: { show: false }, animations: { enabled: false } },
        colors: ['#2a78d6'],
        plotOptions: { bar: { columnWidth: '60%', borderRadius: 3, dataLabels: { position: 'top' } } },
        xaxis: { categories: weekdays },
        yaxis: { labels: { formatter: (value: number) => averageText(value) } },
        dataLabels: { enabled: true, offsetY: -18, style: { fontSize: '11px', colors: ['#3b3f5c'] }, formatter: (value: number) => averageText(value) },
        tooltip: { y: { formatter: (value: number) => `${averageText(value)} por dia, em média` } },
        grid: { borderColor: '#e0e6ed' },
    };
    return (
        <CuriosityFrame
            title="Novos usuários por dia da semana"
            detail={days ? `média de ${days} ${days == 1 ? 'dia' : 'dias'}` : undefined}
            note="Média de novos usuários em cada dia da semana, até ontem; os dias sem nenhum contam como zero."
        >
            {days == 0 && <p className="text-white-dark">Ainda não há dias completos no contador.</p>}
            {days > 0 && <ReactApexChart type="bar" height={300} options={options} series={[{ name: 'Novos usuários', data }]} />}
        </CuriosityFrame>
    );
};
