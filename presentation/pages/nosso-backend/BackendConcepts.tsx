'use client';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { conceptSections } from './conceptsCatalog';

export const BackendConcepts = () => {
    return (
        <div className="panel mt-6">
            <p className="mb-4">As regras de arquitetura que guiam o código do JobsNow e os centros de custo em que ele se divide. Clique numa seção para ver os seus conceitos.</p>
            <Accordion multiple>
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
    );
};
