'use client';
import dynamic from 'next/dynamic';
import React from 'react';
import { HelpButton } from '@/presentation/components/source/HelpButton';

/** As peças comuns aos painéis da tela Curiosidades: cada gráfico fica no seu arquivo e importa daqui. */
export const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

export const fontFamily = 'var(--font-nunito), ui-sans-serif, system-ui, sans-serif';

export const sliceColors = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6', '#8a8a86'];

/** A moldura de um painel: título, o "?" quando há explicação, o complemento ao lado do título e a nota abaixo. */
export const CuriosityFrame = ({ title, help, detail, note, children }: { title: string; help?: string; detail?: string; note?: string; children: React.ReactNode }) => (
    <div className="rounded border border-[#e0e6ed] p-3 dark:border-[#1b2e4b]">
        <div className="mb-2 flex items-center gap-1">
            <h5 className="text-lg font-semibold">{title}</h5>
            {help && <HelpButton title={title} explanation={help} tooltip="Clique aqui para entender este gráfico" />}
            {detail && <span className="ml-2 text-sm font-semibold text-white-dark">{detail}</span>}
        </div>
        {note && <p className="mb-1 text-sm text-white-dark">{note}</p>}
        {children}
    </div>
);
