'use client';
import dynamic from 'next/dynamic';
import { SegmentedControl, Table } from '@mantine/core';
import React, { useState } from 'react';
import JnAjax from '@/app/JnAjax';
import IconCaretDown from '@/presentation/icons/icon-caret-down';
import IconFolderPlus from '@/presentation/icons/icon-folder-plus';
import IconFolderMinus from '@/presentation/icons/icon-folder-minus';
import { percentLabel, pieTotal } from '../skills/skillStatisticsData';
import { OTHERS, Slice, Source, charts, countLabel, money, regionName, regionTree, seniorities, slicesOf, sources, yearsLabel } from './supplyAndDemandData';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const API = 'http://localhost:8081';

const sliceColors = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6', '#8a8a86'];

const fontFamily = 'var(--font-nunito), ui-sans-serif, system-ui, sans-serif';

type Average = { resumes?: number; clt?: number; pj?: number; experience?: number };

type SourceStatistics = { total: number; averages: Record<string, Average>; charts: Record<string, Record<string, number>> };

type Statistics = { ddd: number } & Record<string, SourceStatistics | number>;

type Situation = 'idle' | 'loading' | 'loaded' | 'error';

const statisticsOf = (statistics: Statistics, source: Source) => statistics[source.id] as SourceStatistics | undefined;

/**
 * Um gráfico: os botões CVs, CVs vistos e Vagas trocam a fonte só deste gráfico (CVs é o padrão; Vagas ainda desligado);
 * pizza e, quando há "Outras", também barras.
 */
const ChartPanel = ({ title, chart, statistics }: { title: string; chart: string; statistics: Statistics }) => {
    const [sourceId, setSourceId] = useState(sources[0].id);
    const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');
    const source = sources.find((item) => item.id == sourceId) || sources[0];
    const slices: Slice[] = slicesOf(chart, statisticsOf(statistics, source)?.charts?.[chart]);
    const resumesLabel = (total: number) => countLabel(source, total);
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
        <div className="rounded border border-[#e0e6ed] p-3 dark:border-[#1b2e4b]">
            <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
                <h5 className="text-lg font-semibold">{title}</h5>
                <div className="flex flex-wrap gap-2">
                    <SegmentedControl
                        size="xs"
                        value={sourceId}
                        onChange={setSourceId}
                        data={sources.map((item) => ({ value: item.id, label: item.button, disabled: !item.ready }))}
                    />
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
            </div>
            {slices.length == 0 && <p className="text-white-dark">Sem {source.many} com esta informação.</p>}
            {slices.length > 0 && chartType == 'pie' && <ReactApexChart key={`pie-${sourceId}`} type="pie" height={340} options={pieOptions} series={values} />}
            {slices.length > 0 && chartType == 'bar' && (
                <ReactApexChart key={`bar-${sourceId}`} type="bar" height={40 + labels.length * 36} options={barOptions} series={[{ name: source.button, data: values }]} />
            )}
        </div>
    );
};

const moneyOrDash = (value?: number) => (value ? money(value) : '—');

/** Sem currículos na linha, "—"; com currículos, a média (0 é estágio de verdade): "4,5 anos". */
const yearsOrDash = (resumes?: number, years?: number) => (resumes ? yearsLabel(years || 0) : '—');

/** As colunas da tabela: cada uma se abre em CVs, Visualizações e Vagas. */
const columns = [
    { title: 'Currículos', value: (average: Average) => String(average.resumes || 0) },
    { title: 'Média CLT', value: (average: Average) => moneyOrDash(average.clt) },
    { title: 'Média PJ', value: (average: Average) => moneyOrDash(average.pj) },
    { title: 'Média de experiência', value: (average: Average) => yearsOrDash(average.resumes, average.experience) },
];

