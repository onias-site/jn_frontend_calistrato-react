'use client';
import dynamic from 'next/dynamic';
import PageTitle from '@/presentation/layouts/page-title';
import { useRouter } from 'next/navigation';
import { Checkbox, Pagination, Popover, SegmentedControl, Select, Table } from '@mantine/core';
import IconCaretDown from '@/presentation/icons/icon-caret-down';
import IconCircleCheck from '@/presentation/icons/icon-circle-check';
import IconXCircle from '@/presentation/icons/icon-x-circle';
import IconInfoCircle from '@/presentation/icons/icon-info-circle';
import IconTrendingUp from '@/presentation/icons/icon-trending-up';
import PubSub from 'pubsub-js';
import React, { useEffect, useState } from 'react';
import JnAjax from '@/app/JnAjax';
import {
    ResumeCopy,
    isTechResumeCopy,
    resumeHasTheSkill,
    resumeCopyFromSavedResume,
    saveResumeCopy,
    savedResumeFrom,
    stopWaitingForTheResume,
    takeThePendingSearch,
    takeThePendingSearchFilters,
    waitForTheResume,
} from '@/presentation/components/resume-copy/resumeCopy';
import { MonthPicker, currentMonth, isFutureMonth, monthParameter, previousMonth } from '@/presentation/components/month-picker/MonthPicker';
import { dddRegions } from '@/presentation/components/regions/dddRegions';
import {
    MonthTotal,
    SkillTotal,
    firstOfLastMonths,
    monthLabel,
    monthsBetween,
    parseMonths,
    parseSkills,
    percentLabel,
    pieSlices,
    pieTotal,
    requirementsLabel,
    skillLabel,
} from './skillStatisticsData';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const API = 'http://localhost:8081';

/** O primeiro mês que a API aceita (yearMonth de 2015 até o ano corrente): antes dele ela responde 422. */
const FIRST_MONTH = '2015-01';

const seniorities = [
    { id: 'estag', nome: 'Estágio' },
    { id: 'junior', nome: 'Júnior' },
    { id: 'pleno', nome: 'Pleno' },
    { id: 'senior', nome: 'Sênior' },
    { id: 'especialista', nome: 'Especialista' },
    { id: 'unknown', nome: 'Indefinida' },
];

const regions = [{ id: '0', nome: 'Indefinida' }, { id: '10', nome: 'Home office' }, ...dddRegions];

/** A ordem fixa das cores das fatias: a oitava é "Outras", em cinza. */
const sliceColors = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6', '#8a8a86'];

const lineColor = '#2a78d6';

type Situation = 'idle' | 'loading' | 'loaded' | 'error';

/** O gráfico de linhas de uma skill, lido quando ela é expandida. */
/** O nome de uma opção dos filtros do topo pelo id; um id desconhecido aparece como veio. */
const nameOf = (options: { id: string; nome: string }[], id: string) => options.find((option) => option.id == id)?.nome || id;

const SkillMonths = ({ skill, seniority, ddd }: { skill: string; seniority: string; ddd: string }) => {
    const [situation, setSituation] = useState<Situation>('idle');
    const [months, setMonths] = useState<MonthTotal[]>([]);

    React.useEffect(() => {
        setSituation('loading');
        const callbacks: any = { withoutSession: true };
        callbacks[200] = (response: any) => {
            setMonths(parseMonths(response.months));
            setSituation('loaded');
        };
        callbacks['onUnexpectedHttpStatus'] = () => setSituation('error');
        JnAjax.doAPersistedRequest(`statistics/skills/${seniority}/${ddd}/months?skill=${encodeURIComponent(skill)}`, callbacks, API, JnAjax.PERSISTED_REQUEST_LIFETIME);
    }, [skill, seniority, ddd]);

    if (situation == 'error') {
        return <div>Não foi possível carregar os meses desta habilidade agora.</div>;
    }
    if (situation != 'loaded') {
        return <div>Carregando os meses...</div>;
    }
    if (months.length == 0) {
        return <div>Nenhum mês com vagas para esta habilidade.</div>;
    }
    return <SkillMonthsChart months={months} skill={skill} seniority={seniority} ddd={ddd} />;
};

