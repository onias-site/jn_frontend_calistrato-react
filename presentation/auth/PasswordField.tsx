'use client';
import React from 'react';
import { PasswordInput, Progress } from '@mantine/core';

export interface PasswordFieldProps {
    id: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    readOnly?: boolean;
    // mostra a barra de força da senha abaixo do campo
    withStrength?: boolean;
}

// as mesmas exigências da senha no backend: 8 caracteres, maiúscula, minúscula, número e caractere especial
const requirements = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/, /.{8,}/];

const strengthOf = (password: string) => requirements.filter((requirement) => requirement.test(password || '')).length;

const strengthLabels = ['', 'Senha fácil de descobrir', 'Senha fácil de descobrir', 'Senha de força média', 'Senha de força média', 'Senha difícil de descobrir'];
const strengthColors = ['gray', 'red', 'red', 'yellow', 'yellow', 'teal'];

/** Campo de senha com o botão de mostrar/esconder e, opcionalmente, a barra de força. */
export const PasswordField: React.FC<PasswordFieldProps> = ({ id, value, onChange, placeholder, readOnly, withStrength = false }) => {
    const strength = strengthOf(value);
    return (
        <div>
            <PasswordInput id={id} value={value || ''} placeholder={placeholder} readOnly={readOnly} onChange={(e) => onChange(e.currentTarget.value)} autoComplete="off" />
            {withStrength && value && (
                <div className="mt-2">
                    <Progress value={(strength / requirements.length) * 100} color={strengthColors[strength]} size="xs" />
                    <div className="mt-1 text-xs text-white-dark">{strengthLabels[strength]}</div>
                </div>
            )}
        </div>
    );
};
