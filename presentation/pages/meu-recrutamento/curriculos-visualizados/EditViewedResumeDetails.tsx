'use client';
import React, { useState } from 'react';
import { Textarea, TextInput } from '@mantine/core';
import JnAjax from '@/app/JnAjax';
import { LoadingButton } from '@/presentation/components/source/LoadingButton';
import { notify } from '@/presentation/components/source/notify';
import { ViewedResume, detailsErrors } from './viewedResumesData';

type EditViewedResumeDetailsProps = {
    // o mês da visualização (yyyyMM), ou "all" com "Listar todos" marcado
    period: string;
    view: ViewedResume;
    onSaved: (alias: string, comment: string) => void;
    onCancel: () => void;
};

/**
 * O formulário "Editar detalhes" de uma linha da tela de currículos visualizados (desde 2026-11-15): apelido e comentário.
 * O back end grava no lado em que a visualização está, então uma visualização da aba "Indesejados" continua lá. A
 * gravação é assíncrona: a tela atualiza a linha com o que foi enviado, sem reler a lista.
 */
export const EditViewedResumeDetails = ({ period, view, onSaved, onCancel }: EditViewedResumeDetailsProps) => {
    const [alias, setAlias] = useState(view.alias || '');
    const [comment, setComment] = useState(view.comment || '');
    const [saving, setSaving] = useState(false);
    const [touched, setTouched] = useState(false);
    const errors = detailsErrors(alias, comment, view.comment);
    const invalid = Object.keys(errors).length > 0;

    const save = () => {
        setTouched(true);
        if (invalid) return;
        setSaving(true);
        const trimmedAlias = alias.trim();
        const trimmedComment = comment.trim();
        const requestBody: any = { linkedinHash: view.linkedinHash, alias: trimmedAlias };
        if (trimmedComment) requestBody.comment = trimmedComment;
        const callbacks: any = {};
        callbacks[200] = () => {
            setSaving(false);
            notify({ summary: 'Detalhes salvos', detail: 'O apelido e o comentário deste currículo foram atualizados.' });
            onSaved(trimmedAlias, trimmedComment);
        };
        callbacks[404] = () => {
            setSaving(false);
            notify({ summary: 'Currículo não encontrado', detail: 'Este currículo não está entre os que você visualizou neste mês.', severity: 'error' });
        };
        callbacks[422] = () => {
            setSaving(false);
            notify({ summary: 'Dados inválidos', detail: 'Confira o apelido (5 a 200 caracteres) e o comentário (10 a 500).', severity: 'error' });
        };
        callbacks[401] = () => {
            // sem login o JnAjax chama o 401 antes de enviar, e não desliga o carregamento que já ligou
            JnAjax.setNotLoading()();
            setSaving(false);
            JnAjax.getHandler401(save)();
        };
        callbacks['onUnexpectedHttpStatus'] = () => {
            setSaving(false);
            notify({ summary: 'Não foi possível salvar', detail: 'Tente de novo em alguns instantes.', severity: 'error' });
        };
        JnAjax.doAnAjaxRequest(`recruiter/{email}/viewed-resumes/${period}/edit`, callbacks, 'POST', requestBody, {}, 'http://localhost:8081');
    };

    return (
        <div className="flex flex-col gap-4">
            <TextInput
                label="Apelido"
                description="Como você quer reconhecer este currículo (5 a 200 caracteres)."
                value={alias}
                maxLength={200}
                withAsterisk
                onChange={(event) => setAlias(event.currentTarget.value)}
                onBlur={() => setTouched(true)}
                error={touched && errors.alias}
            />
            <Textarea
                label="Comentário"
                description="Opcional: uma anotação sua sobre o currículo (10 a 500 caracteres)."
                value={comment}
                maxLength={500}
                autosize
                minRows={3}
                maxRows={8}
                onChange={(event) => setComment(event.currentTarget.value)}
                onBlur={() => setTouched(true)}
                error={touched && errors.comment}
            />
            <div className="flex justify-end gap-2">
                <button type="button" className="btn btn-outline-dark" onClick={onCancel} disabled={saving}>
                    Cancelar
                </button>
                <LoadingButton className="btn btn-primary" label="Salvar" loading={saving} invalid={touched && invalid} onClick={save} />
            </div>
        </div>
    );
};
