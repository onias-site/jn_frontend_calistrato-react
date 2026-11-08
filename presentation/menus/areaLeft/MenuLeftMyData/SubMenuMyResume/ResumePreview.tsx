'use client';
import React, { useMemo, useRef } from 'react';
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
import { ResumeDocumentData, buildResumeDocument } from './resumeDocument';

/**
 * A prévia do currículo como ficou salvo, montada com os dados das abas e mostrada num iframe com o documento de
 * resumeDocument.ts: abre depois de salvar e pelo botão "Ver prévia" da faixa de situação. O Imprimir imprime o iframe,
 * então o papel sai igual ao que se vê.
 */
export const ResumePreview = ({ opened, onClose }: { opened: boolean; onClose: () => void }) => {
    const resume = TabResumeStore((state: ITabResumeStore) => state);
    const languages = TabLanguagesStore((state: ITabLanguagesStore) => state);
    const options = TabOptionsStore((state: ITabOptionsStore) => state);
    const regioes = RegioesStore((state: IRegioesStore) => state.regioesSelecionadas);
    const salary = TabSalaryStore((state: ITabSalaryStore) => state);
    const skillGroups = TabSkillStore((state: ITabSkillStore) => state.groups);
    const frame = useRef<HTMLIFrameElement>(null);

    const document = useMemo(() => {
        if (!opened) return '';
        const login: any = JnAjax.getLogin() || {};
        const mainGroup: any = skillGroups.filter((group: any) => group.main)[0];
        const data: ResumeDocumentData = {
            email: login.email || '',
            desiredJob: resume.desiredJob,
            lastJob: resume.lastJob,
            linkedinAddress: resume.linkedinAddress,
            resumeTypeLabel: (resume.resumeType?.label || '').split(' (')[0],
            skills: ((mainGroup && mainGroup.list) || []).map((item: any) => item.skill).sort(),
            languages: languages.speakOtherLanguages ? languages.getSelectedLanguages() : [],
            homeOffice: regioes.includes(HOME_OFFICE),
            allRegions: regioes.includes(TODAS_AS_REGIOES),
            regions: regioes.filter((id: string) => id != HOME_OFFICE && id != TODAS_AS_REGIOES).map((id: string) => dddRegions.find((region) => region.id == id)?.nome || id),
            experienceYears: Number(options.experience) || 0,
            disponibilityDays: Number(options.disponibility) || 0,
            temporaryMonths: Number(options.temporallyJobTime) || 0,
            travel: !!options.travel,
            pcd: !!options.pcd,
            clt: Number(salary.clt) || 0,
            pj: Number(salary.pj) || 0,
            btc: Number(salary.btc) || 0,
            negotiable: !!salary.negotiableClaim,
            notAllowedCompanies: resume.notAllowedCompany || [],
        };
        return buildResumeDocument(data);
    }, [opened, resume, languages, options, regioes, salary, skillGroups]);

    const print = () => {
        const frameWindow = frame.current?.contentWindow;
        if (!frameWindow) return;
        frameWindow.focus();
        frameWindow.print();
    };

    return (
        <Modal opened={opened} onClose={onClose} size="900px" title="Prévia do currículo">
            <iframe ref={frame} title="Prévia do currículo" srcDoc={document} className="h-[72vh] w-full rounded-md border border-white-light bg-[#f3f4f6] dark:border-[#1b2e4b]" />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-white-dark">É assim que os recrutadores veem o seu currículo. Na impressão, escolha "Salvar como PDF" para guardar o arquivo.</p>
                <div className="flex gap-2">
                    <button type="button" className="btn btn-outline-dark" onClick={onClose}>
                        Fechar
                    </button>
                    <button type="button" className="btn btn-primary gap-2" onClick={print}>
                        <IconPrinter className="h-4 w-4" />
                        Imprimir
                    </button>
                </div>
            </div>
        </Modal>
    );
};
