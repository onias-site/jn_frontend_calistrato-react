'use client';
import React, { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Badge, Card, Grid, Group, Paper, Stack, Text, Textarea, Title } from '@mantine/core';
import JnAjax from '@/app/JnAjax';
import { dddRegions } from '@/presentation/components/regions/dddRegions';
import IconPrinter from '@/presentation/icons/icon-printer';
import IconEdit from '@/presentation/icons/icon-edit';
import PageTitle from '@/presentation/layouts/page-title';
import { TabResumeStore, ITabResumeStore } from './tabs/TabResume/FormResume';
import { TabLanguagesStore, ITabLanguagesStore } from './tabs/TabLanguages/ChooserLanguages';
import { TabOptionsStore, ITabOptionsStore } from './tabs/TabFilter/FormFilter';
import { RegioesStore, IRegioesStore, HOME_OFFICE, TODAS_AS_REGIOES } from './tabs/TabFilter/RegioesComponent';
import { TabSalaryStore, ITabSalaryStore } from './tabs/TabSalary/FormSalary';
import { TabSkillStore, ITabSkillStore } from './tabs/TabSkills/TabSkills';
import { SubMenuMyResumeStore, ISubMenuMyResumeStore, ensureResumeLoaded } from './SubMenuMyResume';
import { ResumeDocumentData, buildResumeDocument } from './resumeDocument';

const money = (value: number) => Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const plural = (count: number, singular: string, pluralForm: string) => `${count} ${count == 1 ? singular : pluralForm}`;
const levelLabel: Record<number, string> = { 1: 'Intermediário', 2: 'Fluente' };

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
        <Text size="sm" c="dimmed" mb={4}>
            {label}
        </Text>
        {typeof children == 'string' ? (
            <Text fw={500} size="md">
                {children}
            </Text>
        ) : (
            children
        )}
    </div>
);

