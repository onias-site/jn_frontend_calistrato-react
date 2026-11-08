import { FC } from 'react';

interface IconChevronProps {
    className?: string;
    direction?: 'left' | 'right' | 'up' | 'down';
}

const rotations = { right: 0, down: 90, left: 180, up: 270 };

/** Seta reta simples (">"), para botões de avançar/voltar e para abrir/fechar listas. */
const IconChevron: FC<IconChevronProps> = ({ className, direction = 'right' }) => {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ transform: `rotate(${rotations[direction]}deg)` }}>
            <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};

export default IconChevron;
