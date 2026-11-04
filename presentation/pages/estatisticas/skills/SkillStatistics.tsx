'use client';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Modal, Pagination, Table } from '@mantine/core';
import IconCaretDown from '@/presentation/icons/icon-caret-down';
import IconCircleCheck from '@/presentation/icons/icon-circle-check';
import IconXCircle from '@/presentation/icons/icon-x-circle';
import IconInfoCircle from '@/presentation/icons/icon-info-circle';
import IconTrendingUp from '@/presentation/icons/icon-trending-up';
import PubSub from 'pubsub-js';
import React, { useState } from 'react';
import JnAjax from '@/app/JnAjax';
import {
    ResumeCopy,
    hasSkillsInTheCopy,
    isTechResumeCopy,
    readResumeCopy,
    resumeHasTheSkill,
    resumeCopyFromSavedResume,
    saveResumeCopy,
    savedResumeFrom,
    seniorityOf,
    takeThePendingSearch,
    waitForTheResume,
} from '@/presentation/components/resume-copy/resumeCopy';
import { MonthPicker, isFutureMonth, monthParameter, previousMonth } from '@/presentation/components/month-picker/MonthPicker';
import { dddRegions } from '@/presentation/components/regions/dddRegions';
import Dropdown from '@/presentation/utils/dropdown';
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
        JnAjax.doAPersistedRequest(`statistics/skills/${seniority}/${ddd}/months?skill=${encodeURIComponent(skill)}`, callbacks, API, JnAjax.PERSISTED_REQUEST_ONE_YEAR);
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

/** A pizza das skills do filtro: o total por fora, a porcentagem de cada cor na fatia e na legenda, o número no tooltip. */
// fica num accordion que nasce fechado, com o total de vagas e de skills dentro dele
const SkillsPie = ({ skills, vacancies }: { skills: SkillTotal[]; vacancies: number }) => {
    const { labels, values } = pieSlices(skills);
    const total = pieTotal(values);
    const options: any = {
        chart: { type: 'pie' },
        labels,
        colors: sliceColors,
        stroke: { width: 2 },
        plotOptions: { pie: { dataLabels: { minAngleToShowLabel: 18 } } },
        legend: { position: 'bottom', formatter: (label: string, legend: any) => `${label}: ${percentLabel(values[legend.seriesIndex], total)}` },
        dataLabels: { enabled: true, formatter: (percent: number, dataLabel: any) => percentLabel(values[dataLabel.seriesIndex], total) },
        tooltip: { y: { formatter: (value: number) => `${value} vagas` } },
    };
    const [expanded, setExpanded] = useState(false);
    return (
        <div className="mb-6 rounded border border-[#d3d3d3] dark:border-[#1b2e4b]">
            <button type="button" className="flex w-full items-center gap-2 px-3 py-2 font-semibold" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
                <IconCaretDown className={`h-4 w-4 transition-transform ${expanded ? '' : '-rotate-90'}`} />
                Ver distribuição por habilidades
            </button>
            {expanded && (
                <div className="border-t border-[#d3d3d3] p-3 dark:border-[#1b2e4b]">
                    <h5 className="mb-2 text-lg font-semibold">
                        {vacancies} {vacancies == 1 ? 'vaga' : 'vagas'}, {skills.length} {skills.length == 1 ? 'Habilidade diferente' : 'Habilidades diferentes'}
                    </h5>
                    <div className="mb-2 font-semibold">{requirementsLabel(total, vacancies)}</div>
                    <ReactApexChart type="pie" height={340} options={options} series={values} />
                </div>
            )}
        </div>
    );
};