/**
 * A prévia do currículo como página, com os dados das abas do Sobre mim: abre depois de salvar e pelo "Ver prévia" da
 * faixa de situação. Sem nome (LGPD: o site não guarda o nome): o título é a função desejada. O Imprimir manda o
 * documento A4 de resumeDocument.ts para a impressora; o Editar volta às abas.
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
    const mainGroup: any = skillGroups.filter((group: any) => group.main)[0];
    const skills: string[] = ((mainGroup && mainGroup.list) || []).map((item: any) => item.skill).sort();
    const spokenLanguages = languages.speakOtherLanguages ? languages.getSelectedLanguages() : [];
    const homeOffice = regioes.includes(HOME_OFFICE);
    const allRegions = regioes.includes(TODAS_AS_REGIOES);
    const regionNames = regioes.filter((id: string) => id != HOME_OFFICE && id != TODAS_AS_REGIOES).map((id: string) => dddRegions.find((region) => region.id == id)?.nome || id);
    const experienceYears = Number(options.experience) || 0;
    const resumeTypeLabel = (resume.resumeType?.label || '').split(' (')[0];

    const document = useMemo(() => {
        const data: ResumeDocumentData = {
            email: login.email || '',
            desiredJob: resume.desiredJob,
            lastJob: resume.lastJob,
            linkedinAddress: resume.linkedinAddress,
            resumeTypeLabel,
            skills,
            languages: spokenLanguages,
            homeOffice,
            allRegions,
            regions: regionNames,
            experienceYears,
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
    }, [resume, languages, options, regioes, salary, skillGroups]);

    // imprime o documento A4 numa janela própria: sem o menu, o header e os estilos do site
    const print = () => {
        const printWindow = window.open('', '_blank', 'width=900,height=1000');
        if (!printWindow) return;
        printWindow.document.open();
        printWindow.document.write(document);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 400);
    };

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
            <Stack className="mt-6 gap-4">
                <Paper className="panel" radius="md">
                    <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                        <div>
                            {/* sem nome (LGPD): a função desejada identifica o currículo */}
                            <Title order={1} size="h2" fw={700} className="text-dark dark:text-white-light">
                                {resume.desiredJob || 'Função desejada não informada'}
                            </Title>
                            <Group className="mt-1 gap-2 text-sm text-white-dark">
                                <span>{login.email}</span>
                                {resume.linkedinAddress && (
                                    <a href={resume.linkedinAddress} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                        {resume.linkedinAddress}
                                    </a>
                                )}
                            </Group>
                        </div>
                        <div className="flex gap-2">
                            <button type="button" className="btn btn-outline-primary gap-2" onClick={print}>
                                <IconPrinter className="h-4 w-4" />
                                Imprimir
                            </button>
                            <button type="button" className="btn btn-primary gap-2" onClick={edit}>
                                <IconEdit className="h-4 w-4" />
                                Editar currículo
                            </button>
                        </div>
                    </div>
                </Paper>

                <Grid gutter="md">
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <Card className="panel h-full" radius="md">
                            <Title order={3} size="h4" fw={600} mb="md">
                                Informações pessoais
                            </Title>
                            <Stack className="gap-4">
                                <Field label="Sistema de trabalho">
                                    <Badge color={homeOffice ? 'green' : 'blue'} variant="light" size="md">
                                        {homeOffice ? 'Somente home office' : 'Presencial ou híbrido'}
                                    </Badge>
                                </Field>
                                {!homeOffice && (
                                    <Field label="Regiões">
                                        {allRegions ? (
                                            'Qualquer estado / cidade'
                                        ) : regionNames.length ? (
                                            <div className="flex flex-wrap gap-1.5">
                                                {regionNames.map((name) => (
                                                    <Badge key={name} variant="outline" color="gray" size="sm">
                                                        {name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        ) : (
                                            'Nenhuma região informada'
                                        )}
                                    </Field>
                                )}
                                <Field label="Empresas que não recebem meu linkedin">{resume.notAllowedCompany?.length ? resume.notAllowedCompany.join(', ') : 'Nenhuma'}</Field>
                                <Field label="Disponibilidade para viagens">{options.travel ? 'Nacionais e internacionais' : 'Sem disponibilidade'}</Field>
                                <Field label="PCD">{options.pcd ? 'Sim' : 'Não'}</Field>
                            </Stack>
                        </Card>
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <Card className="panel h-full" radius="md">
                            <Title order={3} size="h4" fw={600} mb="md">
                                Dados da carreira
                            </Title>
                            <Stack className="gap-4">
                                <Field label="Cargo atual ou mais recente">{resume.lastJob || 'Não informado'}</Field>
                                <Field label="Cargo desejado">{resume.desiredJob || 'Não informado'}</Field>
                                <Field label="Experiência">
                                    <Badge variant="outline" color="blue" size="md">
                                        {experienceYears ? plural(experienceYears, 'ano', 'anos') : 'Primeiro emprego na área'}
                                    </Badge>
                                </Field>
                                <Field label="Tipo do currículo">{resumeTypeLabel}</Field>
                                <Field label="Idiomas">
                                    {spokenLanguages.length ? (
                                        <div className="flex flex-wrap gap-1.5">
                                            {spokenLanguages.map((language: any) => (
                                                <Badge key={language.id} variant="light" color="grape" size="md">
                                                    {language.name} · {levelLabel[language.level] || language.level}
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        'Somente o idioma nativo'
                                    )}
                                </Field>
                                <Field label="Início em um novo emprego">{options.disponibility ? `Em até ${plural(Number(options.disponibility), 'dia', 'dias')}` : 'Imediato'}</Field>
                                <Field label="Emprego temporário">{options.temporallyJobTime ? `Aceita, com no mínimo ${plural(Number(options.temporallyJobTime), 'mês', 'meses')}` : 'Não aceita'}</Field>
                            </Stack>
                        </Card>
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <Card className="panel h-full" radius="md">
                            <Title order={3} size="h4" fw={600} mb="md">
                                Pretensão salarial
                            </Title>
                            <Stack className="gap-4">
                                <Field label="CLT (mensal)">
                                    {salary.clt ? (
                                        <Text fw={700} size="xl" c="green.6">
                                            {money(salary.clt)}
                                        </Text>
                                    ) : (
                                        'Não aceita CLT'
                                    )}
                                </Field>
                                <Field label="PJ (mensal)">
                                    {salary.pj ? (
                                        <Text fw={700} size="xl" c="green.6">
                                            {money(salary.pj)}
                                        </Text>
                                    ) : (
                                        'Não aceita PJ'
                                    )}
                                </Field>
                                <Field label="Bitcoin (equivalente em reais)">{salary.btc ? money(salary.btc) : 'Não aceita'}</Field>
                                <Field label="Negociação">
                                    <Badge color={salary.negotiableClaim ? 'green' : 'gray'} variant="light" size="md">
                                        {salary.negotiableClaim ? 'Pretensões negociáveis' : 'Pretensões não negociáveis'}
                                    </Badge>
                                </Field>
                            </Stack>
                        </Card>
                    </Grid.Col>
                </Grid>

                {skills.length > 0 && (
                    <Paper className="panel" radius="md">
                        <Title order={3} size="h4" fw={600} mb="md">
                            {plural(skills.length, 'Habilidade', 'Habilidades')}
                        </Title>
                        <div className="flex flex-wrap gap-2">
                            {skills.map((skill) => (
                                <Badge key={skill} variant="light" color="primary" size="lg" radius="sm">
                                    {skill}
                                </Badge>
                            ))}
                        </div>
                    </Paper>
                )}

                <Paper className="panel" radius="md">
                    <Title order={3} size="h4" fw={600} mb="md">
                        Sobre o candidato
                    </Title>
                    {resume.resumeText ? (
                        <Textarea value={resume.resumeText} readOnly autosize minRows={6} maxRows={18} />
                    ) : (
                        <Text size="sm" c="dimmed">
                            O texto do seu currículo não fica guardado (LGPD): ele aparece aqui só na sessão em que você o colou na aba Currículo.
                        </Text>
                    )}
                </Paper>

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
            </Stack>
        </div>
    );
};
