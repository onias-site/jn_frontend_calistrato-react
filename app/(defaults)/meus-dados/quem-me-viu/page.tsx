import { ResumeViewersOfTheMonth } from '@/presentation/pages/meus-dados/quem-me-viu/ResumeViewersOfTheMonth';
import { Metadata } from 'next';
import Link from 'next/link';
import React from 'react';

export const metadata: Metadata = {
    title: 'Quem me viu',
};

const QuemMeViu = () => {
    return (
        <div>
            <ul className="flex space-x-2 rtl:space-x-reverse">
                <li>
                    <Link href="#" className="text-primary hover:underline">
                        Quem me viu
                    </Link>
                </li>
            </ul>
            <ResumeViewersOfTheMonth />
        </div>
    );
};

export default QuemMeViu;
