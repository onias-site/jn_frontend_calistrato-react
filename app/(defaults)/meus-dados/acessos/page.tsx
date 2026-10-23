import { LoginHistory } from '@/presentation/pages/meus-dados/acessos/LoginHistory';
import { Metadata } from 'next';
import Link from 'next/link';
import React from 'react';

export const metadata: Metadata = {
    title: 'Acessos',
};

const Acessos = () => {
    return (
        <div>
            <ul className="flex space-x-2 rtl:space-x-reverse">
                <li>
                    <Link href="#" className="text-primary hover:underline">
                        Acessos
                    </Link>
                </li>
            </ul>
            <LoginHistory />
        </div>
    );
};

export default Acessos;
