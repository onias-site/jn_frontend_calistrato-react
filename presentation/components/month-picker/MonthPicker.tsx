'use client';
import React from 'react';
import { Select } from '@mantine/core';
import { FIRST_MONTH, clampMonth, selectableMonthNumbers, selectableYears, splitMonth } from './months';

export { FIRST_MONTH, currentMonth, isFutureMonth, monthParameter, previousMonth } from './months';

const monthNames: { [monthNumber: string]: string } = {
    '01': 'Janeiro',
    '02': 'Fevereiro',
    '03': 'Março',
    '04': 'Abril',
    '05': 'Maio',
    '06': 'Junho',
    '07': 'Julho',
    '08': 'Agosto',
    '09': 'Setembro',
    '10': 'Outubro',
    '11': 'Novembro',
    '12': 'Dezembro',
};

/**
 * O seletor de mês e ano das telas que mostram dados de um mês: dois selects, um do mês e outro do ano, no mesmo estilo dos
 * filtros das telas. As telas começam no mês anterior ao corrente; o ano vai do corrente até o do min opcional (yyyy-MM, por
 * padrão 2015-01) e os meses não passam do corrente nem ficam antes do min. Trocar o ano leva o mês ao limite mais próximo
 * quando ele sai da faixa.
 */
export const MonthPicker = ({ id, month, onChange, min = FIRST_MONTH, children }: { id: string; month: string; onChange: (month: string) => void; min?: string; children?: React.ReactNode }) => {
    const { year, monthNumber } = splitMonth(month);
    return (
        <div className="mb-4 flex flex-wrap items-center gap-3">
            <label htmlFor={id} className="mb-0 font-semibold">
                Mês/ano
            </label>
            <Select
                id={id}
                aria-label="Mês"
                className="w-40"
                value={monthNumber}
                onChange={(value) => value && onChange(`${year}-${value}`)}
                data={selectableMonthNumbers(year, min).map((item) => ({ value: item, label: monthNames[item] }))}
                allowDeselect={false}
                comboboxProps={{ withinPortal: false }}
            />
            <Select
                aria-label="Ano"
                className="w-28"
                value={year}
                onChange={(value) => value && onChange(clampMonth(`${value}-${monthNumber}`, min))}
                data={selectableYears(min).map((item) => ({ value: String(item), label: String(item) }))}
                allowDeselect={false}
                comboboxProps={{ withinPortal: false }}
            />
            {children}
        </div>
    );
};