/** As quantidades e as médias das pretensões CLT e PJ e da experiência, por senioridade e no geral, para cada fonte. */
const AveragesTable = ({ statistics }: { statistics: Statistics }) => {
    const rows = [...seniorities.map((seniority) => ({ id: seniority.id, nome: seniority.nome })), { id: 'all', nome: 'Geral' }];
    return (
        <Table.ScrollContainer minWidth={900}>
            <Table striped withTableBorder withColumnBorders>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th rowSpan={2}>Senioridade</Table.Th>
                        {columns.map((column) => (
                            <Table.Th key={column.title} colSpan={sources.length} className="text-center">
                                {column.title}
                            </Table.Th>
                        ))}
                    </Table.Tr>
                    <Table.Tr>
                        {columns.map((column) =>
                            sources.map((source) => (
                                <Table.Th key={`${column.title}-${source.id}`} className="text-right text-xs font-semibold text-white-dark">
                                    {source.column}
                                </Table.Th>
                            )),
                        )}
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {rows.map((row) => (
                        <Table.Tr key={row.id} className={row.id == 'all' ? 'font-bold' : ''}>
                            <Table.Td>{row.nome}</Table.Td>
                            {columns.map((column) =>
                                sources.map((source) => {
                                    const average = statisticsOf(statistics, source)?.averages?.[row.id];
                                    return (
                                        <Table.Td key={`${column.title}-${source.id}`} className="whitespace-nowrap text-right">
                                            {source.ready ? column.value(average || {}) : '—'}
                                        </Table.Td>
                                    );
                                }),
                            )}
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
        </Table.ScrollContainer>
    );
};

/** "15 currículos · 7 visualizações": o total de cada fonte que já tem dados. */
const totalsLabel = (statistics: Statistics) =>
    sources
        .filter((source) => source.ready)
        .map((source) => countLabel(source, statisticsOf(statistics, source)?.total || 0))
        .join(' · ');

type RegionData = { situation: Situation; statistics?: Statistics };

type TreeNode = { value: string; label: string; children?: TreeNode[] };

const indent = (level: number) => ({ paddingLeft: `${level * 24 + 8}px` });

/** A linha de uma pasta da árvore: o recuo diz o nível, a seta e o ícone dizem se está aberta. */
const TreeRow = ({ level, open, label, detail, onToggle }: { level: number; open: boolean; label: string; detail?: string; onToggle: () => void }) => (
    <button type="button" aria-expanded={open} onClick={onToggle} style={indent(level)} className="flex w-full items-center gap-2 rounded py-1.5 pr-2 text-left hover:bg-primary/10">
        <IconCaretDown className={`h-4 w-4 shrink-0 transition-transform ${open ? '' : '-rotate-90'}`} />
        {open && <IconFolderMinus className="h-5 w-5 shrink-0 text-warning" />}
        {!open && <IconFolderPlus className="h-5 w-5 shrink-0 text-warning" />}
        <span className="font-semibold">{label}</span>
        {detail && <span className="text-sm text-white-dark">{detail}</span>}
    </button>
);

/**
 * O conteúdo de uma região aberta, recuado sob a sua pasta e na largura que sobra: os totais e as médias e, abaixo, um
 * gráfico por linha.
 */
const RegionContent = ({ ddd, level, statistics }: { ddd: string; level: number; statistics: Statistics }) => (
    <div style={{ marginLeft: `${level * 24 + 8}px` }} className="mb-4 mt-1 space-y-4">
        <div className="rounded border border-[#e0e6ed] p-3 dark:border-[#1b2e4b]">
            <h5 className="mb-1 text-lg font-semibold">Totais e médias</h5>
            <div className="mb-3 text-xl font-bold">{totalsLabel(statistics)}</div>
            <AveragesTable statistics={statistics} />
            <p className="mt-2 text-sm text-white-dark">
                As médias contam só quem informou a pretensão ou o início da experiência. Visualizações trazem o currículo como estava quando o recrutador
                o viu. Vagas: em breve.
            </p>
        </div>
        {charts.map((chart) => (
            <ChartPanel key={`${ddd}-${chart.id}`} title={chart.title} chart={chart.id} statistics={statistics} />
        ))}
    </div>
);

/**
 * As estatísticas por região como uma árvore de pastas na largura toda da página: o home office e os estados são pastas,
 * cada região é uma pasta e, aberta, mostra logo abaixo os totais e as médias e todos os gráficos. A região é lida do
 * backend na primeira vez que a sua pasta abre.
 */
export const SupplyAndDemand = () => {
    const [opened, setOpened] = useState<Set<string>>(new Set());
    const [regions, setRegions] = useState<Record<string, RegionData>>({});
    const [tree] = useState<TreeNode[]>(regionTree);

    const toggle = (id: string) =>
        setOpened((current) => {
            const next = new Set(current);
            if (next.has(id)) {
                next.delete(id);
                return next;
            }
            next.add(id);
            return next;
        });

    const setRegion = (ddd: string, data: RegionData) => setRegions((current) => ({ ...current, [ddd]: data }));

    const load = (ddd: string) => {
        setRegion(ddd, { situation: 'loading' });
        const callbacks: any = { withoutSession: true };
        callbacks[200] = (response: Statistics) => setRegion(ddd, { situation: 'loaded', statistics: response });
        callbacks['onUnexpectedHttpStatus'] = () => setRegion(ddd, { situation: 'error' });
        JnAjax.doAnAjaxRequest(`statistics/resumes/${ddd}`, callbacks, 'GET', null as any, {}, API);
    };

    const toggleRegion = (ddd: string) => {
        toggle(ddd);
        const situation = regions[ddd]?.situation;
        if (situation == 'loaded' || situation == 'loading') return;
        load(ddd);
    };

    const renderRegion = (node: TreeNode, level: number) => {
        const open = opened.has(node.value);
        const region = regions[node.value];
        const statistics = region?.statistics;
        return (
            <div key={node.value}>
                <TreeRow level={level} open={open} label={node.label} detail={statistics && totalsLabel(statistics)} onToggle={() => toggleRegion(node.value)} />
                {open && region?.situation == 'loading' && (
                    <p style={indent(level + 1)} className="py-1 text-white-dark">
                        Carregando...
                    </p>
                )}
                {open && region?.situation == 'error' && (
                    <p style={indent(level + 1)} className="py-1 text-danger">
                        Não foi possível carregar as estatísticas de {regionName(node.value)}.
                    </p>
                )}
                {open && statistics && <RegionContent ddd={node.value} level={level + 1} statistics={statistics} />}
            </div>
        );
    };

    return (
        <div className="panel mt-6">
            <h5 className="mb-1 text-lg font-semibold">Regiões metropolitanas</h5>
            <p className="mb-3 text-sm text-white-dark">Abra uma pasta para ver o que os currículos da região oferecem.</p>
            {tree.map((node) => {
                if (!node.children) return renderRegion(node, 0);
                const open = opened.has(node.value);
                const regionsLabel = `${node.children.length} ${node.children.length == 1 ? 'região' : 'regiões'}`;
                return (
                    <div key={node.value}>
                        <TreeRow level={0} open={open} label={node.label} detail={regionsLabel} onToggle={() => toggle(node.value)} />
                        {open && node.children.map((child) => renderRegion(child, 1))}
                    </div>
                );
            })}
        </div>
    );
};
