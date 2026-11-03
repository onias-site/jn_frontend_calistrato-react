'use client';
import JnAjax from '@/app/JnAjax';
import { getTranslation } from '@/i18n';
import React, { useEffect, useState } from 'react';

type Block = { kind: 'title' | 'section' | 'item' | 'paragraph'; text: string };

// idioma do cookie do front -> JnLanguage do back end; sem cookie vale o locale do tema ('br'), e o que não tem texto
// próprio recebe o inglês do back end
const BACKEND_LANGUAGES: Record<string, string> = { br: 'portuguese', en: 'english', es: 'spanish' };

const NOT_LOADED: Record<string, string> = {
    portuguese: 'Não foi possível carregar a política de privacidade agora. Tente de novo em alguns instantes.',
    english: 'The privacy policy could not be loaded now. Try again in a few moments.',
};

// uma linha por bloco: '# ' título da página, '## ' título de seção, '- ' item de lista, o resto é parágrafo
const toBlocks = (text: string): Block[] =>
    text
        .split('\n')
        .filter((line) => line.trim())
        .map((line) => {
            if (line.startsWith('# ')) return { kind: 'title', text: line.substring(2) };
            if (line.startsWith('## ')) return { kind: 'section', text: line.substring(3) };
            if (line.startsWith('- ')) return { kind: 'item', text: line.substring(2) };
            return { kind: 'paragraph', text: line };
        });

// agrupa os itens seguidos numa só lista
const toElements = (blocks: Block[]) => {
    const elements: React.ReactNode[] = [];
    let items: string[] = [];
    const closeList = () => {
        if (!items.length) return;
        elements.push(
            <ul key={`list-${elements.length}`} className="list-disc space-y-1 pl-6">
                {items.map((item) => (
                    <li key={item}>{item}</li>
                ))}
            </ul>,
        );
        items = [];
    };
    blocks.forEach((block) => {
        if (block.kind == 'item') {
            items.push(block.text);
            return;
        }
        closeList();
        const key = `${block.kind}-${elements.length}`;
        if (block.kind == 'title') elements.push(<h1 key={key} className="text-2xl font-bold">{block.text}</h1>);
        if (block.kind == 'section') elements.push(<h2 key={key} className="pt-4 text-lg font-semibold">{block.text}</h2>);
        if (block.kind == 'paragraph') elements.push(<p key={key}>{block.text}</p>);
    });
    closeList();
    return elements;
};

/**
 * A política de privacidade do JobsNow, pública (sem login), apontada pelo rodapé de todos os e-mails. O texto vem do
 * back end (GET /privacy-policy da API js, semeado em jn_system_message), no idioma escolhido no front, e fica 24 horas
 * no localStorage.
 */
export const PrivacyPolicy = () => {
    const { i18n } = getTranslation();
    const language = BACKEND_LANGUAGES[i18n.language || 'br'] || 'english';
    const [text, setText] = useState('');
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        const callbacks: any = {};
        callbacks['setLoading'] = () => {};
        callbacks['setNotLoading'] = () => {};
        // página pública: não há sessão nem 401 a tratar
        callbacks['getLogin'] = () => ({});
        callbacks[200] = (response: any) => setText(response.message);
        callbacks['onUnexpectedHttpStatus'] = () => setFailed(true);
        // no localStorage por 24 horas (um por idioma): voltar à página não vai de novo ao back end
        JnAjax.doAPersistedRequest(`privacy-policy?language=${language}`, callbacks, 'http://localhost:8082');
    }, [language]);

    return (
        <div className="panel mx-auto max-w-4xl space-y-2 p-6">
            {failed && <p>{NOT_LOADED[language] || NOT_LOADED.english}</p>}
            {!failed && !text && <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary border-l-transparent align-middle"></span>}
            {text && toElements(toBlocks(text))}
        </div>
    );
};
