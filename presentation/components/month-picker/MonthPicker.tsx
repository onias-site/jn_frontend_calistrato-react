'use client';
import React from 'react';
import { currentMonth } from './months';

export { currentMonth, isFutureMonth, monthParameter } from './months';

/**
 * O seletor de mês e ano das telas que mostram dados de um mês: começa no mês corrente, não passa dele e volta a ele
 * quando o campo é limpo (sem escolha vale o mês corrente).
 */
export const MonthPicker = ({ id, month, onChange, children }: { id: string; month: string; onChange: (month: string) => void; children?: React.ReactNode }) => (
    <div className="mb-4 flex flex-wrap items-center gap-3">
        <label htmlFor={id} className="mb-0 font-semibold">
            Mês/ano
        </label>
        <input id={id} type="month" className="form-input w-auto" value={month} max={currentMonth()} onChange={(event) => onChange(event.target.value || currentMonth())} />
        {children}
    </div>
);
