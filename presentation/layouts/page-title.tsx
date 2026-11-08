import React from 'react';

/** O título da página, acima do painel de conteúdo (até 2026-11-08 era um link azul para "#", que parecia clicável e não levava a nada). */
const PageTitle = ({ children, description }: { children: React.ReactNode; description?: string }) => (
    <div>
        <h1 className="text-xl font-bold text-dark dark:text-white-light">{children}</h1>
        {description && <p className="mt-1 text-sm text-white-dark">{description}</p>}
    </div>
);

export default PageTitle;
