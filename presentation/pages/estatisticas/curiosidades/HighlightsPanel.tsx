'use client';
import React from 'react';
import { Curiosities } from './curiositiesData';
import { highlightsOf } from './moreCuriositiesData';

/**
 * Sugestões 4 e 5 (2026-11-17): os números de destaque no topo da tela, em cartões; o de currículos ativos traz a taxa
 * de desistência (os desativados sobre todos), que substitui a pizza "Situação do Currículo".
 */
export const HighlightsPanel = ({ curiosities }: { curiosities: Curiosities }) => (
    <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {highlightsOf(curiosities, new Date()).map((highlight) => (
            <div key={highlight.label} className="rounded border border-[#e0e6ed] p-3 dark:border-[#1b2e4b]">
                <div className="text-sm font-semibold text-white-dark">{highlight.label}</div>
                <div className="text-3xl font-bold text-primary">{highlight.value}</div>
                {highlight.detail && <div className="text-xs text-white-dark">{highlight.detail}</div>}
            </div>
        ))}
    </div>
);
