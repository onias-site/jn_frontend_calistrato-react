'use client';
import { useEffect, useRef, useState } from 'react';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { conceptSections } from './conceptsCatalog';

// altura do header fixo (56px) mais um respiro: é onde o painel gruda e onde a seção clicada para ao rolar
const STICKY_TOP = 80;

/**
 * As regras de arquitetura do backend, uma seção por aba do acordeão, com o painel "Nesta página" à direita (Sticky
 * Sidebar): ele acompanha a rolagem logo abaixo do header, marca a seção que está sendo lida e, ao clicar numa seção,
 * abre a aba e rola até ela. Em telas estreitas o painel some e fica só o acordeão.
 */
export const BackendConcepts = () => {
    const [openSections, setOpenSections] = useState<number[]>([]);
    const [currentSection, setCurrentSection] = useState(0);
    const accordionArea = useRef<HTMLDivElement>(null);

    const sectionElements = () => Array.from(accordionArea.current?.querySelectorAll<HTMLElement>('.p-accordion-tab') || []);

    useEffect(() => {
        // a seção atual é a última cujo topo já passou da linha do painel; no fim da página, a última seção (curta
        // demais para o seu topo chegar à linha)
        const markCurrentSection = () => {
            const sections = sectionElements();
            const pageEnd = document.documentElement.scrollHeight - 2;
            const atTheBottom = window.innerHeight + window.scrollY >= pageEnd;
            if (atTheBottom && window.scrollY > 0) return setCurrentSection(sections.length - 1);
            const tops = sections.map((element) => element.getBoundingClientRect().top);
            const passed = tops.filter((top) => top <= STICKY_TOP + 1).length;
            setCurrentSection(Math.max(passed - 1, 0));
        };
        markCurrentSection();
        window.addEventListener('scroll', markCurrentSection, { passive: true });
        return () => window.removeEventListener('scroll', markCurrentSection);
    }, [openSections]);

    const goToSection = (index: number) => {
        setOpenSections((opened) => (opened.includes(index) ? opened : [...opened, index]));
        // espera a aba abrir para a rolagem cair no lugar certo
        setTimeout(() => {
            const section = sectionElements()[index];
            if (!section) return;
            const top = section.getBoundingClientRect().top + window.scrollY - STICKY_TOP;
            window.scrollTo({ top, behavior: 'smooth' });
        }, 50);
    };

    return (
        <div className="mt-6 flex items-start gap-6">
            <div className="panel min-w-0 flex-1" ref={accordionArea}>
                <p className="mb-4">As regras de arquitetura que guiam o código do JobsNow e os centros de custo em que ele se divide. Clique numa seção para ver os seus conceitos.</p>
                <Accordion multiple activeIndex={openSections} onTabChange={(e) => setOpenSections(e.index as number[])}>
                    {conceptSections.map((section) => (
                        <AccordionTab key={section.title} header={`${section.title} (${section.concepts.length})`} headerClassName="py-2 text-lg font-semibold">
                            <div className="table-responsive">
                                <table className="table-hover">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Sigla</th>
                                            <th>Acrônimo</th>
                                            <th>O que é</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {section.concepts.map((concept, index) => (
                                            <tr key={concept.acronym}>
                                                <td>{index + 1}</td>
                                                <td className="font-semibold">{concept.acronym}</td>
                                                <td className="whitespace-nowrap">{concept.name}</td>
                                                <td>{concept.explanation}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </AccordionTab>
                    ))}
                </Accordion>
            </div>
            <aside className="panel sticky hidden w-60 shrink-0 self-start overflow-y-auto lg:block" style={{ top: STICKY_TOP, maxHeight: `calc(100vh - ${STICKY_TOP + 16}px)` }}>
                <h6 className="mb-3 text-xs font-bold uppercase text-white-dark">Nesta página</h6>
                <ul className="space-y-1 border-l border-white-light dark:border-[#1b2e4b]">
                    {conceptSections.map((section, index) => (
                        <li key={section.title}>
                            <button
                                type="button"
                                onClick={() => goToSection(index)}
                                className={`-ml-px block w-full border-l-2 py-1 pl-3 text-left hover:text-primary ${
                                    index == currentSection ? 'border-primary font-semibold text-primary' : 'border-transparent'
                                }`}
                            >
                                {section.title} ({section.concepts.length})
                            </button>
                        </li>
                    ))}
                </ul>
            </aside>
        </div>
    );
};
