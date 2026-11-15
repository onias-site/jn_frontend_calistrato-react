'use client';
import React from 'react';
import { Badge, Card, Grid, Group, Paper, Stack, Text, Textarea, Title } from '@mantine/core';
import { dddRegions } from '@/presentation/components/regions/dddRegions';
import IconPrinter from '@/presentation/icons/icon-printer';
import { resumeTypes } from './tabs/TabResume/FormResume';
import { HOME_OFFICE, totalDeRegioesMetropolitanas } from './tabs/TabFilter/RegioesComponent';
import { ResumeDocumentData, buildResumeDocument } from './resumeDocument';

const money = (value: number) => Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const plural = (count: number, singular: string, pluralForm: string) => `${count} ${count == 1 ? singular : pluralForm}`;
const levelLabel: Record<number, string> = { 1: 'Intermediário', 2: 'Fluente' };

/**
 * Os dados que a prévia do currículo mostra. Sem {@code notAllowedCompanies} o item "Empresas que não recebem meu
 * linkedin" não aparece; sem {@code resumeText} a seção "Sobre o candidato" não aparece (os dois só fazem sentido para o
 * dono do currículo).
 */
export interface ResumePreviewData {
    email: string;
    desiredJob: string;
    lastJob: string;
    linkedinAddress: string;
    resumeTypeLabel: string;
    skills: string[];
    languages: { name: string; level: number }[];
    homeOffice: boolean;
    allRegions: boolean;
    regions: string[];
    experienceYears: number;
    disponibilityDays: number;
    temporaryMonths: number;
    travel: boolean;
    pcd: boolean;
    clt: number;
    pj: number;
    btc: number;
    negotiable: boolean;
    notAllowedCompanies?: string[];
    resumeText?: string;
}

/** O rótulo do tipo do currículo sem a explicação entre parênteses. */
export const resumeTypeLabelOf = (resumeTypeId: any) => {
    const resumeType = resumeTypes.filter((type) => type.id == resumeTypeId)[0] || resumeTypes[0];
    return resumeType.label.split(' (')[0];
};

/**
 * A prévia a partir do currículo como o back end o grava (o {@code preview} dos detalhes de um currículo visualizado):
 * o ano em que a experiência começou vira anos, os ddds viram nomes de regiões (todas as regiões metropolitanas sem
 * home office = qualquer estado / cidade) e {@code skill} já vem só com os nomes das habilidades do próprio currículo.
 */
export const previewDataFromSavedResume = (resume: any): ResumePreviewData => {
    const ddds: string[] = (resume.ddd || []).map((ddd: any) => String(ddd));
    const homeOffice = ddds.includes(HOME_OFFICE);
    const allRegions = !homeOffice && ddds.length == totalDeRegioesMetropolitanas;
    const currentYear = new Date().getFullYear();
    const experienceStartYear = Number(resume.experience) || currentYear;
    return {
        email: '',
        desiredJob: resume.desiredJob || '',
        lastJob: resume.lastJob || '',
        linkedinAddress: resume.linkedinAddress || '',
        resumeTypeLabel: resumeTypeLabelOf(resume.resumeType),
        skills: [...(resume.skill || [])].sort(),
        languages: (resume.spokenLanguage || []).map((language: any) => ({ name: language.name, level: language.level })),
        homeOffice,
        allRegions,
        regions: ddds.filter((ddd) => ddd != HOME_OFFICE).map((ddd) => dddRegions.find((region) => region.id == ddd)?.nome || ddd),
        experienceYears: Math.max(0, currentYear - experienceStartYear),
        disponibilityDays: Number(resume.disponibility) || 0,
        temporaryMonths: Number(resume.temporallyJobTime) || 0,
        travel: !!resume.travel,
        pcd: !!resume.pcd,
        clt: Number(resume.clt) || 0,
        pj: Number(resume.pj) || 0,
        btc: Number(resume.btc) || 0,
        negotiable: !!resume.negotiableClaim,
    };
};

/** Imprime o documento A4 de resumeDocument.ts numa janela própria: sem o menu, o header e os estilos do site. */
export const printResumePreview = (data: ResumePreviewData) => {
    const documentData: ResumeDocumentData = { ...data, notAllowedCompanies: data.notAllowedCompanies || [] };
    const printWindow = window.open('', '_blank', 'width=900,height=1000');
    if (!printWindow) return;
    printWindow.document.open();
    printWindow.document.write(buildResumeDocument(documentData));
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 400);
};

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
 * O conteúdo da prévia do currículo: a página "Prévia do currículo" (o currículo do próprio usuário) e o modal dos
 * detalhes de um currículo visualizado pelo recrutador. Sem nome (LGPD: o site não guarda o nome): o título é a função
 * desejada. Os botões do cabeçalho vêm de quem usa (o Imprimir é sempre o mesmo, os demais em {@code actions}).
 */
