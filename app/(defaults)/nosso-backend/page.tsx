import { BackendConcepts } from '@/presentation/pages/nosso-backend/BackendConcepts';
import { Metadata } from 'next';
import Link from 'next/link';
import React from 'react';

export const metadata: Metadata = {
    title: 'Nosso Backend',
};

const NossoBackend = () => {
    return (
        <div>
            <ul className="flex space-x-2 rtl:space-x-reverse">
                <li>
                    <Link href="#" className="text-primary hover:underline">
                        Nosso Backend
                    </Link>
                </li>
            </ul>
            <BackendConcepts />
        </div>
    );
};

export default NossoBackend;
