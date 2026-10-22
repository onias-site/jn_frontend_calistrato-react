'use client';
import React from 'react';

/** O mês corrente no formato do campo de mês do navegador (yyyy-MM). */
export const currentMonth = () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${now.getFullYear()}-${month}`;
};

/** O mês como a API o recebe (yyyyMM). */
export const monthParameter = (month: string) => month.replace('-', '');

/**
 * O seletor de mês e ano das telas que mostram dados de um mês: começa no mês corrente, não passa dele e volta a ele
 * quando o campo é limpo (sem escolha vale o mês corrente).
 */
export const MonthPicker = ({ id, month, onChange }: { id: string; month: string; onChange: (month: string) => void }) => (
    <div className="mb-4 flex flex-wrap items-center gap-3">
        <label htmlFor={id} className="mb-0 font-semibold">
            Mês/ano
        </label>
        <input id={id} type="month" className="form-input w-auto" value={month} max={currentMonth()} onChange={(event) => onChange(event.target.value || currentMonth())} />
    </div>
);
