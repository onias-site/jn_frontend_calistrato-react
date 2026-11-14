'use client';
import dynamic from 'next/dynamic';
import { SegmentedControl, Table, Tree, TreeNodeData } from '@mantine/core';
import React, { useState } from 'react';
import JnAjax from '@/app/JnAjax';
import IconFolder from '@/presentation/icons/icon-folder';
import IconFolderPlus from '@/presentation/icons/icon-folder-plus';
import IconFolderMinus from '@/presentation/icons/icon-folder-minus';
import { percentLabel, pieTotal } from '../skills/skillStatisticsData';
import { OTHERS, Slice, charts, money, regionName, yearsLabel, regionTree, seniorities, slicesOf } from './supplyAndDemandData';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const API = 'http://localhost:8081';

const sliceColors = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6', '#8a8a86'];

const fontFamily = 'var(--font-nunito), ui-sans-serif, system-ui, sans-serif';

type Average = { resumes?: number; clt?: number; pj?: number; experience?: number };

type Statistics = { ddd: number; total: number; averages: Record<string, Average>; charts: Record<string, Record<string, number>> };

type Situation = 'idle' | 'loading' | 'loaded' | 'error';

const resumesLabel = (total: number) => `${total} ${total == 1 ? 'currículo' : 'currículos'}`;

/** Um gráfico: pizza; quando há "Outras", também em barras. */
const ChartPanel = ({ title, slices }: { title: string; slices: Slice[] }) => {
    const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');
    const labels = slices.map((slice) => slice.label);
    const values = slices.map((slice) => slice.total);
    const total = pieTotal(values);
    const manySlices = slices.some((slice) => slice.key == OTHERS);

    const pieOptions: any = {
        chart: { type: 'pie', fontFamily },
        labels,
        colors: sliceColors,
        stroke: { width: 2 },
        plotOptions: { pie: { dataLabels: { minAngleToShowLabel: 18 } } },
        legend: { position: 'bottom', formatter: (label: string, legend: any) => `${label}: ${percentLabel(values[legend.seriesIndex], total)}` },
        dataLabels: { enabled: true, formatter: (percent: number, dataLabel: any) => percentLabel(values[dataLabel.seriesIndex], total) },
        tooltip: { y: { formatter: (value: number) => resumesLabel(value) } },
    };

    const barOptions: any = {
        chart: { type: 'bar', fontFamily, toolbar: { show: false }, animations: { enabled: false } },
        colors: sliceColors,
        plotOptions: { bar: { horizontal: true, distributed: true, borderRadius: 6, barHeight: '60%', dataLabels: { position: 'top' } } },
        xaxis: { categories: labels, labels: { show: false }, axisBorder: { show: false }, axisTicks: { show: false }, max: Math.max(...values, 1) * 1.45 },
        yaxis: { labels: { style: { fontSize: '13px', fontWeight: 600, colors: '#0e1726' }, maxWidth: 200 } },
        dataLabels: {
            enabled: true,
            textAnchor: 'start',
            offsetX: 8,
            style: { fontSize: '12px', fontWeight: 600, colors: ['#3b3f5c'] },
            formatter: (value: number) => `${resumesLabel(value)}  ·  ${percentLabel(value, total)}`,
            dropShadow: { enabled: false },
        },
        legend: { show: false },
        grid: { show: false, padding: { left: 8, right: 16 } },
        tooltip: { enabled: false },
        states: { hover: { filter: { type: 'none' } }, active: { filter: { type: 'none' } } },
    };

    return (
        <div className="panel">
            <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
                <h5 className="text-lg font-semibold">{title}</h5>
                {manySlices && slices.length > 0 && (
                    <SegmentedControl
                        size="xs"
                        value={chartType}
                        onChange={(value) => setChartType(value as 'pie' | 'bar')}
                        data={[
                            { value: 'pie', label: 'Pizza' },
                            { value: 'bar', label: 'Barras' },
                        ]}
                    />
                )}
            </div>
            {slices.length == 0 && <p className="text-white-dark">Nenhum currículo informou.</p>}
            {slices.length > 0 && chartType == 'pie' && <ReactApexChart type="pie" height={340} options={pieOptions} series={values} />}
            {slices.length > 0 && chartType == 'bar' && <ReactApexChart type="bar" height={40 + labels.length * 36} options={barOptions} series={[{ name: 'Currículos', data: values }]} />}
        </div>
    );
};

const moneyOrDash = (value?: number) => (value ? money(value) : '—');

