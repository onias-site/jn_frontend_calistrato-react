'use client';
import React from 'react';
import { currentMonth, previousMonth } from './months';

export { currentMonth, isFutureMonth, monthParameter, previousMonth } from './months';

/**
 * O seletor de mês e ano das telas que mostram dados de um mês: as telas começam no mês anterior ao corrente, ele não passa
 * do mês corrente e, quando o campo é limpo, volta ao mês anterior (sem escolha vale o mês anterior).
 */
export const MonthPicker = ({ id, month, onChange, children }: { id: string; month: string; onChange: (month: string) => void; children?: React.ReactNode }) => (
    <div className="mb-4 flex flex-wrap items-center gap-3">
        <label htmlFor={id} className="mb-0 font-semibold">
            Mês/ano
        </label>
        <input id={id} type="month" className="form-input w-auto" value={month} max={currentMonth()} onChange={(event) => onChange(event.target.value || previousMonth())} />
        {children}
    </div>
);