/** O accordion dos grupos do Telegram pesquisados: cada vez que é expandido, lê os grupos do backend. */
const TelegramGroupsAccordion = () => {
    const [expanded, setExpanded] = useState(false);
    const [situation, setSituation] = useState<Situation>('idle');
    const [telegramGroups, setTelegramGroups] = useState<string[]>([]);

    const toggle = () => {
        if (expanded) {
            setExpanded(false);
            return;
        }
        setExpanded(true);
        setSituation('loading');
        const callbacks: any = { withoutSession: true };
        callbacks[200] = (response: any) => {
            setTelegramGroups(response.groups || []);
            setSituation('loaded');
        };
        callbacks['onUnexpectedHttpStatus'] = () => setSituation('error');
        JnAjax.doAPersistedRequest('statistics/skills/telegramGroups', callbacks, API, JnAjax.PERSISTED_REQUEST_ONE_YEAR);
    };

    return (
        <div className="w-full max-w-[520px] rounded border border-[#d3d3d3] dark:border-[#1b2e4b] sm:w-auto sm:min-w-[260px]">
            <button type="button" className="flex w-full items-center gap-2 px-3 py-2 font-semibold" aria-expanded={expanded} onClick={toggle}>
                <IconCaretDown className={`h-4 w-4 transition-transform ${expanded ? '' : '-rotate-90'}`} />
                De onde vieram essas vagas?
            </button>
            {expanded && (
                <div className="max-h-72 overflow-y-auto border-t border-[#d3d3d3] p-3 dark:border-[#1b2e4b]">
                    {situation == 'loading' && <div>Carregando os grupos...</div>}
                    {situation == 'error' && <div>Não foi possível carregar os grupos agora. Tente de novo em alguns instantes.</div>}
                    {situation == 'loaded' && (
                        <ul className="space-y-2">
                            {telegramGroups.map((group, index) => (
                                <li key={group}>
                                    {index + 1}:{' '}
                                    <a href={group} target="_blank" rel="noopener noreferrer" className="break-all text-primary hover:underline">
                                        {group}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
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

/** Na pesquisa "Vagas compatíveis comigo", diz ao usuário, no título de cada habilidade, se o currículo dele tem a habilidade. */
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

/**
 * O grid paginado das skills, 50 por página, filtrado no navegador pelo nome da skill: cada linha expande o gráfico de
 * linhas com os meses da skill. Com resumeSkills (pesquisa "Vagas compatíveis comigo"), cada habilidade diz se está no currículo.
 */
const PAGE_SIZE = 50;

const SkillsGrid = ({ skills, seniority, ddd, resumeSkills }: { skills: SkillTotal[]; seniority: string; ddd: string; resumeSkills: string[] | null }) => {
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

/** O modal que obriga quem tem mais de um DDD no currículo a escolher um antes da pesquisa. */
const DddChooser = ({ ddds, onChoose, onCancel }: { ddds: number[]; onChoose: (ddd: string) => void; onCancel: () => void }) => {
    const [chosen, setChosen] = useState('');
    const options = regions.filter((region) => ddds.map(String).includes(region.id));
    return (
        <Modal opened title="Escolha o DDD de preferência" size="sm" onClose={onCancel}>
            <label htmlFor="compatiblePositionsDdd" className="font-semibold">
                Região Metropolitana
            </label>
            <select id="compatiblePositionsDdd" className="form-select mb-4 w-full" value={chosen} onChange={(event) => setChosen(event.target.value)}>
                <option value="">Selecione</option>
                {options.map((item) => (
                    <option key={item.id} value={item.id}>
                        {item.nome}
                    </option>
                ))}
            </select>
            <button type="button" className="btn btn-primary" disabled={!chosen} onClick={() => onChoose(chosen)}>
                Pesquisar
            </button>
        </Modal>
    );
};

/**
 * Grupos de vagas do Telegram, calculados dos anúncios e lidos por id. O botão "Pesquisar" abre duas opções: "Todas as
 * Vagas" lê as skills do mês, da senioridade e da região, e "Vagas compatíveis comigo" faz a mesma pesquisa no mês anterior ao corrente,
 * com a senioridade e o DDD do currículo do usuário. Mudar um filtro esconde o resultado até a próxima pesquisa. A pizza
 * das skills fica acima da lista, e cada skill expande um gráfico de linhas com os seus meses. A home abre a tela já
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
    const [resumeToChooseDdd, setResumeToChooseDdd] = useState<ResumeCopy | null>(null);
    // só a pesquisa "Vagas compatíveis comigo" preenche: as demais pesquisas não comparam com o currículo
    const [resumeSkills, setResumeSkills] = useState<string[] | null>(null);

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
        JnAjax.doAPersistedRequest(uri, callbacks, API, JnAjax.PERSISTED_REQUEST_ONE_YEAR);
    };

    const search = () => {
        setResumeSkills(null);
        searchBy(month, seniority, ddd);
    };

    // o resultado segue os filtros da tela: eles passam a mostrar o que foi pesquisado, e os gráficos de linhas os usam
    const searchCompatiblePositions = (resume: ResumeCopy, chosenDdd: string) => {
        const chosenMonth = previousMonth();
        const chosenSeniority = seniorityOf(resume, new Date().getFullYear());
        setResumeToChooseDdd(null);
        setResumeSkills(resume.skills);
        setMonth(chosenMonth);
        setSeniority(chosenSeniority);
        setDdd(chosenDdd);
        searchBy(chosenMonth, chosenSeniority, chosenDdd);
    };

    const searchByTheResume = (resume: ResumeCopy) => {
        if (!isTechResumeCopy(resume)) {
            PubSub.publish('showMessage', { summary: 'Atenção', detail: 'Funcionalidade disponível apenas para currículos de tecnologia (Por enquanto)', severity: 'warn' });
            return;
        }
        if (resume.ddd.length > 1) {
            setResumeToChooseDdd(resume);
            return;
        }
        searchCompatiblePositions(resume, String(resume.ddd[0]));
    };

    const fillTheResume = () => {
        waitForTheResume();
        PubSub.publish('showMessage', { summary: 'Preencha o seu currículo', detail: 'Ao salvar, voltamos para a pesquisa de vagas compatíveis com você.', severity: 'info' });
        router.push('/meus-dados/sobre-mim');
    };

    const loadTheResume = () => {
        const callbacks: any = {};
        // sem login o JnAjax chama o 401 antes de enviar, e não desliga o carregamento que já ligou
        callbacks[401] = () => {
            JnAjax.setNotLoading()();
            JnAjax.getHandler401(findCompatiblePositions)();
        };
        callbacks[200] = (response: any) => {
            const savedResume = savedResumeFrom(response);
            if (!savedResume) {
                fillTheResume();
                return;
            }
            const resume = resumeCopyFromSavedResume(savedResume);
            saveResumeCopy(resume);
            searchByTheResume(resume);
        };
        callbacks[404] = fillTheResume;
        callbacks['onUnexpectedHttpStatus'] = () => setSituation('error');
        JnAjax.doAnAjaxRequest('resume/{email}', callbacks, 'GET', null as any, {}, API);
    };

    // a cópia do navegador só vale para quem fez login: sem ele, o endpoint responde 401 e pede o login
    const findCompatiblePositions = () => {
        const resumeCopy = JnAjax.hasLogin() ? readResumeCopy() : null;
        // a cópia gravada antes das habilidades entrarem nela é lida de novo do backend
        if (resumeCopy && hasSkillsInTheCopy(resumeCopy)) {
            searchByTheResume(resumeCopy);
            return;
        }
        loadTheResume();
    };

    React.useEffect(() => {
        if (takeThePendingSearch()) {
            findCompatiblePositions();
            return;
        }
        searchOnOpening && search();
    }, []);

    return (
        <div>
            <ul className="flex space-x-2 rtl:space-x-reverse">
                <li>
                    <Link href="#" className="text-primary hover:underline">
                        Grupos de vagas do telegram
                    </Link>
                </li>
            </ul>
            <div className="panel mt-6">
                <MonthPicker
                    id="skillStatisticsMonth"
                    month={month}
                    min={FIRST_MONTH}
                    onChange={(chosenMonth) => {
                        setMonth(chosenMonth);
                        hideResult();
                    }}
                />
                <div className="mb-4 flex flex-wrap items-start gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                        <label htmlFor="skillStatisticsSeniority" className="mb-0 font-semibold">
                            Senioridade
                        </label>
                        <select
                            id="skillStatisticsSeniority"
                            className="form-select w-auto"
                            value={seniority}
                            onChange={(event) => {
                                setSeniority(event.target.value);
                                hideResult();
                            }}
                        >
                            {seniorities.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.nome}
                                </option>
                            ))}
                        </select>
                        <label htmlFor="skillStatisticsDdd" className="mb-0 font-semibold">
                            Região Metropolitana
                        </label>
                        <select
                            id="skillStatisticsDdd"
                            className="form-select w-auto"
                            value={ddd}
                            onChange={(event) => {
                                setDdd(event.target.value);
                                hideResult();
                            }}
                        >
                            {regions.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.nome}
                                </option>
                            ))}
                        </select>
                        <div className="dropdown">
                            <Dropdown
                                offset={[0, 4]}
                                placement="bottom-start"
                                btnClassName="btn btn-primary"
                                button={
                                    <>
                                        Pesquisar
                                        <IconCaretDown className="ml-2 h-4 w-4" />
                                    </>
                                }
                            >
                                <ul className="whitespace-nowrap">
                                    <li>
                                        <button type="button" onClick={search}>
                                            Todas as Vagas
                                        </button>
                                    </li>
                                    <li>
                                        <button type="button" onClick={findCompatiblePositions}>
                                            Vagas compatíveis comigo
                                        </button>
                                    </li>
                                </ul>
                            </Dropdown>
                        </div>
                    </div>
                    <TelegramGroupsAccordion />
                </div>
                {resumeToChooseDdd && (
                    <DddChooser ddds={resumeToChooseDdd.ddd} onChoose={(chosenDdd) => searchCompatiblePositions(resumeToChooseDdd, chosenDdd)} onCancel={() => setResumeToChooseDdd(null)} />
                )}
                {situation == 'loading' && <div>Carregando as habilidades...</div>}
                {situation == 'error' && <div>Não foi possível carregar as estatísticas agora. Tente de novo em alguns instantes.</div>}
                {situation == 'loaded' && skills.length == 0 && <div>Nenhuma vaga encontrada para este filtro.</div>}
                {situation == 'loaded' && skills.length > 0 && (
                    <>
                        <SkillsPie skills={skills} vacancies={total} />
                        <SkillsGrid skills={skills} seniority={seniority} ddd={ddd} resumeSkills={resumeSkills} />
                    </>
                )}
            </div>
        </div>
    );
};
