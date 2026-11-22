import { FC } from 'react';

interface IconFilterProps {
    className?: string;
}

// funil (filtros)
const IconFilter: FC<IconFilterProps> = ({ className }) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <path d="M3.5 4.5C3.5 4.22386 3.72386 4 4 4H20C20.2761 4 20.5 4.22386 20.5 4.5V5.79289C20.5 5.92551 20.4473 6.05268 20.3536 6.14645L14.6464 11.8536C14.5527 11.9473 14.5 12.0745 14.5 12.2071V17.382" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path opacity="0.5" d="M14.5 17.382L9.5 20V12.2071C9.5 12.0745 9.44732 11.9473 9.35355 11.8536L3.64645 6.14645C3.55268 6.05268 3.5 5.92551 3.5 5.79289V4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};

export default IconFilter;
