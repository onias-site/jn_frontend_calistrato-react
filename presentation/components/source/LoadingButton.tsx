'use client';
import React from 'react';
import IconLoader from '@/presentation/icons/icon-loader';

export interface LoadingButtonProps {
    onClick: () => void;
    loading: boolean;
    invalid: boolean;
    label: string;
    // padrão: o botão primário de largura total do ModalLogin
    className?: string;
    style?: React.CSSProperties;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({ onClick, label, loading, invalid, className = 'btn btn-primary w-full', style }) => {
    const getInconLoader = () => {
        if (!loading) {
            return null;
        }

        return <IconLoader className="inline-block shrink-0 animate-[spin_2s_linear_infinite] align-middle ltr:mr-2 rtl:ml-2" />;
    };

    return (
        <button disabled={loading || invalid} type="button" className={className} style={style} onClick={onClick}>
            {getInconLoader()}
            {label}
        </button>
    );
};
