'use client';
import React, { useState } from 'react';
import { TextInput } from '@mantine/core';
import JnAjax from '@/app/JnAjax';
import { LoadingButton } from '@/presentation/components/source/LoadingButton';
import { notify } from '@/presentation/components/source/notify';
import { Position, fromDateInput, keyBodyOf, positionKey, today } from './positionsData';

type ReactivatePositionFormProps = {
    position: Position;
    // key: a chave da vaga (positionKey), o mês de criação e o título
    onReactivated: (key: string, expiration: { min: any; max: any }) => void;
    onCancel: () => void;
};

/**
 * O modal de "Reativar" de uma vaga expirada (desde 2026-11-21): o novo fim da vaga é obrigatório e não pode ser antes de
 * hoje; a vaga vale até o fim do dia escolhido e volta para a aba "Vagas dentro da expiração".
 */
export const ReactivatePositionForm = ({ position, onReactivated, onCancel }: ReactivatePositionFormProps) => {
    const [expirationMax, setExpirationMax] = useState('');
    const [saving, setSaving] = useState(false);
    const invalid = !expirationMax || expirationMax < today();

    const save = () => {
        if (invalid) return;
        setSaving(true);
        const max = String(fromDateInput(expirationMax, true));
        const callbacks: any = {};
        callbacks[200] = (response: any) => {
            setSaving(false);
            notify({ summary: 'Vaga reativada', detail: 'A vaga voltou para a aba das vagas dentro da expiração.' });
            onReactivated(positionKey(position), response.expiration || { min: position.expiration.min, max });
        };
        callbacks[404] = () => {
            setSaving(false);
            notify({ summary: 'Vaga não encontrada', detail: 'Esta vaga não está mais entre as suas.', severity: 'error' });
        };
        callbacks[422] = () => {
            setSaving(false);
            notify({ summary: 'Data inválida', detail: 'O novo fim da vaga não pode ser antes de hoje.', severity: 'error' });
        };
        callbacks[401] = () => {
            // sem login o JnAjax chama o 401 antes de enviar, e não desliga o carregamento que já ligou
            JnAjax.setNotLoading()();
            setSaving(false);
            JnAjax.getHandler401(save)();
        };
        callbacks['onUnexpectedHttpStatus'] = () => {
            setSaving(false);
            notify({ summary: 'Não foi possível reativar', detail: 'Tente de novo em alguns instantes.', severity: 'error' });
        };
        JnAjax.doAnAjaxRequest('recruiter/{email}/positions/reactivate', callbacks, 'POST', { ...keyBodyOf(position), max }, {}, 'http://localhost:8081');
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="text-sm">{position.title}</div>
            <TextInput
                type="date"
                label="Expira em"
                description="Obrigatório: o novo fim da vaga, de hoje em diante."
                value={expirationMax}
                min={today()}
                withAsterisk
                onChange={(event) => setExpirationMax(event.currentTarget.value)}
                error={expirationMax && expirationMax < today() ? 'O fim da vaga não pode ser antes de hoje' : undefined}
            />
            <div className="flex justify-end gap-2">
                <button type="button" className="btn btn-outline-dark" onClick={onCancel} disabled={saving}>
                    Cancelar
                </button>
                <LoadingButton className="btn btn-primary" label="Reativar" loading={saving} invalid={invalid} onClick={save} />
            </div>
        </div>
    );
};