/** Os atalhos de período do gráfico de linhas: a contagem é de meses, o mês corrente incluído; sem contagem, todos os meses. */
const monthRanges = [
    { id: '6', label: '6 meses', count: 6 },
    { id: '12', label: '12 meses', count: 12 },
    { id: '24', label: '2 anos', count: 24 },
    { id: 'all', label: 'Tudo', count: 0 },
];

/** O gráfico de linhas com o período escolhido: um atalho ou o intervalo "De ... até ..." entre os meses da skill. */
const SkillMonthsChart = ({ months, skill, seniority, ddd }: { months: MonthTotal[]; skill: string; seniority: string; ddd: string }) => {
    const firstMonth = months[0].yearMonth;
    const lastMonth = months[months.length - 1].yearMonth;
    const [range, setRange] = useState('all');
    const [from, setFrom] = useState(firstMonth);
    const [to, setTo] = useState(lastMonth);

    const chooseRange = (item: { id: string; count: number }) => {
        setRange(item.id);
        setFrom(item.count ? firstOfLastMonths(item.count) : firstMonth);
        setTo(lastMonth);
    };

    // o intervalo vira personalizado, e uma ponta que cruza a outra a leva junto
    const chooseFrom = (month: string) => {
        setRange('custom');
        setFrom(month);
        month > to && setTo(month);
    };

    const chooseTo = (month: string) => {
        setRange('custom');
        setTo(month);
        month < from && setFrom(month);
    };

    const shownMonths = monthsBetween(months, from, to);
    // um atalho pode começar num mês sem vagas: os selects mostram o primeiro e o último mês do período que têm dados
    const shownFrom = shownMonths.length ? shownMonths[0].yearMonth : from;
    const shownTo = shownMonths.length ? shownMonths[shownMonths.length - 1].yearMonth : to;
    const rangeSelect = (label: string, value: string, onChoose: (month: string) => void) => (
        <select aria-label={label} className="form-select w-auto py-1 text-sm" value={value} onChange={(event) => onChoose(event.target.value)}>
            {months.map((month) => (
                <option key={month.yearMonth} value={month.yearMonth}>
                    {monthLabel(month.yearMonth)}
                </option>
            ))}
        </select>
    );
    const options: any = {
        chart: { type: 'line', toolbar: { show: false }, zoom: { enabled: false } },
        colors: [lineColor],
        stroke: { width: 2, curve: 'straight' },
        markers: { size: shownMonths.length == 1 ? 4 : 0, hover: { size: 5 } },
        grid: { borderColor: 'rgba(128, 128, 128, 0.2)', strokeDashArray: 3 },
        xaxis: { categories: shownMonths.map((month) => monthLabel(month.yearMonth)), tickAmount: Math.min(shownMonths.length, 12), labels: { rotate: -45 } },
        yaxis: { min: 0, forceNiceScale: true, labels: { formatter: (value: number) => `${Math.round(value)}` } },
        tooltip: { y: { title: { formatter: () => 'Vagas:' } } },
    };
    // os filtros do topo que valem para este gráfico: o mês/ano não entra, porque o gráfico mostra todos os meses
    const chosenFilters = [
        { label: 'Habilidade', value: skillLabel(skill) },
        { label: 'Senioridade', value: nameOf(seniorities, seniority) },
        { label: 'Região Metropolitana', value: nameOf(regions, ddd) },
    ];
    return (
        <div>
            <div className="mb-2 flex flex-wrap items-center gap-2 text-sm">
                {chosenFilters.map((filter) => (
                    <span key={filter.label} className="rounded-full bg-primary-light px-3 py-1 text-primary dark:bg-primary-dark-light">
                        <span className="font-semibold">{filter.label}:</span> {filter.value}
                    </span>
                ))}
            </div>
            <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
                <span className="font-semibold">Período:</span>
                {monthRanges.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        className={`btn btn-sm ${range == item.id ? 'btn-primary' : 'btn-outline-primary'}`}
                        aria-pressed={range == item.id}
                        onClick={() => chooseRange(item)}
                    >
                        {item.label}
                    </button>
                ))}
                <span className="ml-2">De</span>
                {rangeSelect('Mês inicial', shownFrom, chooseFrom)}
                <span>até</span>
                {rangeSelect('Mês final', shownTo, chooseTo)}
            </div>
            {shownMonths.length == 0 && <div>Nenhuma vaga para esta habilidade neste período.</div>}
            {shownMonths.length > 0 && <ReactApexChart type="line" height={260} options={options} series={[{ name: 'Vagas', data: shownMonths.map((month) => month.total) }]} />}
        </div>
    );
};