export const ResumePreview = ({ data, actions }: { data: ResumePreviewData; actions?: React.ReactNode }) => (
    <Stack className="gap-4">
        <Paper className="panel" radius="md">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div>
                    {/* sem nome (LGPD): a função desejada identifica o currículo */}
                    <Title order={1} size="h2" fw={700} className="text-dark dark:text-white-light">
                        {data.desiredJob || 'Função desejada não informada'}
                    </Title>
                    <Group className="mt-1 gap-2 text-sm text-white-dark">
                        {data.email && <span>{data.email}</span>}
                        {data.linkedinAddress && (
                            <a href={data.linkedinAddress} target="_blank" rel="noopener noreferrer" className="break-all text-primary hover:underline">
                                {data.linkedinAddress}
                            </a>
                        )}
                    </Group>
                </div>
                <div className="flex gap-2">
                    <button type="button" className="btn btn-outline-primary gap-2" onClick={() => printResumePreview(data)}>
                        <IconPrinter className="h-4 w-4" />
                        Imprimir
                    </button>
                    {actions}
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
                            <Badge color={data.homeOffice ? 'green' : 'blue'} variant="light" size="md">
                                {data.homeOffice ? 'Somente home office' : 'Presencial ou híbrido'}
                            </Badge>
                        </Field>
                        {!data.homeOffice && (
                            <Field label="Regiões">
                                {data.allRegions ? (
                                    'Qualquer estado / cidade'
                                ) : data.regions.length ? (
                                    <div className="flex flex-wrap gap-1.5">
                                        {data.regions.map((name) => (
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
                        {data.notAllowedCompanies && <Field label="Empresas que não recebem meu linkedin">{data.notAllowedCompanies.length ? data.notAllowedCompanies.join(', ') : 'Nenhuma'}</Field>}
                        <Field label="Disponibilidade para viagens">{data.travel ? 'Nacionais e internacionais' : 'Sem disponibilidade'}</Field>
                        <Field label="PCD">{data.pcd ? 'Sim' : 'Não'}</Field>
                    </Stack>
                </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 4 }}>
                <Card className="panel h-full" radius="md">
                    <Title order={3} size="h4" fw={600} mb="md">
                        Dados da carreira
                    </Title>
                    <Stack className="gap-4">
                        <Field label="Cargo atual ou mais recente">{data.lastJob || 'Não informado'}</Field>
                        <Field label="Cargo desejado">{data.desiredJob || 'Não informado'}</Field>
                        <Field label="Experiência">
                            <Badge variant="outline" color="blue" size="md">
                                {data.experienceYears ? plural(data.experienceYears, 'ano', 'anos') : 'Primeiro emprego na área'}
                            </Badge>
                        </Field>
                        <Field label="Tipo do currículo">{data.resumeTypeLabel}</Field>
                        <Field label="Idiomas">
                            {data.languages.length ? (
                                <div className="flex flex-wrap gap-1.5">
                                    {data.languages.map((language) => (
                                        <Badge key={language.name} variant="light" color="grape" size="md">
                                            {language.name} · {levelLabel[language.level] || language.level}
                                        </Badge>
                                    ))}
                                </div>
                            ) : (
                                'Somente o idioma nativo'
                            )}
                        </Field>
                        <Field label="Início em um novo emprego">{data.disponibilityDays ? `Em até ${plural(data.disponibilityDays, 'dia', 'dias')}` : 'Imediato'}</Field>
                        <Field label="Emprego temporário">{data.temporaryMonths ? `Aceita, com no mínimo ${plural(data.temporaryMonths, 'mês', 'meses')}` : 'Não aceita'}</Field>
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
                            {data.clt ? (
                                <Text fw={700} size="xl" c="green.6">
                                    {money(data.clt)}
                                </Text>
                            ) : (
                                'Não aceita CLT'
                            )}
                        </Field>
                        <Field label="PJ (mensal)">
                            {data.pj ? (
                                <Text fw={700} size="xl" c="green.6">
                                    {money(data.pj)}
                                </Text>
                            ) : (
                                'Não aceita PJ'
                            )}
                        </Field>
                        <Field label="Bitcoin (equivalente em reais)">{data.btc ? money(data.btc) : 'Não aceita'}</Field>
                        <Field label="Negociação">
                            <Badge color={data.negotiable ? 'green' : 'gray'} variant="light" size="md">
                                {data.negotiable ? 'Pretensões negociáveis' : 'Pretensões não negociáveis'}
                            </Badge>
                        </Field>
                    </Stack>
                </Card>
            </Grid.Col>
        </Grid>

        {data.skills.length > 0 && (
            <Paper className="panel" radius="md">
                <Title order={3} size="h4" fw={600} mb="md">
                    {plural(data.skills.length, 'Habilidade', 'Habilidades')}
                </Title>
                <div className="flex flex-wrap gap-2">
                    {data.skills.map((skill) => (
                        <Badge key={skill} variant="light" color="primary" size="lg" radius="sm">
                            {skill}
                        </Badge>
                    ))}
                </div>
            </Paper>
        )}

        {data.resumeText !== undefined && (
            <Paper className="panel" radius="md">
                <Title order={3} size="h4" fw={600} mb="md">
                    Sobre o candidato
                </Title>
                {data.resumeText ? (
                    <Textarea value={data.resumeText} readOnly autosize minRows={6} maxRows={18} />
                ) : (
                    <Text size="sm" c="dimmed">
                        O texto do seu currículo não fica guardado (LGPD): ele aparece aqui só na sessão em que você o colou na aba Currículo.
                    </Text>
                )}
            </Paper>
        )}
    </Stack>
);
