'use client';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Dialog } from 'primereact/dialog';
import PubSub from 'pubsub-js';
import React, { useState } from 'react';
import JnAjax from '@/app/JnAjax';
import {
    ResumeCopy,
    isTechResumeCopy,
    readResumeCopy,
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
import { MonthTotal, SkillTotal, monthLabel, parseMonths, parseSkills, percentLabel, pieSlices, pieTotal, requirementsLabel, skillLabel } from './skillStatisticsData';

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
        JnAjax.doAPersistedRequest(`statistics/skills/${seniority}/${ddd}/months?skill=${encodeURIComponent(skill)}`, callbacks, API);
    }, [skill, seniority, ddd]);

    if (situation == 'error') {
        return <div>Não foi possível carregar os meses desta habilidade agora.</div>;
    }
    if (situation != 'loaded') {
        return <div>Carregando os meses...</div>;
    }
    const options: any = {
        chart: { type: 'line', toolbar: { show: false }, zoom: { enabled: false } },
        colors: [lineColor],
        stroke: { width: 2, curve: 'straight' },
        markers: { size: months.length == 1 ? 4 : 0, hover: { size: 5 } },
        grid: { borderColor: 'rgba(128, 128, 128, 0.2)', strokeDashArray: 3 },
        xaxis: { categories: months.map((month) => monthLabel(month.yearMonth)), tickAmount: Math.min(months.length, 12), labels: { rotate: -45 } },
        yaxis: { min: 0, forceNiceScale: true, labels: { formatter: (value: number) => `${Math.round(value)}` } },
        tooltip: { y: { title: { formatter: () => 'Vagas:' } } },
    };
    return <ReactApexChart type="line" height={260} options={options} series={[{ name: 'Vagas', data: months.map((month) => month.total) }]} />;
};

/** A pizza das skills do filtro: o total por fora, a porcentagem de cada cor na fatia e na legenda, o número no tooltip. */
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
    return (
        <div className="mb-6">
            <div className="mb-2 font-semibold">{requirementsLabel(total, vacancies)}</div>
            <ReactApexChart type="pie" height={340} options={options} series={values} />
        </div>
    );
};

/** O link que abre o modal com os grupos do Telegram pesquisados, lidos do backend ao abrir. */
const TelegramGroupsLink = () => {
    const [visible, setVisible] = useState(false);
    const [telegramGroups, setTelegramGroups] = useState<string[]>([]);

    const open = () => {
        setVisible(true);
        const callbacks: any = { withoutSession: true };
        callbacks[200] = (response: any) => setTelegramGroups(response.groups);
        callbacks['onUnexpectedHttpStatus'] = () =>
            PubSub.publish('showMessage', { summary: 'Atenção', detail: 'Não foi possível carregar os grupos agora. Tente de novo em alguns instantes.', severity: 'warn' });
        JnAjax.doAPersistedRequest('statistics/skills/telegramGroups', callbacks, API);
    };

    return (
        <>
            <button type="button" className="text-primary hover:underline" onClick={open}>
                Grupos pesquisados
            </button>
            <Dialog visible={visible} header="Grupos pesquisados" style={{ width: '90vw', maxWidth: '520px' }} onHide={() => setVisible(false)}>
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
            </Dialog>
        </>
    );
};

/** O modal que obriga quem tem mais de um DDD no currículo a escolher um antes da pesquisa. */
const DddChooser = ({ ddds, onChoose, onCancel }: { ddds: number[]; onChoose: (ddd: string) => void; onCancel: () => void }) => {
    const [chosen, setChosen] = useState('');
    const options = regions.filter((region) => ddds.map(String).includes(region.id));
    return (
        <Dialog visible header="Escolha o DDD de preferência" style={{ width: '90vw', maxWidth: '420px' }} onHide={onCancel}>
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
        </Dialog>
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
    const [open, setOpen] = useState<string[]>([]);
    const [resumeToChooseDdd, setResumeToChooseDdd] = useState<ResumeCopy | null>(null);

    const hideResult = () => {
        setSituation('idle');
        setOpen([]);
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
        JnAjax.doAPersistedRequest(uri, callbacks, API);
    };

    const search = () => searchBy(month, seniority, ddd);

    // o resultado segue os filtros da tela: eles passam a mostrar o que foi pesquisado, e os gráficos de linhas os usam
    const searchCompatiblePositions = (resume: ResumeCopy, chosenDdd: string) => {
        const chosenMonth = previousMonth();
        const chosenSeniority = seniorityOf(resume, new Date().getFullYear());
        setResumeToChooseDdd(null);
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
        if (resumeCopy) {
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

    const toggle = (skill: string) => setOpen((current) => (current.includes(skill) ? current.filter((item) => item != skill) : [...current, skill]));

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
                >
                    <TelegramGroupsLink />
                </MonthPicker>
                <div className="mb-4 flex flex-wrap items-center gap-3">
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
                                    <i className="pi pi-chevron-down ml-2" />
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
                {resumeToChooseDdd && (
                    <DddChooser ddds={resumeToChooseDdd.ddd} onChoose={(chosenDdd) => searchCompatiblePositions(resumeToChooseDdd, chosenDdd)} onCancel={() => setResumeToChooseDdd(null)} />
                )}
                {situation == 'loading' && <div>Carregando as habilidades...</div>}
                {situation == 'error' && <div>Não foi possível carregar as estatísticas agora. Tente de novo em alguns instantes.</div>}
                {situation == 'loaded' && skills.length == 0 && <div>Nenhuma vaga encontrada para este filtro.</div>}
                {situation == 'loaded' && skills.length > 0 && (
                    <>
                        <h5 className="mb-4 text-lg font-semibold">
                            {total} {total == 1 ? 'vaga' : 'vagas'}, {skills.length} {skills.length == 1 ? 'Habilidade diferente' : 'Habilidades diferentes'}
                        </h5>
                        <SkillsPie skills={skills} vacancies={total} />
                        <div className="space-y-2 font-semibold">
                            {skills.map((item, index) => {
                                const expanded = open.includes(item.skill);
                                return (
                                    <div key={item.skill} className="rounded border border-[#d3d3d3] dark:border-[#1b2e4b]">
                                        <button type="button" className="flex w-full items-center justify-between p-3" aria-expanded={expanded} onClick={() => toggle(item.skill)}>
                                            <span className="flex items-center gap-2">
                                                <i className={expanded ? 'pi pi-chevron-down' : 'pi pi-chevron-right'} />
                                                {index + 1}: {skillLabel(item.skill)}
                                            </span>
                                            <span>{item.total}</span>
                                        </button>
                                        {expanded && (
                                            <div className="p-3 font-normal">
                                                <SkillMonths skill={item.skill} seniority={seniority} ddd={ddd} />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