/** Sem currículos na linha, "—"; com currículos, a média (0 é estágio de verdade): "4,5 anos". */
const yearsOrDash = (resumes?: number, years?: number) => (resumes ? yearsLabel(years || 0) : '—');

/** Os totais de currículos e as médias das pretensões CLT e PJ por senioridade e no geral. */
const AveragesTable = ({ averages }: { averages: Record<string, Average> }) => {
    const rows = [...seniorities.map((seniority) => ({ id: seniority.id, nome: seniority.nome })), { id: 'all', nome: 'Geral' }];
    return (
        <Table striped withTableBorder withColumnBorders>
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>Senioridade</Table.Th>
                    <Table.Th className="text-right">Currículos</Table.Th>
                    <Table.Th className="text-right">Média CLT</Table.Th>
                    <Table.Th className="text-right">Média PJ</Table.Th>
                    <Table.Th className="text-right">Média de experiência</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {rows.map((row) => {
                    const average = averages[row.id] || {};
                    return (
                        <Table.Tr key={row.id} className={row.id == 'all' ? 'font-bold' : ''}>
                            <Table.Td>{row.nome}</Table.Td>
                            <Table.Td className="text-right">{average.resumes || 0}</Table.Td>
                            <Table.Td className="text-right">{moneyOrDash(average.clt)}</Table.Td>
                            <Table.Td className="text-right">{moneyOrDash(average.pj)}</Table.Td>
                            <Table.Td className="text-right">{yearsOrDash(average.resumes, average.experience)}</Table.Td>
                        </Table.Tr>
                    );
                })}
            </Table.Tbody>
        </Table>
    );
};

const isState = (value: string) => value.startsWith('uf-');

/** As estatísticas dos currículos de uma região: as pastas à esquerda, os totais, as médias e os gráficos à direita. */
export const SupplyAndDemand = () => {
    const [ddd, setDdd] = useState('');
    const [situation, setSituation] = useState<Situation>('idle');
    const [statistics, setStatistics] = useState<Statistics | null>(null);
    const [treeData] = useState<TreeNodeData[]>(regionTree);

    const load = (region: string) => {
        setDdd(region);
        setSituation('loading');
        const callbacks: any = { withoutSession: true };
        callbacks[200] = (response: Statistics) => {
            setStatistics(response);
            setSituation('loaded');
        };
        callbacks['onUnexpectedHttpStatus'] = () => setSituation('error');
        JnAjax.doAnAjaxRequest(`statistics/resumes/${region}`, callbacks, 'GET', null as any, {}, API);
    };

    return (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
            <div className="panel max-h-[80vh] overflow-y-auto">
                <h5 className="mb-3 text-lg font-semibold">Regiões metropolitanas</h5>
                <Tree
                    data={treeData}
                    levelOffset={20}
                    renderNode={({ node, expanded, hasChildren, elementProps }) => (
                        <div
                            {...elementProps}
                            onClick={(event) => {
                                elementProps.onClick(event);
                                if (!isState(node.value)) load(node.value);
                            }}
                            className={`${elementProps.className} flex cursor-pointer items-center gap-2 rounded px-1 py-1 ${node.value == ddd ? 'bg-primary/10 font-semibold text-primary' : ''}`}
                        >
                            {hasChildren && expanded && <IconFolderMinus className="h-4 w-4 shrink-0" />}
                            {hasChildren && !expanded && <IconFolderPlus className="h-4 w-4 shrink-0" />}
                            {!hasChildren && <IconFolder className="h-4 w-4 shrink-0" />}
                            <span>{node.label}</span>
                        </div>
                    )}
                />
            </div>
            <div>
                {situation == 'idle' && <div className="panel">Escolha uma região metropolitana para ver o que os currículos dela oferecem.</div>}
                {situation == 'loading' && <div className="panel">Carregando {regionName(ddd)}...</div>}
                {situation == 'error' && <div className="panel text-danger">Não foi possível carregar as estatísticas de {regionName(ddd)}.</div>}
                {situation == 'loaded' && statistics && (
                    <>
                        <div className="panel mb-6">
                            <h5 className="mb-1 text-lg font-semibold">{regionName(ddd)}</h5>
                            <div className="mb-3 text-2xl font-bold">{resumesLabel(statistics.total)}</div>
                            <AveragesTable averages={statistics.averages || {}} />
                            <p className="mt-2 text-sm text-white-dark">As médias contam só os currículos que informaram a pretensão.</p>
                        </div>
                        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                            {charts.map((chart) => (
                                <ChartPanel key={`${ddd}-${chart.id}`} title={chart.title} slices={slicesOf(chart.id, statistics.charts?.[chart.id])} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
