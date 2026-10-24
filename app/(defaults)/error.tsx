'use client';
import React, { useEffect } from 'react';
import { recordError } from '@/presentation/layouts/lastStackTrace';

/**
 * A tela de erro das páginas do layout padrão (a "error boundary" do Next): guarda o erro como o último stack trace, que
 * vai junto com o próximo ticket do "Fale Conosco", e oferece tentar de novo.
 */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => recordError(error), [error]);

    return (
        <div className="panel mt-6">
            <h5 className="mb-2 text-lg font-semibold">Algo deu errado nesta tela.</h5>
            <p className="mb-4">Se o problema continuar, conte para nós pelo Fale Conosco: o detalhe técnico do erro vai junto.</p>
            <button type="button" className="btn btn-primary" onClick={reset}>
                Tentar de novo
            </button>
        </div>
    );
}
