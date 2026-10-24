import { Tickets } from '@/presentation/pages/meus-dados/chamados/Tickets';
import { Metadata } from 'next';
import Link from 'next/link';
import React from 'react';

export const metadata: Metadata = {
    title: 'Chamados',
};

const Chamados = () => {
    return (
        <div>
            <ul className="flex space-x-2 rtl:space-x-reverse">
                <li>
                    <Link href="#" className="text-primary hover:underline">
                        Chamados
                    </Link>
                </li>
            </ul>
            <Tickets />
        </div>
    );
};

export default Chamados;
