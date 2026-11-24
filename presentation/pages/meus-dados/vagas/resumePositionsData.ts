import { dddRegions } from '@/presentation/components/regions/dddRegions';
import { HOME_OFFICE, totalDeRegioesMetropolitanas } from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/tabs/TabFilter/RegioesComponent';
import { Contact, SalaryRange, senioritiesOf, seniorityOptions } from '@/presentation/pages/meu-recrutamento/vagas/positionsData';

/**
 * A tela "Meus dados → Minhas vagas" (desde 2026-11-24): as vagas abertas aos próprios candidatos que o currículo do
 * candidato logado atende, como GET /resume/{email}/positions as devolve (só os campos que o candidato pode ver).
 */
export type PositionOfTheResume = {
    title: string;
    description: string;
    resumeType: number;
    seniority: string | string[];
    ddd: string[] | number[];
    clt?: SalaryRange;
    pj?: SalaryRange;
    expiration: { min: number | string; max: number | string };
    contact: Contact[];
};

const pad = (value: number) => String(value).padStart(2, '0');

const money = (value: number) => Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

/** As vagas mais recentes primeiro (o início da validade). */
export const newestFirst = (positions: PositionOfTheResume[]) => [...positions].sort((first, second) => Number(second.expiration.min) - Number(first.expiration.min));

/** As senioridades pelos seus nomes, na ordem da tela de cadastro. */
export const senioritiesLabel = (seniority: string | string[] | undefined) => {
    const chosen = senioritiesOf(seniority);
    return seniorityOptions.filter((option) => chosen.includes(option.value)).map((option) => option.label).join(', ');
};

/** As regiões da vaga: "Home office" primeiro; todas as regiões viram "Qualquer estado / cidade". */
export const regionsLabel = (ddds: (string | number)[]) => {
    const ids = ddds.map(String);
    const homeOffice = ids.includes(HOME_OFFICE) ? ['Home office'] : [];
    const regions = ids.filter((ddd) => ddd != HOME_OFFICE);
    if (regions.length >= totalDeRegioesMetropolitanas) return [...homeOffice, 'Qualquer estado / cidade'].join(', ');
    const names = regions.map((ddd) => dddRegions.find((region) => region.id == ddd)?.nome || ddd);
    return [...homeOffice, ...names].join(', ');
};

/** A faixa salarial ("R$ 5.000 a R$ 8.000"); vazio sem faixa. */
export const salaryLabel = (range?: SalaryRange) => (range ? `${money(range.min)} a ${money(range.max)}` : '');

/** O último dia da validade da vaga (dd/mm/aaaa). */
export const validUntilLabel = (max: number | string) => {
    const date = new Date(Number(max));
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
};

/** O endereço que o link do contato abre: a conversa do WhatsApp, o e-mail ou a página do recrutador. */
export const contactHref = (contact: Contact) => {
    const value = contact.value.trim();
    if (contact.type == 'whatsapp') return `https://wa.me/${value.replace(/\D/g, '')}`;
    if (contact.type == 'email') return `mailto:${value}`;
    return /^https?:\/\//i.test(value) ? value : `https://${value}`;
};

/** O texto do botão de cada contato. */
export const contactLabel = (contact: Contact) => {
    if (contact.type == 'whatsapp') return `WhatsApp ${contact.value.trim()}`;
    if (contact.type == 'email') return `E-mail ${contact.value.trim()}`;
    return 'Página da vaga';
};
