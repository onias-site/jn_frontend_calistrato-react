'use client';
import PanelCodeHighlight from '@/presentation/utils/panel-code-highlight';
import 'tippy.js/dist/tippy.css';
import React from 'react';

const ComponentsTablesValorServico = () => {
    const tableData = [
        {
            id: 1,
            name: 'Telegram',
            sale: 120,
        },
        {
            id: 2,
            name: 'email',
            sale: 150,
        },
        {
            id: 3,
            name: 'Whatsapp',
            sale: 200,
        },

    ];
    return (
        <PanelCodeHighlight
            title="Valor dos serviços"
        >
            <div className="table-responsive mb-5">
                <table>
                    <thead>
                        <tr>
                            <th>
                                <input type="checkbox" className="form-checkbox" />
                            </th>
                            <th>Serviços</th>
                            <th>valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableData.map((data) => {
                            return (
                                <tr key={data.id}>
                                    <td>
                                        <input type="checkbox" className="form-checkbox" />
                                    </td>
                                    <td>
                                        <div className="whitespace-nowrap">{data.name}</div>
                                    </td>
                                    <td>{data.sale}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </PanelCodeHighlight>
    );
};

export default ComponentsTablesValorServico;
