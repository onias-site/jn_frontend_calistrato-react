'use client';
import React, { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import JnAjax from '@/app/JnAjax';
import { dddRegions } from '@/presentation/components/regions/dddRegions';
import IconEdit from '@/presentation/icons/icon-edit';
import PageTitle from '@/presentation/layouts/page-title';
import { TabResumeStore, ITabResumeStore } from './tabs/TabResume/FormResume';
import { TabLanguagesStore, ITabLanguagesStore } from './tabs/TabLanguages/ChooserLanguages';
import { TabOptionsStore, ITabOptionsStore } from './tabs/TabFilter/FormFilter';
import { RegioesStore, IRegioesStore, HOME_OFFICE, TODAS_AS_REGIOES } from './tabs/TabFilter/RegioesComponent';
import { TabSalaryStore, ITabSalaryStore } from './tabs/TabSalary/FormSalary';
import { TabSkillStore, ITabSkillStore } from './tabs/TabSkills/TabSkills';
import { SubMenuMyResumeStore, ISubMenuMyResumeStore, ensureResumeLoaded } from './SubMenuMyResume';
import { ResumePreview, ResumePreviewData } from './ResumePreview';

/**
 * A prévia do currículo como página, com os dados das abas do Sobre mim: abre depois de salvar e pelo "Ver prévia" da
 * faixa de situação. O conteúdo é o de ResumePreview, que também abre, em modal, os currículos visualizados pelo
 * recrutador. O Imprimir manda o documento A4 de resumeDocument.ts para a impressora; o Editar volta às abas.
 */
export const ResumePreviewPage = () => {
    const router = useRouter();
    const resume = TabResumeStore((state: ITabResumeStore) => state);
    const languages = TabLanguagesStore((state: ITabLanguagesStore) => state);
    const options = TabOptionsStore((state: ITabOptionsStore) => state);
    const regioes = RegioesStore((state: IRegioesStore) => state.regioesSelecionadas);
    const salary = TabSalaryStore((state: ITabSalaryStore) => state);
    const skillGroups = TabSkillStore((state: ITabSkillStore) => state.groups);
    const resumeStatus = SubMenuMyResumeStore((state: ISubMenuMyResumeStore) => state.resumeStatus);

    // quem chega direto pela URL (ou recarrega a página) ainda não tem as abas carregadas: busca o currículo salvo
    useEffect(() => {
        ensureResumeLoaded();
    }, []);

    const login: any = JnAjax.getLogin() || {};

    const data = useMemo((): ResumePreviewData => {
        const mainGroup: any = skillGroups.filter((group: any) => group.main)[0];
        const spokenLanguages = languages.speakOtherLanguages ? languages.getSelectedLanguages() : [];
        return {
            email: login.email || '',
            desiredJob: resume.desiredJob,
            lastJob: resume.lastJob,
            linkedinAddress: resume.linkedinAddress,
            resumeTypeLabel: (resume.resumeType?.label || '').split(' (')[0],
            skills: ((mainGroup && mainGroup.list) || []).map((item: any) => item.skill).sort(),
            languages: spokenLanguages.map((language: any) => ({ name: language.name, level: language.level })),
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
            resumeText: resume.resumeText || '',
        };
    }, [resume, languages, options, regioes, salary, skillGroups, login.email]);

    const edit = () => router.push('/meus-dados/sobre-mim');

    if (resumeStatus === 'notLogged') {
        return (
            <div>
                <PageTitle>Prévia do currículo</PageTitle>
                <div className="panel mt-6">Entre com o seu e-mail para ver a prévia do seu currículo.</div>
            </div>
        );
    }
    if (resumeStatus === 'none') {
        return (
            <div>
                <PageTitle>Prévia do currículo</PageTitle>
                <div className="panel mt-6 flex flex-wrap items-center justify-between gap-3">
                    <span>Você ainda não tem currículo salvo.</span>
                    <button type="button" className="btn btn-primary" onClick={edit}>
                        Preencher o currículo
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <PageTitle>Prévia do currículo</PageTitle>
            <div className="mt-6">
                <ResumePreview
                    data={data}
                    actions={
                        <button type="button" className="btn btn-primary gap-2" onClick={edit}>
                            <IconEdit className="h-4 w-4" />
                            Editar currículo
                        </button>
                    }
                />
            </div>

            {/* "Perfil completo" (Compartilhar perfil / Candidatar-se a vagas): guardado para quando essas ações existirem no backend
            <Paper className="panel" radius="md">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                        <Title order={3} size="h4" fw={600} mb="xs">Perfil completo</Title>
                        <Text size="sm" c="dimmed">Todas as informações do candidato estão atualizadas e prontas para visualização.</Text>
                    </div>
                    <div className="flex gap-2">
                        <button type="button" className="btn btn-outline-primary">Compartilhar perfil</button>
                        <button type="button" className="btn btn-primary">Candidatar-se a vagas</button>
                    </div>
                </div>
            </Paper>
            */}
        </div>
    );
};
