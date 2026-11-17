'use client';
import dynamic from 'next/dynamic';
import { SegmentedControl } from '@mantine/core';
import React, { useEffect, useState } from 'react';
import JnAjax from '@/app/JnAjax';
import { HelpButton } from '@/presentation/components/source/HelpButton';
import { percentLabel, pieTotal } from '../skills/skillStatisticsData';
import { daysOfTheMonth, lastMonths, monthTitle } from '../oferta-x-demanda/supplyAndDemandData';
import { Curiosities as CuriositiesData, newUsersSeries, pies, slicesOf, totalLabel } from './curiositiesData';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const API = 'http://localhost:8081';

const sliceColors = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6', '#8a8a86'];

const fontFamily = 'var(--font-nunito), ui-sans-serif, system-ui, sans-serif';

type Situation = 'loading' | 'loaded' | 'error';

/** Os novos usuários (respostas do questionário do cadastro) por dia do mês corrente ou pelos últimos 12 meses. */
const NewUsersPanel = ({ curiosities }: { curiosities: CuriositiesData }) => {
    const [period, setPeriod] = useState<'day' | 'month'>('day');
    const now = new Date();
    const byDay = period == 'day';
    const periods = byDay ? daysOfTheMonth(now) : lastMonths(now, 12);
    const series = newUsersSeries(byDay ? curiosities.newUsersByDay : curiosities.newUsersByMonth, periods);
    const title = byDay ? `Novos usuários por dia — ${monthTitle(now)}` : 'Novos usuários por mês — últimos 12 meses';

    const options: any = {
        chart: { type: 'line', fontFamily, toolbar: { show: false }, zoom: { enabled: false } },
        colors: sliceColors,
        stroke: { width: 3, curve: 'straight' },
        markers: { size: 4 },
        xaxis: { categories: periods.map((item) => item.label) },
        yaxis: { min: 0, forceNiceScale: true, labels: { formatter: (value: number) => String(Math.round(value)) } },
        legend: { show: false },
        grid: { borderColor: '#e0e6ed' },
        dataLabels: { enabled: false },
    };

    return (
        <div className="mb-4 rounded border border-[#e0e6ed] p-3 dark:border-[#1b2e4b]">
            <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
                <h5 className="text-lg font-semibold">{title}</h5>
                <SegmentedControl
                    size="xs"
                    value={period}
                    onChange={(value) => setPeriod(value as 'day' | 'month')}
                    data={[
                        { value: 'day', label: 'Por dia' },
                        { value: 'month', label: 'Por mês' },
                    ]}
                />
            </div>
            <ReactApexChart key={`line-${period}`} type="line" height={300} options={options} series={series} />
        </div>
    );
};

/** Uma pizza, com o "?" ao lado do título quando há explicação e o total geral das fatias. */
const PiePanel = ({ title, help, counts, labels, excluded }: { title: string; help?: string; counts?: Record<string, number>; labels?: Record<string, string>; excluded?: string[] }) => {
    const slices = slicesOf(counts, labels, excluded);
    const values = slices.map((slice) => slice.total);
    const total = pieTotal(values);

    const options: any = {
        chart: { type: 'pie', fontFamily },
        labels: slices.map((slice) => slice.label),
        colors: sliceColors,
        stroke: { width: 2 },
        plotOptions: { pie: { dataLabels: { minAngleToShowLabel: 18 } } },
        legend: { position: 'bottom', formatter: (label: string, legend: any) => `${label}: ${values[legend.seriesIndex]} (${percentLabel(values[legend.seriesIndex], total)})` },
        dataLabels: { enabled: true, formatter: (percent: number, dataLabel: any) => percentLabel(values[dataLabel.seriesIndex], total) },
        tooltip: { y: { formatter: (value: number) => String(value) } },
    };

    return (
        <div className="rounded border border-[#e0e6ed] p-3 dark:border-[#1b2e4b]">
            <div className="mb-2 flex items-center gap-1">
                <h5 className="text-lg font-semibold">{title}</h5>
                {help && <HelpButton title={title} explanation={help} tooltip="Clique aqui para entender este gráfico" />}
                {slices.length > 0 && <span className="ml-2 text-sm font-semibold text-white-dark">{totalLabel(total)}</span>}
            </div>
            {slices.length == 0 && <p className="text-white-dark">Ainda sem dados.</p>}
            {slices.length > 0 && <ReactApexChart type="pie" height={340} options={options} series={values} />}
        </div>
    );
};

/**
 * A tela Curiosidades: os novos usuários no tempo e 10 pizzas, todos de uma só leitura (GET statistics/curiosities, que
 * busca os grupos do jn_grouper por id), guardada no localStorage por 1 hora (JnAjax.doAPersistedRequest).
 */
export const Curiosities = () => {
    const [situation, setSituation] = useState<Situation>('loading');
    const [curiosities, setCuriosities] = useState<CuriositiesData>({});

    useEffect(() => {
        const callbacks: any = { withoutSession: true };
        callbacks[200] = (response: CuriositiesData) => {
            setCuriosities(response);
            setSituation('loaded');
        };
        callbacks['onUnexpectedHttpStatus'] = () => setSituation('error');
        JnAjax.doAPersistedRequest('statistics/curiosities', callbacks, API, JnAjax.PERSISTED_REQUEST_ONE_HOUR);
    }, []);

    if (situation == 'loading') return <div className="panel mt-6 text-white-dark">Carregando...</div>;
    if (situation == 'error') return <div className="panel mt-6 text-danger">Não foi possível carregar as curiosidades.</div>;
    return (
        <div className="panel mt-6">
            <NewUsersPanel curiosities={curiosities} />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {pies.map((pie) => (
                    <PiePanel key={pie.id} title={pie.title} help={pie.help} counts={curiosities[pie.id]} labels={pie.labels} excluded={pie.excluded} />
                ))}
            </div>
        </div>
    );
};
