import { emptyForm, PositionForm, senioritiesOf, seniorityOptions } from '@/presentation/pages/meu-recrutamento/vagas/positionsData';

/**
 * Os dados da tela Currículos -> Buscar (desde 2026-11-25): os mesmos filtros de contagem de currículos do modal
 * completo da vaga, guardados no formulário da vaga (PositionForm). A área vem preenchida com tecnologia e é o único
 * filtro obrigatório; sem região, todas; nenhuma faixa salarial ligada. Cada filtro escolhido vai ao POST resume-filter,
 * que devolve o id dos filtros (de vis_resume_filter); a tela o põe no endereço (?filtro=<id>) e, aberta com ele, lê os
 * filtros pelo GET resume-filter/{id} e preenche os campos (searchFormOf).
 */

// o parâmetro do endereço com o id dos filtros
export const FILTER_PARAMETER = 'filtro';

// tecnologia da informação
const TECHNOLOGY = '1';

export type ResumesSearch = { form: PositionForm; requiredSkills: string[] };

const positiveOrZero = (value: any) => {
    const number = Number(value);
    return Number.isInteger(number) && number > 0 ? number : 0;
};

const rangeOf = (range: any) => (range && range.min != null && range.max != null ? { min: Number(range.min), max: Number(range.max) } : null);

/** A busca vazia: só a área (tecnologia), todas as regiões e nenhum outro filtro. */
export const emptySearch = (): ResumesSearch => ({
    form: { ...emptyForm(), resumeType: TECHNOLOGY, ddd: [], hasClt: false, cltMin: '', cltMax: '', hasPj: false, pjMin: '', pjMax: '' },
    requiredSkills: [],
});

/**
 * A busca dos filtros gravados (a resposta do GET resume-filter/{id}, os campos da vaga como foram ao POST): o caminho
 * de volta de filtersRequestOf. As habilidades obrigatórias são as da categoria skillsFromText.
 */
export const searchFormOf = (filters: any): ResumesSearch => {
    const search = emptySearch();
    const clt = rangeOf(filters.clt);
    const pj = rangeOf(filters.pj);
    const languages = (filters.spokenLanguage || []).map((language: any) => ({ name: language.name, level: Number(language.level) }));
    const requiredSkills = (filters.skill || []).filter((skill: any) => skill.category == 'skillsFromText').map((skill: any) => skill.skill);
    const form: PositionForm = {
        ...search.form,
        resumeType: filters.resumeType != null ? String(Number(filters.resumeType)) : TECHNOLOGY,
        ddd: (filters.ddd || []).map((ddd: any) => String(Number(ddd))),
        seniority: senioritiesOf(filters.seniority),
        disponibility: positiveOrZero(filters.disponibility),
        temporallyJobTime: positiveOrZero(filters.temporallyJobTime),
        hasLanguages: languages.length > 0,
        spokenLanguage: languages,
        negotiableClaim: filters.negotiableClaim == true,
        pcd: filters.pcd == true,
        travel: filters.travel == true,
        hasClt: !!clt,
        cltMin: clt ? clt.min : '',
        cltMax: clt ? clt.max : '',
        hasPj: !!pj,
        pjMin: pj ? pj.min : '',
        pjMax: pj ? pj.max : '',
    };
    return { form, requiredSkills };
};

/**
 * "Contactar candidatos aderentes" (desde 2026-11-25): a vaga nova que leva aos candidatos dos filtros da busca. Os
 * filtros vão como estão; o que a busca deixa livre e a vaga exige vem preenchido com o equivalente: sem região, todas
 * (allDdds, com o home office); sem senioridade, todas. O texto da vaga (ou o descritivo das habilidades) vira a
 * descrição. O título, os contatos, o período, as faixas salariais (quando não filtradas) e as opções ficam com o
 * recrutador no modal.
 */
