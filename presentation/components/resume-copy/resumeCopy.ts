import JnAjax from '@/app/JnAjax';

/** Só o que a pesquisa "Vagas compatíveis comigo" usa: salário, PCD e demais dados do currículo não vão para o navegador. */
export type ResumeCopy = { resumeType: number; ddd: number[]; experienceStartYear: number };

const RESUME_COPY = 'resumeCopy';
const COPY_STATUS = 200;
const TECH_RESUME = 1;

const WAITING_FOR_THE_RESUME = 'compatiblePositionsWaitingForTheResume';
const FILL_THE_RESUME = 'fillTheResume';
const SEARCH_AGAIN = 'searchAgain';

/** As faixas de VisSeniorityType no backend: anos a partir de min e abaixo de max. */
const seniorities = [
    { id: 'estag', max: 1 },
    { id: 'junior', max: 3 },
    { id: 'pleno', max: 5 },
    { id: 'senior', max: 10 },
];

/** O registro de GetData vem debaixo do nome da entidade onde está; o inativo também é um currículo salvo. */
export const savedResumeFrom = (response: any) => {
    const { vis_resume: active, vis_inactive_resume: inactive } = response || {};
    const records = [active, inactive].filter((record) => record && Object.keys(record).length > 0);
    return records[0];
};

/** O backend devolve em experience o ano em que a experiência começou. */
export const resumeCopyFromSavedResume = (resume: any): ResumeCopy => ({ resumeType: resume.resumeType, ddd: resume.ddd, experienceStartYear: resume.experience });

export const isTechResumeCopy = (copy: ResumeCopy) => copy.resumeType == TECH_RESUME;

export const seniorityOf = (copy: ResumeCopy, currentYear: number) => {
    const years = currentYear - copy.experienceStartYear;
    const seniority = seniorities.find((item) => years < item.max);
    return seniority ? seniority.id : 'especialista';
};

/** A cópia fica debaixo do e-mail do usuário: só quem fez login com aquele e-mail chega a ela. */
export const saveResumeCopy = (copy: ResumeCopy) => {
    const { email } = JnAjax.getLogin() as any;
    JnAjax.addCachedRequest(email, RESUME_COPY, COPY_STATUS, copy);
};

export const readResumeCopy = (): ResumeCopy | undefined => {
    const { email } = JnAjax.getLogin() as any;
    return JnAjax.getCachedRequest(email, RESUME_COPY, { [COPY_STATUS]: () => {} }) as any;
};

export const removeResumeCopy = () => {
    const { email } = JnAjax.getLogin() as any;
    JnAjax.removeAllCachedRequests(email, RESUME_COPY);
};

/** Vale para a aba do navegador: quem foi mandado ao formulário volta à pesquisa depois de salvar. */
export const waitForTheResume = () => sessionStorage.setItem(WAITING_FOR_THE_RESUME, FILL_THE_RESUME);

/** Chamada ao salvar o currículo: diz se a tela de vagas está esperando por ele. */
export const resumeSavedForTheSearch = () => {
    const waiting = sessionStorage.getItem(WAITING_FOR_THE_RESUME) == FILL_THE_RESUME;
    if (!waiting) {
        return false;
    }
    sessionStorage.setItem(WAITING_FOR_THE_RESUME, SEARCH_AGAIN);
    return true;
};

/** Chamada ao abrir a tela de vagas: diz, uma vez só, se a pesquisa deve ser refeita. */
export const takeThePendingSearch = () => {
    const pending = sessionStorage.getItem(WAITING_FOR_THE_RESUME) == SEARCH_AGAIN;
    if (!pending) {
        return false;
    }
    sessionStorage.removeItem(WAITING_FOR_THE_RESUME);
    return true;
};
