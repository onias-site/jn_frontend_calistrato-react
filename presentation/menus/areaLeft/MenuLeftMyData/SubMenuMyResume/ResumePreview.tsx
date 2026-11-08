'use client';
import React from 'react';
import { Modal } from '@mantine/core';
import JnAjax from '@/app/JnAjax';
import { dddRegions } from '@/presentation/components/regions/dddRegions';
import IconPrinter from '@/presentation/icons/icon-printer';
import { TabResumeStore, ITabResumeStore } from './tabs/TabResume/FormResume';
import { TabLanguagesStore, ITabLanguagesStore } from './tabs/TabLanguages/ChooserLanguages';
import { TabOptionsStore, ITabOptionsStore } from './tabs/TabFilter/FormFilter';
import { RegioesStore, IRegioesStore, HOME_OFFICE, TODAS_AS_REGIOES } from './tabs/TabFilter/RegioesComponent';
import { TabSalaryStore, ITabSalaryStore } from './tabs/TabSalary/FormSalary';
import { TabSkillStore, ITabSkillStore } from './tabs/TabSkills/TabSkills';

const money = (value: number) => Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const levelLabel: Record<number, string> = { 1: 'intermediário', 2: 'fluente' };
const plural = (count: number, singular: string, pluralForm: string) => `${count} ${count == 1 ? singular : pluralForm}`;

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="mb-5 break-inside-avoid">
        <h3 className="mb-2 border-b border-primary/30 pb-1 text-xs font-bold uppercase tracking-wider text-primary">{title}</h3>
        {children}
    </section>
);

const Item = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="mb-1.5 grid grid-cols-[9rem_1fr] gap-2 text-sm">
        <span className="text-white-dark">{label}</span>
        <span className="text-dark">{children}</span>
    </div>
);

const Chips = ({ items }: { items: string[] }) => (
    <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
            <span key={item} className="rounded-full bg-primary-light px-2.5 py-0.5 text-xs font-semibold text-primary print:border print:border-primary/40">
                {item}
            </span>
        ))}
    </div>
);

/**
 * A prévia do currículo como ficou salvo, montada com os dados das abas: abre depois de salvar e pelo botão "Ver prévia"
 * da faixa de situação. O botão Imprimir manda só a prévia para a impressora (regras @media print em tailwind.css).
 */