export const positionFormOfTheSearch = (form: PositionForm, skillsText: string, allDdds: string[], now: Date = new Date()): PositionForm => {
    const languages = form.spokenLanguage.map((language) => ({ ...language }));
    return {
        ...emptyForm(now),
        resumeType: form.resumeType,
        description: skillsText,
        ddd: form.ddd.length ? [...form.ddd] : [...allDdds],
        seniority: form.seniority.length ? [...form.seniority] : seniorityOptions.map((option) => option.value),
        hasLanguages: languages.length > 0,
        spokenLanguage: languages,
        disponibility: form.disponibility,
        temporallyJobTime: form.temporallyJobTime,
        pcd: form.pcd,
        travel: form.travel,
        negotiableClaim: form.negotiableClaim,
        // sem faixa filtrada, a CLT marcada e vazia, como numa vaga nova
        hasClt: form.hasClt || !form.hasPj,
        cltMin: form.hasClt ? form.cltMin : '',
        cltMax: form.hasClt ? form.cltMax : '',
        hasPj: form.hasPj,
        pjMin: form.pjMin,
        pjMax: form.pjMax,
    };
};

/** O endereço da tela com o id dos filtros, mantendo os outros parâmetros. */
export const addressWithTheFilter = (href: string, filterId: string) => {
    const url = new URL(href);
    url.searchParams.set(FILTER_PARAMETER, filterId);
    return url.pathname + url.search + url.hash;
};

// o parâmetro do endereço com o e-mail de quem compartilhou o link com o descritivo da vaga (desde 2026-11-26)
export const EMAIL_PARAMETER = 'email';

// o descritivo só vai no link com o tamanho que o backend aceita (o mesmo da descrição da vaga)
export const SHARED_DESCRIPTION_MIN = 100;

/**
 * O link para enviar a alguém (desde 2026-11-26): a tela só com o id dos filtros ou, com o descritivo da vaga gravado em
 * vis_resume_filter_description, também com o e-mail de quem o gravou. Os outros parâmetros do endereço ficam de fora.
 */
export const linkToShare = (href: string, filterId: string, email?: string) => {
    const url = new URL(href);
    const link = `${url.origin}${url.pathname}?${FILTER_PARAMETER}=${encodeURIComponent(filterId)}`;
    return email ? `${link}&${EMAIL_PARAMETER}=${encodeURIComponent(email).replace('%40', '@')}` : link;
};

// os reais sem centavos e com espaço comum depois do R$ (o toLocaleString de moeda põe um espaço não separável)
const reais = (value: number) => `R$ ${value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`;

// os anos com uma casa decimal só quando ela existe: "6 anos", "6,5 anos"
const yearsOf = (value: number) => `${value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} ${value == 1 ? 'ano' : 'anos'}`;

/**
 * A mensagem que "Copiar este link para enviar para alguém" põe na área de transferência (desde 2026-11-27): "Foram
 * encontrados N currículos (média CLT R$ X, média PJ R$ Y, média de experiência Z anos), veja os em <link>". Só entram as
 * médias que os currículos encontrados informaram; sem nenhuma, sem os parênteses. Um currículo só fica no singular. Sem
 * currículos o botão não aparece.
 */
export const sharedSearchMessage = (found: { resumes: number; cltAverage?: number; pjAverage?: number; experienceAverage?: number }, link: string) => {
    const averages = [
        found.cltAverage != null && `média CLT ${reais(found.cltAverage)}`,
        found.pjAverage != null && `média PJ ${reais(found.pjAverage)}`,
        found.experienceAverage != null && `média de experiência ${yearsOf(found.experienceAverage)}`,
    ].filter(Boolean);
    const one = found.resumes == 1;
    const count = one ? 'Foi encontrado 1 currículo' : `Foram encontrados ${found.resumes} currículos`;
    const withTheAverages = averages.length ? `${count} (${averages.join(', ')})` : count;
    return `${withTheAverages}, veja ${one ? 'o' : 'os'} em ${link}`;
};

/** O caminho do GET dos filtros do id; com o e-mail do link, os filtros voltam com o descritivo gravado por ele. */
export const resumeFilterPath = (filterId: string, email?: string | null) =>
    `resume-filter/${encodeURIComponent(filterId)}${email ? `?${EMAIL_PARAMETER}=${encodeURIComponent(email)}` : ''}`;
