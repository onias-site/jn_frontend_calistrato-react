'use client';
import dynamic from 'next/dynamic';
import React from 'react';
import { Source, countLabel, isSmallSample, sources } from './supplyAndDemandData';

/** As peças comuns aos painéis da tela Oferta X Demanda: cada gráfico fica no seu arquivo e importa daqui. */
export const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

export const fontFamily = 'var(--font-nunito), ui-sans-serif, system-ui, sans-serif';

/** As cores das fontes: CVs, CVs vistos e Vagas (linhas e barras lado a lado). */
export const lineColors = ['#2a78d6', '#eb6834', '#1baf7a'];

export type Average = { resumes?: number; clt?: number; pj?: number; experience?: number };

export type SourceStatistics = { total: number; averages: Record<string, Average>; charts: Record<string, Record<string, number>> };

export type Statistics = { ddd: number } & Record<string, SourceStatistics | number>;

export const statisticsOf = (statistics: Statistics, source: Source) => statistics[source.id] as SourceStatistics | undefined;

/** As fontes que já têm dados: cada gráfico mostra todas lado a lado (CVs e CVs vistos; Vagas quando houver). */
export const readySources = sources.filter((item) => item.ready);

/** "30 currículos · 44 visualizações": o total de cada fonte do gráfico, ao lado do título. */
export const sourceTotalsLabel = (statistics: Statistics) => readySources.map((item) => countLabel(item, statisticsOf(statistics, item)?.total || 0)).join(' · ');

/** O aviso das fontes com poucos registros na região: as porcentagens de 2 ou 3 registros não são tendência. */
export const SmallSampleWarning = ({ statistics }: { statistics: Statistics }) => {
    const small = readySources.filter((item) => isSmallSample(statisticsOf(statistics, item)?.total || 0));
    if (small.length == 0) return null;
    const texts = small.map((item) => countLabel(item, statisticsOf(statistics, item)?.total || 0)).join(' e ');
    return (
        <p className="mb-2 rounded bg-warning-light px-2 py-1 text-sm text-warning">
            Amostra pequena: só {texts} nesta região. As porcentagens oscilam muito com poucos registros.
        </p>
    );
};

/** A moldura de um painel: título, o complemento ao lado do título e a explicação abaixo. */
export const ChartFrame = ({ title, detail, note, wide, children }: { title: string; detail?: string; note?: string; wide?: boolean; children: React.ReactNode }) => (
    <div className={`rounded border border-[#e0e6ed] p-3 dark:border-[#1b2e4b] ${wide ? 'lg:col-span-2' : ''}`}>
        <h5 className="mb-1 text-lg font-semibold">
            {title}
            {detail && <span className="ml-2 text-sm font-semibold text-white-dark">{detail}</span>}
        </h5>
        {note && <p className="mb-1 text-sm text-white-dark">{note}</p>}
        {children}
    </div>
);