export const ResumePreview = ({ opened, onClose }: { opened: boolean; onClose: () => void }) => {
    const resume = TabResumeStore((state: ITabResumeStore) => state);
    const languages = TabLanguagesStore((state: ITabLanguagesStore) => state);
    const options = TabOptionsStore((state: ITabOptionsStore) => state);
    const regioes = RegioesStore((state: IRegioesStore) => state.regioesSelecionadas);
    const salary = TabSalaryStore((state: ITabSalaryStore) => state);
    const skillGroups = TabSkillStore((state: ITabSkillStore) => state.groups);

    const login: any = JnAjax.getLogin() || {};
    const mainSkills: string[] = ((skillGroups.filter((group: any) => group.main)[0] as any)?.list || []).map((item: any) => item.skill).sort();
    const spokenLanguages = languages.speakOtherLanguages ? languages.getSelectedLanguages() : [];
    const homeOffice = regioes.includes(HOME_OFFICE);
    const regionNames = regioes
        .filter((id: string) => id != HOME_OFFICE && id != TODAS_AS_REGIOES)
        .map((id: string) => dddRegions.find((region) => region.id == id)?.nome || id);
    const allRegions = regioes.includes(TODAS_AS_REGIOES);
    const salaries = [
        salary.clt ? `CLT: ${money(salary.clt)}` : 'Não aceita CLT',
        salary.pj ? `PJ: ${money(salary.pj)}` : 'Não aceita PJ',
        salary.btc ? `Bitcoin: equivalente a ${money(salary.btc)}` : 'Não aceita bitcoin',
    ];

    return (
        <Modal opened={opened} onClose={onClose} size="xl" title="Prévia do currículo" classNames={{ content: 'resume-print-container' }}>
            <div className="resume-print rounded-md border border-white-light bg-white p-6 dark:border-[#1b2e4b] dark:bg-black">
                <header className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b-2 border-primary pb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-dark">{resume.desiredJob || 'Função desejada não informada'}</h2>
                        {resume.lastJob && <p className="text-sm text-white-dark">Última função: {resume.lastJob}</p>}
                        <p className="mt-1 text-sm text-dark">{login.email}</p>
                        {resume.linkedinAddress && (
                            <a href={resume.linkedinAddress} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                                {resume.linkedinAddress}
                            </a>
                        )}
                    </div>
                    <div className="text-right text-xs text-white-dark">
                        <div>{resume.resumeType?.label?.split(' (')[0]}</div>
                        <div>Gerado em {new Date().toLocaleDateString('pt-BR')}</div>
                    </div>
                </header>

                <div className="grid gap-x-8 md:grid-cols-2">
                    <div>
                        {mainSkills.length > 0 && (
                            <Section title={plural(mainSkills.length, 'habilidade', 'habilidades')}>
                                <Chips items={mainSkills} />
                            </Section>
                        )}
                        <Section title="Idiomas">
                            {spokenLanguages.length == 0 ? (
                                <p className="text-sm text-white-dark">Somente o idioma nativo</p>
                            ) : (
                                <ul className="text-sm text-dark">
                                    {spokenLanguages.map((language: any) => (
                                        <li key={language.id}>
                                            {language.name} <span className="text-white-dark">({levelLabel[language.level] || language.level})</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Section>
                        <Section title="Onde aceita trabalhar">
                            {homeOffice && <p className="text-sm text-dark">Somente home office</p>}
                            {!homeOffice && allRegions && <p className="text-sm text-dark">Qualquer estado / cidade, presencial ou híbrido</p>}
                            {!homeOffice && !allRegions && regionNames.length > 0 && <Chips items={regionNames} />}
                            {!homeOffice && !allRegions && regionNames.length == 0 && <p className="text-sm text-white-dark">Nenhuma região informada</p>}
                        </Section>
                    </div>
                    <div>
                        <Section title="Disponibilidade">
                            <Item label="Experiência">{options.experience ? plural(Number(options.experience), 'ano', 'anos') + ' na área' : 'Primeiro emprego na área'}</Item>
                            <Item label="Início">{options.disponibility ? `em até ${plural(Number(options.disponibility), 'dia', 'dias')}` : 'imediato'}</Item>
                            <Item label="Temporário">{options.temporallyJobTime ? `aceita, com no mínimo ${plural(Number(options.temporallyJobTime), 'mês', 'meses')}` : 'não aceita'}</Item>
                            <Item label="Viagens">{options.travel ? 'disponível para viagens nacionais e internacionais' : 'sem disponibilidade'}</Item>
                            <Item label="PCD">{options.pcd ? 'sim' : 'não'}</Item>
                        </Section>
                        <Section title="Pretensão salarial">
                            <ul className="text-sm text-dark">
                                {salaries.map((item) => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                            <p className="mt-1 text-sm text-white-dark">{salary.negotiableClaim ? 'Pretensões negociáveis' : 'Pretensões não negociáveis'}</p>
                        </Section>
                        {resume.notAllowedCompany?.length > 0 && (
                            <Section title="Não enviar para">
                                <Chips items={resume.notAllowedCompany} />
                            </Section>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
                <p className="text-sm text-white-dark">É assim que os recrutadores veem o seu currículo. O texto colado não aparece: ele não é guardado.</p>
                <div className="flex gap-2">
                    <button type="button" className="btn btn-outline-dark" onClick={onClose}>
                        Fechar
                    </button>
                    <button type="button" className="btn btn-primary gap-2" onClick={() => window.print()}>
                        <IconPrinter className="h-4 w-4" />
                        Imprimir
                    </button>
                </div>
            </div>
        </Modal>
    );
};