/** A distribuição das skills do filtro, em pizza ou em barras horizontais (escolha no canto do painel). */
// fica num accordion que nasce fechado, com o total de vagas e de skills dentro dele
const SkillsPie = ({ skills, vacancies }: { skills: SkillTotal[]; vacancies: number }) => {
    const { labels, values } = pieSlices(skills);
    const total = pieTotal(values);
    const [expanded, setExpanded] = useState(false);
    const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');
    const fontFamily = 'var(--font-nunito), ui-sans-serif, system-ui, sans-serif';

    const pieOptions: any = {
        chart: { type: 'pie', fontFamily },
        labels,
        colors: sliceColors,
        stroke: { width: 2 },
        plotOptions: { pie: { dataLabels: { minAngleToShowLabel: 18 } } },
        legend: { position: 'bottom', formatter: (label: string, legend: any) => `${label}: ${percentLabel(values[legend.seriesIndex], total)}` },
        dataLabels: { enabled: true, formatter: (percent: number, dataLabel: any) => percentLabel(values[dataLabel.seriesIndex], total) },
        tooltip: { y: { formatter: (value: number) => `${value} vagas` } },
    };

    // nas barras só entram as skills mais pedidas (sem "Outras", que esmagava a escala); cada barra traz vagas e percentual
    const hasOthers = labels[labels.length - 1] == 'Outras';
    const barLabels = hasOthers ? labels.slice(0, -1) : labels;
    const barValues = hasOthers ? values.slice(0, -1) : values;
    const othersValue = hasOthers ? values[values.length - 1] : 0;
    const barOptions: any = {
        chart: { type: 'bar', fontFamily, toolbar: { show: false }, animations: { enabled: false } },
        colors: sliceColors,
        plotOptions: { bar: { horizontal: true, distributed: true, borderRadius: 6, barHeight: '60%', dataLabels: { position: 'top' } } },
        xaxis: { categories: barLabels, labels: { show: false }, axisBorder: { show: false }, axisTicks: { show: false }, max: Math.max(...barValues) * 1.45 },
        yaxis: { labels: { style: { fontSize: '14px', fontWeight: 600, colors: '#0e1726' }, maxWidth: 220 } },
        dataLabels: {
            enabled: true,
            textAnchor: 'start',
            offsetX: 8,
            style: { fontSize: '13px', fontWeight: 600, colors: ['#3b3f5c'] },
            formatter: (value: number) => `${value} ${value == 1 ? 'vaga' : 'vagas'}  ·  ${percentLabel(value, total)}`,
            dropShadow: { enabled: false },
        },
        legend: { show: false },
        grid: { show: false, padding: { left: 8, right: 16 } },
        tooltip: { enabled: false },
        states: { hover: { filter: { type: 'none' } }, active: { filter: { type: 'none' } } },
    };

    return (
        <div className="mb-6 rounded border border-[#d3d3d3] dark:border-[#1b2e4b]">
            <button type="button" className="flex w-full items-center gap-2 px-3 py-2 font-semibold" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
                <IconCaretDown className={`h-4 w-4 transition-transform ${expanded ? '' : '-rotate-90'}`} />
                Ver distribuição por habilidades
            </button>
            {expanded && (
                <div className="border-t border-[#d3d3d3] p-3 dark:border-[#1b2e4b]">
                    <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h5 className="text-lg font-semibold">
                                {vacancies} {vacancies == 1 ? 'vaga' : 'vagas'}, {skills.length} {skills.length == 1 ? 'Habilidade diferente' : 'Habilidades diferentes'}
                            </h5>
                            <div className="font-semibold">{requirementsLabel(total, vacancies)}</div>
                        </div>
                        <SegmentedControl
                            size="xs"
                            value={chartType}
                            onChange={(value) => setChartType(value as 'pie' | 'bar')}
                            data={[
                                { value: 'pie', label: 'Pizza' },
                                { value: 'bar', label: 'Barras' },
                            ]}
                        />
                    </div>
                    {chartType == 'pie' ? (
                        <ReactApexChart type="pie" height={340} options={pieOptions} series={values} />
                    ) : (
                        <div>
                            <ReactApexChart type="bar" height={40 + barLabels.length * 44} options={barOptions} series={[{ name: 'Vagas', data: barValues }]} />
                            {hasOthers && (
                                <p className="mt-1 text-sm text-white-dark">
                                    As demais {skills.length - barLabels.length} habilidades somam {othersValue} exigências ({percentLabel(othersValue, total)}).
                                </p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

/** O botão dos grupos do Telegram pesquisados: abre uma lista flutuante por cima do conteúdo, lida do backend a cada abertura. */
const TelegramGroupsAccordion = () => {
    const [opened, setOpened] = useState(false);
    const [situation, setSituation] = useState<Situation>('idle');
    const [telegramGroups, setTelegramGroups] = useState<string[]>([]);

    const load = () => {
        setSituation('loading');
        const callbacks: any = { withoutSession: true };
        callbacks[200] = (response: any) => {
            setTelegramGroups(response.groups || []);
            setSituation('loaded');
        };
        callbacks['onUnexpectedHttpStatus'] = () => setSituation('error');
        JnAjax.doAPersistedRequest('statistics/skills/telegramGroups', callbacks, API, JnAjax.PERSISTED_REQUEST_ONE_YEAR);
    };

    // o Esc fecha o flutuante com o foco em qualquer lugar da tela (até 2026-11-10 não fechava, R12-1)
    useEffect(() => {
        if (!opened) return;
        const closeOnEsc = (e: KeyboardEvent) => e.key == 'Escape' && setOpened(false);
        window.addEventListener('keydown', closeOnEsc);
        return () => window.removeEventListener('keydown', closeOnEsc);
    }, [opened]);

    const toggle = () => {
        if (opened) {
            setOpened(false);
            return;
        }
        setOpened(true);
        load();
    };

    return (
        // flutuante (até 2026-11-08 era um acordeão que empurrava o conteúdo da tela para baixo ao abrir)
        <Popover opened={opened} onChange={setOpened} position="bottom-end" shadow="md" width={360} withArrow>
            <Popover.Target>
                <button type="button" className="btn btn-outline-primary gap-2 whitespace-nowrap" aria-expanded={opened} onClick={toggle}>
                    <IconCaretDown className={`h-4 w-4 transition-transform ${opened ? '' : '-rotate-90'}`} />
                    De onde vieram essas vagas?
                </button>
            </Popover.Target>
            <Popover.Dropdown>
                <div className="mb-2 font-semibold">Grupos do Telegram pesquisados</div>
                <div className="max-h-72 overflow-y-auto">
                    {situation == 'loading' && <div>Carregando os grupos...</div>}
                    {situation == 'error' && <div>Não foi possível carregar os grupos agora. Tente de novo em alguns instantes.</div>}
                    {situation == 'loaded' && (
                        <ol className="list-decimal space-y-1.5 pl-5">
                            {telegramGroups.map((group) => (
                                <li key={group}>
                                    <a href={group} target="_blank" rel="noopener noreferrer" className="break-all text-primary hover:underline">
                                        {group.replace(/^https?:\/\//, '')}
                                    </a>
                                </li>
                            ))}
                        </ol>
                    )}
                </div>
            </Popover.Dropdown>
        </Popover>
    );
};

/** As linhas do grid de skills: a posição vem da lista inteira, para não recomeçar em cada página. */
type RankedSkill = SkillTotal & { position: number };

/** O filtro do grid ignora maiúsculas e acentos. */
const normalizeForFilter = (text: string) =>
    text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

/** Com o checkbox "Ver quais dessas habilidades estão em meu currículo" marcado, diz ao usuário, no título de cada habilidade, se o currículo dele tem a habilidade. */
const SkillInTheResume = ({ hasTheSkill }: { hasTheSkill: boolean }) => {
    if (hasTheSkill) {
        return (
            <span className="badge ml-2 inline-flex items-center gap-1 whitespace-nowrap bg-success text-xs" title="Esta habilidade está no seu currículo">
                <IconCircleCheck className="h-3.5 w-3.5" />
                Você tem
            </span>
        );
    }
    return (
        <span className="badge badge-outline-danger ml-2 inline-flex items-center gap-1 whitespace-nowrap text-xs" title="Esta habilidade não está no seu currículo">
            <IconXCircle className="h-3.5 w-3.5" />
            Não está no seu currículo
        </span>
    );
};

/** Ao lado do total, com o checkbox do currículo marcado: quantas skills da pesquisa o currículo tem e o percentual sobre o total. */
const SkillsInTheResumeCount = ({ skills, resumeSkills, desiredJob }: { skills: SkillTotal[]; resumeSkills: string[]; desiredJob: string }) => {
    const count = skills.filter((item) => resumeHasTheSkill(resumeSkills, item.skill)).length;
    const percent = percentLabel(count, skills.length);
    const ofTheDesiredJob = desiredJob ? ` de '${desiredJob}'` : '';
    return (
        <span>
            {' '}
            ({count} ({percent}) estão no seu currículo{ofTheDesiredJob})
        </span>
    );
};

/**
 * O grid paginado das skills, 50 por página, filtrado no navegador pelo nome da skill: cada linha expande o gráfico de
 * linhas com os meses da skill. Com resumeSkills (checkbox do currículo marcado), cada habilidade diz se está no currículo.
 */
const PAGE_SIZE = 50;

const SkillsGrid = ({ skills, seniority, ddd, resumeSkills, desiredJob }: { skills: SkillTotal[]; seniority: string; ddd: string; resumeSkills: string[] | null; desiredJob: string }) => {
    const [expandedRows, setExpandedRows] = useState<{ [skill: string]: boolean }>({});
    const [filter, setFilter] = useState('');
    const [page, setPage] = useState(1);
    const rankedSkills: RankedSkill[] = skills.map((item, index) => ({ ...item, position: index + 1 }));
    const normalizedFilter = normalizeForFilter(filter.trim());
    const filteredSkills = normalizedFilter ? rankedSkills.filter((item) => normalizeForFilter(skillLabel(item.skill)).includes(normalizedFilter)) : rankedSkills;
    const totalPages = Math.max(1, Math.ceil(filteredSkills.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const first = (currentPage - 1) * PAGE_SIZE;
    const pageSkills = filteredSkills.slice(first, first + PAGE_SIZE);
    // a linha inteira abre e fecha o gráfico: a coluna "Ver evolução" só mostra o que o clique faz
    const toggle = (item: RankedSkill) =>
        setExpandedRows((current) => {
            const { [item.skill]: wasExpanded, ...others } = current;
            return wasExpanded ? others : { ...others, [item.skill]: true };
        });
    return (
        <>
            <input
                type="search"
                className="form-input mb-3 w-full sm:max-w-xs"
                placeholder="Filtrar habilidades"
                aria-label="Filtrar habilidades"
                value={filter}
                onChange={(event) => {
                    setFilter(event.target.value);
                    setPage(1);
                }}
            />
            <p className="mb-2 flex items-center gap-1.5 text-sm text-white-dark">
                <IconInfoCircle className="h-4 w-4 shrink-0" />
                Clique em uma habilidade para ver quantas vagas pediram por ela mês a mês.
            </p>
            {/* o total é o da pesquisa (mês, senioridade e região); com o filtro de texto, também quantas sobraram */}
            <div className="mb-2 font-semibold">
                Total de ferramentas / habilidades / conceitos encontrados: {skills.length}
                {/* com o checkbox do currículo marcado: quantas da pesquisa inteira (não só as do filtro) o currículo tem */}
                {resumeSkills && <SkillsInTheResumeCount skills={skills} resumeSkills={resumeSkills} desiredJob={desiredJob} />}
                {normalizedFilter && <span className="font-normal text-white-dark"> ({filteredSkills.length} com o filtro)</span>}
            </div>
            <Table.ScrollContainer minWidth={520}>
                <Table highlightOnHover striped withRowBorders={false} verticalSpacing="xs">
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th className="w-16">#</Table.Th>
                            <Table.Th>Habilidade</Table.Th>
                            <Table.Th className="w-24">Vagas</Table.Th>
                            <Table.Th className="w-40"></Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {pageSkills.length == 0 && (
                            <Table.Tr>
                                <Table.Td colSpan={4} className="text-center text-white-dark">
                                    Nenhuma habilidade encontrada para este filtro.
                                </Table.Td>
                            </Table.Tr>
                        )}
                        {pageSkills.map((item) => {
                            const expanded = Boolean(expandedRows[item.skill]);
                            return (
                                <React.Fragment key={item.skill}>
                                    <Table.Tr className="cursor-pointer" onClick={() => toggle(item)} aria-expanded={expanded}>
                                        <Table.Td>{item.position}</Table.Td>
                                        <Table.Td>
                                            <span className="inline-flex flex-wrap items-center gap-y-1 font-semibold">
                                                {skillLabel(item.skill)}
                                                {resumeSkills && <SkillInTheResume hasTheSkill={resumeHasTheSkill(resumeSkills, item.skill)} />}
                                            </span>
                                        </Table.Td>
                                        <Table.Td>{item.total}</Table.Td>
                                        <Table.Td>
                                            <span className="inline-flex items-center gap-1 whitespace-nowrap text-primary">
                                                {expanded ? <IconCaretDown className="h-4 w-4 rotate-180" /> : <IconTrendingUp className="h-4 w-4" />}
                                                {expanded ? 'Ocultar' : 'Ver evolução'}
                                            </span>
                                        </Table.Td>
                                    </Table.Tr>
                                    {expanded && (
                                        <Table.Tr>
                                            <Table.Td colSpan={4} className="bg-white p-4 dark:bg-black">
                                                <SkillMonths skill={item.skill} seniority={seniority} ddd={ddd} />
                                            </Table.Td>
                                        </Table.Tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </Table.Tbody>
                </Table>
            </Table.ScrollContainer>
            {filteredSkills.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-white-dark">
                    <span>
                        {first + 1} a {Math.min(first + PAGE_SIZE, filteredSkills.length)} de {filteredSkills.length}
                    </span>
                    {totalPages > 1 && <Pagination total={totalPages} value={currentPage} onChange={setPage} size="sm" />}
                </div>
            )}
        </>
    );
};

/**
 * Grupos de vagas do Telegram, calculados dos anúncios e lidos por id. O botão "Pesquisar" lê as skills do mês, da
 * senioridade e da região (até 2026-11-09 era um menu com "Todas as Vagas" e "Vagas compatíveis comigo"). Mudar um filtro
 * esconde o resultado até a próxima pesquisa. O checkbox "Ver quais dessas habilidades estão em meu currículo" não
 * pesquisa: lê as habilidades do currículo do usuário (pede o login, e quem não tem currículo vai cadastrá-lo e volta
 * para cá com a mesma pesquisa e o checkbox marcado) e marca, em cada skill listada, se ela está no currículo. A pizza das
 * skills fica acima da lista, e cada skill expande um gráfico de linhas com os seus meses. A home abre a tela já
 * pesquisada, com searchOnOpening.
 */
export const SkillStatistics = ({ initialSeniority = 'pleno', searchOnOpening = false }: { initialSeniority?: string; searchOnOpening?: boolean }) => {
    const router = useRouter();
    const [month, setMonth] = useState(previousMonth());
    const [seniority, setSeniority] = useState(initialSeniority);
    const [ddd, setDdd] = useState('10');
    const [situation, setSituation] = useState<Situation>('idle');
    const [total, setTotal] = useState(0);
    const [skills, setSkills] = useState<SkillTotal[]>([]);
    // preenchido enquanto o checkbox do currículo está marcado: as habilidades do currículo, para comparar com as listadas
    const [resumeSkills, setResumeSkills] = useState<string[] | null>(null);
    // o cargo pretendido do currículo lido no último clique, que completa o rótulo do checkbox
    const [desiredJob, setDesiredJob] = useState('');

    const hideResult = () => {
        setSituation('idle');
    };

    const searchBy = (month: string, seniority: string, ddd: string) => {
        hideResult();
        setSituation('loading');
        const callbacks: any = { withoutSession: true };
        callbacks[200] = (response: any) => {
            setTotal(response.total);
            setSkills(parseSkills(response.skills));
            setSituation('loaded');
        };
        callbacks['onUnexpectedHttpStatus'] = () => setSituation('error');
        const uri = `statistics/skills/${monthParameter(month)}/${seniority}/${ddd}`;
        if (isFutureMonth(month)) {
            JnAjax.doAnAjaxRequest(uri, callbacks, 'GET', null as any, {}, API);
            return;
        }
        // o mês corrente ainda recebe vagas: guardado por 24 h; os passados não mudam mais e ficam 1 ano (até 2026-11-10
        // o mês corrente também ficava 1 ano e a tela mostrava a contagem do primeiro acesso, R12-2)
        const lifetime = month == currentMonth() ? JnAjax.PERSISTED_REQUEST_LIFETIME : JnAjax.PERSISTED_REQUEST_ONE_YEAR;
        JnAjax.doAPersistedRequest(uri, callbacks, API, lifetime);
    };

    const search = () => searchBy(month, seniority, ddd);

    const showTheResumeSkills = (resume: ResumeCopy) => {
        if (!isTechResumeCopy(resume)) {
            PubSub.publish('showMessage', { summary: 'Atenção', detail: 'Funcionalidade disponível apenas para currículos de tecnologia (Por enquanto)', severity: 'warn' });
            return;
        }
        setResumeSkills(resume.skills);
    };

    // a promessa da faixa do formulário: ao salvar o currículo, o usuário volta para cá com esta mesma pesquisa
    const fillTheResume = () => {
        waitForTheResume({ month, seniority, ddd });
        router.push('/meus-dados/sobre-mim');
    };

    const loadTheResume = () => {
        const callbacks: any = {};
        // sem login o JnAjax chama o 401 antes de enviar, e não desliga o carregamento que já ligou; o modal de login
        // aparece, e quem entra volta a este clique
        callbacks[401] = () => {
            JnAjax.setNotLoading()();
            JnAjax.getHandler401(compareWithTheResume)();
        };
        callbacks[200] = (response: any) => {
            const savedResume = savedResumeFrom(response);
            if (!savedResume) {
                fillTheResume();
                return;
            }
            const resume = resumeCopyFromSavedResume(savedResume);
            saveResumeCopy(resume);
            setDesiredJob(savedResume.desiredJob || '');
            showTheResumeSkills(resume);
        };
        callbacks[404] = fillTheResume;
        callbacks['onUnexpectedHttpStatus'] = () =>
            PubSub.publish('showMessage', { summary: 'Atenção', detail: 'Não foi possível ler o seu currículo agora. Tente de novo em alguns instantes.', severity: 'warn' });
        JnAjax.doAnAjaxRequest('resume/{email}', callbacks, 'GET', null as any, {}, API);
    };

    // todo clique pergunta ao backend, que valida a sessão (401 com sessão inválida ou expirada abre o modal de login): até
    // 2026-11-09 a cópia do currículo guardada no navegador bastava, e uma sessão vencida ainda via as habilidades
    const compareWithTheResume = loadTheResume;

    // o checkbox só mostra ou esconde a comparação: a lista de habilidades continua a da última pesquisa
    const toggleTheResumeComparison = (checked: boolean) => {
        if (!checked) {
            setResumeSkills(null);
            return;
        }
        compareWithTheResume();
    };

    // de volta do cadastro do currículo: a pesquisa de antes, já comparada com o currículo novo
    const searchAgainWithTheResume = () => {
        const filters = takeThePendingSearchFilters();
        const chosenMonth = filters ? filters.month : month;
        const chosenSeniority = filters ? filters.seniority : seniority;
        const chosenDdd = filters ? filters.ddd : ddd;
        setMonth(chosenMonth);
        setSeniority(chosenSeniority);
        setDdd(chosenDdd);
        searchBy(chosenMonth, chosenSeniority, chosenDdd);
        compareWithTheResume();
    };

    // ao sair do sistema, a comparação some: as habilidades do currículo só ficam na tela de quem está logado
    React.useEffect(() => {
        const token = PubSub.subscribe('logout', () => {
            setResumeSkills(null);
            setDesiredJob('');
        });
        return () => {
            PubSub.unsubscribe(token);
        };
    }, []);

    React.useEffect(() => {
        if (takeThePendingSearch()) {
            searchAgainWithTheResume();
            return;
        }
        // quem foi ao formulário e voltou sem salvar desiste da volta
        stopWaitingForTheResume();
        searchOnOpening && search();
    }, []);

    return (
        <div>
            <PageTitle>Grupos de vagas do telegram</PageTitle>
            <div className="panel mt-6">
                {/* mês, senioridade, região, "Pesquisar" e o checkbox do currículo numa linha só (quebra apenas em tela estreita) */}
                <MonthPicker
                    id="skillStatisticsMonth"
                    month={month}
                    min={FIRST_MONTH}
                    onChange={(chosenMonth) => {
                        setMonth(chosenMonth);
                        hideResult();
                    }}
                >
                    <label htmlFor="skillStatisticsSeniority" className="mb-0 font-semibold">
                        Senioridade
                    </label>
                    <Select
                        id="skillStatisticsSeniority"
                        className="w-36"
                        value={seniority}
                        onChange={(value) => {
                            if (!value) return;
                            setSeniority(value);
                            hideResult();
                        }}
                        data={seniorities.map((item) => ({ value: item.id, label: item.nome }))}
                        allowDeselect={false}
                        comboboxProps={{ withinPortal: false }}
                    />
                    <label htmlFor="skillStatisticsDdd" className="mb-0 font-semibold">
                        Região Metropolitana
                    </label>
                    <Select
                        id="skillStatisticsDdd"
                        className="w-56"
                        value={ddd}
                        onChange={(value) => {
                            if (!value) return;
                            setDdd(value);
                            hideResult();
                        }}
                        data={regions.map((item) => ({ value: item.id, label: item.nome }))}
                        searchable
                        nothingFoundMessage="Nenhuma região encontrada"
                        allowDeselect={false}
                        comboboxProps={{ withinPortal: false }}
                    />
                    <button type="button" className="btn btn-primary" onClick={search}>
                        Pesquisar
                    </button>
                    <Checkbox
                        label={`Ver quais dessas habilidades estão em meu currículo${desiredJob ? ` de '${desiredJob}'` : ''}`}
                        checked={resumeSkills != null}
                        onChange={(event) => toggleTheResumeComparison(event.currentTarget.checked)}
                    />
                </MonthPicker>
                <div className="mb-4">
                    <TelegramGroupsAccordion />
                </div>
                {situation == 'loading' && <div>Carregando as habilidades...</div>}
                {situation == 'error' && <div>Não foi possível carregar as estatísticas agora. Tente de novo em alguns instantes.</div>}
                {situation == 'loaded' && skills.length == 0 && <div>Nenhuma vaga encontrada para este filtro.</div>}
                {situation == 'loaded' && skills.length > 0 && (
                    <>
                        <SkillsPie skills={skills} vacancies={total} />
                        <SkillsGrid skills={skills} seniority={seniority} ddd={ddd} resumeSkills={resumeSkills} desiredJob={desiredJob} />
                    </>
                )}
            </div>
        </div>
    );
};
