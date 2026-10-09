'use client';
import { create } from 'zustand';

import { ReactSortable } from 'react-sortablejs';

import { InputText } from 'primereact/inputtext';

import React, { useState } from 'react';

import { ScrollPanel } from 'primereact/scrollpanel';

import { Accordion, AccordionTab } from 'primereact/accordion';

import { Tooltip } from 'primereact/tooltip';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { MultiSelect } from 'primereact/multiselect';
import { Chips } from 'primereact/chips';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { LabelComponent } from '@/presentation/components/source/LabelComponent';
import { LoadingButton } from '@/presentation/components/source/LoadingButton';
import PubSub from 'pubsub-js';
import JnAjax from '@/app/JnAjax';
import { TabResumeStore } from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/tabs/TabResume/FormResume';

export class SkillListModel {
    constructor(main: boolean = false, filter: string = '', list: any[] = [], originalList: any[] = [], title: string, name: string) {}
}
export interface ITabSkillStore {
    setGroups: (groups: SkillListModel[], getAccordionList: (group: any) => any[]) => void;
    getWordsFromGroup: (name: string) => string[];
    setContext: (context: any) => void;
    loadSkillsContext: () => any;
    groups: SkillListModel[];
    accordionList: any[];
    context: any;
}
const getSorter = (fieldName: string) => {
    const sorter = (a: any, b: any) => {
        return ('' + a[fieldName]).localeCompare('' + b[fieldName]);
    };
    return sorter;
};

export const TabSkillStore = create<ITabSkillStore>((set, get) => ({
    loadSkillsContext: () => {
        const { context, groups, accordionList } = get();
        const skillsContext = getSkillsContext(context, groups, accordionList);
        return skillsContext;
    },

    setGroups: (groups: SkillListModel[], getAccordionList: (group: any) => any[]) => {
        groups.forEach((group) => {
            group.list && group.list.sort(getSorter('label'));
            group.originalList = [...group.list];
        });

        const accordionList = getAccordionList(groups.filter((group) => group.main)[0]);

        accordionList.sort(getSorter('skill'));

        set({ groups, accordionList });
    },
    getWordsFromGroup: (name: string) => {
        const { groups } = get();
        const found = groups.filter((x: any) => x.name == name)[0];
        return (found && found.list) || [];
    },

    setContext: (context: any) => {
        set({ context });
    },

    groups: [],
    accordionList: [],
    context: {},
    skillsContext: {},
}));
export interface TabSkillsProps {
    getAccordionList: (group: any) => any[];
}

export const TabSkills2: React.FC<TabSkillsProps> = ({ getAccordionList }) => {
    const { groups, setGroups } = TabSkillStore((state: ITabSkillStore) => ({
        ...state,
    }));

    const transferToAnotherList = (name: string, item: any) => {
        let allItems: any[] = [];

        for (let index in groups) {
            const group = groups[index];
            allItems = [...allItems, ...group.list];
        }

        const obj = allItems.filter((x) => x.label == item)[0];

        for (let index in groups) {
            const group = groups[index];
            if (group.name == name) {
                group.list = [...group.list, obj];
                continue;
            }

            group.list = group.list.filter((x: any) => x.label != obj.label);
        }
        setGroups(groups, getAccordionList);
    };

    const setValue = (name: string, field: string, value: any) => {
        groups.filter((group: any) => group.name == name)[0][field] = value;
        setGroups(groups, getAccordionList);
    };

    const setFilter = (name: string, filter: any) => {
        const group = groups.filter((group: any) => group.name == name)[0];
        group.filter = filter;
    };

    const width = groups.length ? 100 / (groups.length + 1) + '%' : '';
    return (
        <div className="flex-column flex" style={{ maxHeight: '1000px' }}>
            <AccordionList width={width} />
            {groups.map((group: any) => (
                <SkillList
                    transferToAnotherList={(item: any) => transferToAnotherList(group.name, item)}
                    setFilter={(obj) => setValue(group.name, 'filter', obj)}
                    setList={(obj) => setValue(group.name, 'list', obj)}
                    filter={group.filter}
                    title={group.title}
                    list={group.list}
                    main={group.main}
                    key={group.name}
                    width={width}
                />
            ))}
        </div>
    );
};

interface SkillListProps {
    transferToAnotherList: (item: any) => void;
    setFilter: (filter: string) => void;
    setList: (list: any[]) => void;
    filter: string;
    title: string;
    width: string;
    main: boolean;
    list: any[];
}

const getSkillsContext = (context: any, groups: any[], accordionList: any[]) => {
    const skillsContext: any[] = [];

    const discardedSkills = context.discardedSkills || {};

    for (let type in discardedSkills) {
        const array = discardedSkills[type] || [];
        const category = 'discardedSkills';
        for (let index in array) {
            const sk = array[index];
            const skill = { ...sk, type, category };
            skillsContext.push(skill);
        }
    }

    for (let groupIndex in groups) {
        const group = groups[groupIndex] || {};
        const array = group.list || [];
        const type = group.name;
        const category = type;
        for (let index in array) {
            const sk = array[index];
            const skill = { ...sk, type, category };
            skillsContext.push(skill);
        }
    }

    for (let index in accordionList) {
        const skill = accordionList[index];
        if (!skill) {
            continue;
        }
        skill.category = 'parent';
        skill.type = 'parent';
        skillsContext.push(skill);
    }

    return skillsContext;
};

// A habilidade sugerida precisa constar no texto do currículo exatamente como foi escrita: a frase inteira, sem ser
// pedaço de outra palavra (maiúsculas e espaços repetidos não contam). Devolve true (e avisa o candidato) quando não consta.
const isSkillOutOfTheResume = (word: string) => {
    const resumeText = TabResumeStore.getState().resumeText || '';
    const normalizedResume = resumeText.toUpperCase().replace(/\s+/g, ' ');
    const escapedWord = word.toUpperCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '\\s');
    const wholePhrase = new RegExp(`(?<![\\p{L}\\p{N}])${escapedWord}(?![\\p{L}\\p{N}])`, 'u');
    if (wholePhrase.test(normalizedResume)) {
        return false;
    }
    PubSub.publish('showMessage', {
        summary: 'Habilidade fora do currículo',
        detail: `A habilidade '${word}' não aparece no texto do seu currículo. Só é possível sugerir uma habilidade escrita exatamente como consta nele.`,
        severity: 'warn',
    });
    return true;
};

// Checagens locais antes de sugerir uma habilidade: devolve true (e avisa o candidato) quando ela já aparece no currículo
const isSkillSuggestionBlocked = (word: string, context: any, groups: any[], accordionList: any[]) => {
    const skillsContext = getSkillsContext(context, groups, accordionList);

    const numbers = {};

    const types = skillsContext.map((x) => x.category);

    const set = new Set(types);
    const array = [...set];
    for (let index in array) {
        const type = array[index];
        const number = skillsContext.filter((x) => x.category == type).length;

        numbers[type] = number;
    }

    const mainGroup = groups.filter((group) => group.main)[0];

    {
        const showMessage = mainGroup.list.filter((sk: any) => sk.word.toUpperCase() == word.toUpperCase())[0];
        if (showMessage) {
            PubSub.publish('showMessage', {
                detail: `A palavra '${word}' já está relacionada em sua lista de ferramentas`,
                summary: `Palavra já relacionada`,
                severity: 'warn',
            });
            return true;
        }
    }
    {
        const showMessage = mainGroup.list.filter((sk: any) => sk.skill.toUpperCase() == word.toUpperCase())[0];
        if (showMessage) {
            PubSub.publish('showMessage', {
                detail: `A palavra '${word}' já está relacionada em sua lista de ferramentas porém com o nome '${showMessage.word}'`,
                summary: `Palavra já relacionada`,
                severity: 'warn',
            });
            return true;
        }
    }

    for (let index in groups) {
        const group = groups[index];

        if (group.main) {
            continue;
        }

        {
            const showMessage = group.list.filter((sk: any) => sk.skill.toUpperCase() == word.toUpperCase())[0];
            if (showMessage) {
                PubSub.publish('showMessage', {
                    detail: `A palavra '${word}' já está relacionada em sua lista de ferramentas na lista '${group.title}'`,
                    summary: `Palavra já relacionada`,
                    severity: 'warn',
                });
                return true;
            }
        }
        {
            const showMessage = group.list.filter((sk: any) => sk.word.toUpperCase() == word.toUpperCase())[0];
            if (showMessage) {
                PubSub.publish('showMessage', {
                    detail: `A palavra '${word}' já está relacionada em sua lista de ferramentas porém com o nome '${showMessage.word}' e na lista '${group.title}'`,
                    summary: `Palavra já relacionada`,
                    severity: 'warn',
                });
                return true;
            }
        }

        const errors = [
            {
                fieldName: 'isPieceOfOtherSkill',
                summary: 'Esta ferramenta é um pedaço de outra ferramenta "{associated}" já adicionada à sua lista',
            },
            {
                fieldName: 'isPieceOfOtherWord',
                summary: 'O nome desta ferramenta é parte de uma outra palavra "{associated}" presente no texto do seu currículo',
            },
            {
                fieldName: 'skillAlreadyAdded',
                summary: 'O sinônimo ({associated}) para esta palavra já está presente em sua lista',
            },
        ];

        for (let index in errors) {
            const error = errors[index];

            if (errorHasFound(context, error, word)) {
                return true;
            }
        }

        {
            const showMessage = mainGroup.list.filter((sk: any) => sk.parent.includes(word.toUpperCase()));
            if (showMessage.length) {
                const words = showMessage.map((x: any) => x.word);
                PubSub.publish('showMessage', {
                    detail: `A palavra '${word}' já está relacionada em sua lista de ferramentas porém como pré requisito das palavras ${JSON.stringify(words)}`,
                    summary: `Palavra já relacionada como pré requisito de outras palavras`,
                    severity: 'warn',
                });
                return true;
            }
        }
    }
    return false;
};

const errorHasFound = (context: any, error: any, word: string) => {
    const discardedSkills = context.discardedSkills;
    const { summary, fieldName } = { ...error };
    if (!discardedSkills) {
        return false;
    }

    const list = discardedSkills[fieldName];

    if (!list) {
        return false;
    }

    if (!list.length) {
        return false;
    }

    const filtered = list.filter((x: any) => x.word.toUpperCase() == word.toUpperCase())[0];

    if (!filtered) {
        return false;
    }
    PubSub.publish('showMessage', {
        detail: summary.replace('{associated}', filtered.associated),
        summary: summary.replace('{associated}', filtered.associated),
        severity: 'warn',
    });

    return true;
};

const SkillList: React.FC<SkillListProps> = ({ title, width, list, filter, setFilter, setList, transferToAnotherList, main }) => {
    const filtro = (item: any) => !filter || item.label.toUpperCase().startsWith(filter.trim().toUpperCase());
    return (
        <ScrollPanel style={{ width, padding: '10px' }}>
            <div className="mb-5" style={{ fontSize: '10px' }}>
                <label>{`${title} (${list.length})`}</label>

                {(list.length >= 7 || filter) && (
                    <InputText
                        style={{ padding: '10px', width: '100%' }}
                        placeholder="Digite a habilidade para filtrar da listagem abaixo"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                )}
                {main ? (
                    <SkillSuggestionModal />
                ) : (
                    <div>
                        <br />
                    </div>
                )}
            </div>
            <div className="panel mb-3" style={{ maxHeight: '400px', overflow: 'auto', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)' }}>
                <div className="gap-x-12 sm:grid-cols-2">
                    <ul>
                        <ReactSortable
                            list={list}
                            setList={(myList: any[]) => setList(myList)}
                            animation={200}
                            delay={1}
                            ghostClass="gu-transit"
                            group="shared"
                            onAdd={(evt) => transferToAnotherList(evt.item.textContent)}
                        >
                            {list.length ? (
                                list.filter(filtro).map((skill: any, id: number) => (
                                    <li key={id} className="mb-2.5 cursor-grab ">
                                        <div className="items-md-center flex flex-col rounded-md border border-white-light bg-white px-6 py-3.5 text-center dark:border-dark dark:bg-[#1b2e4b] md:flex-row ltr:md:text-left rtl:md:text-right">
                                            <div className="flex flex-1 flex-col items-center justify-between md:flex-row">
                                                <div className="my-3 font-semibold md:my-0 ">
                                                    <div className="text-base text-dark dark:text-[#bfc9d4]">{skill.label}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))
                            ) : (
                                <li className="mb-2.5 cursor-grab">
                                    <div className="flex items-center justify-center md:flex-row">
                                        <div className="my-3 font-semibold md:my-0">
                                            <div className="text-base text-dark dark:text-[#bfc9d4] ">Arraste e solte aqui para adicionar.</div>
                                        </div>
                                    </div>
                                </li>
                            )}
                        </ReactSortable>
                    </ul>
                </div>
            </div>
        </ScrollPanel>
    );
};
interface AccordionListProps {
    width: string;
}
const AccordionList: React.FC<AccordionListProps> = ({ width }) => {
    const { accordionList } = TabSkillStore((state: ITabSkillStore) => ({
        ...state,
    }));
    const [visible, setVisible] = useState(false);
    return (
        <ScrollPanel style={{ width, padding: '10px' }}>
            {accordionList && !!accordionList.length && (
                <div>
                    <div className="align-items-center flex">
                        <Dialog
                            header={'O que são conhecimentos implicitos?'}
                            visible={visible}
                            style={{ width: '50vw' }}
                            onHide={() => {
                                if (!visible) return;
                                setVisible(false);
                            }}
                        >
                            <p className="m-0">
                                São conhecimentos que você não mencionou no seu currículo, porém subentende-se que você os tem, pois estes conhecimentos são pré requisitos para outros conhecimentos,
                                exemplo: Não há como você saber oracle ou mysql sem saber sql.
                            </p>
                        </Dialog>
                        <div className="mb-5" style={{ fontSize: '10px' }}>
                            <Tooltip target="#btnHelp" content="Clique aqui para saber o que são conhecimentos implícitos" position="bottom" />
                            <label>
                                <Button icon="pi pi-question-circle" id="btnHelp" onClick={() => setVisible(true)} />
                                {`Conhecimentos implícitos (${accordionList.length})`}
                            </label>
                        </div>
                    </div>
                    <div className="panel mb-3" style={{ maxHeight: '400px', overflow: 'auto', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)' }}>
                        <div className="gap-x-12 sm:grid-cols-2">
                            <Accordion>
                                {accordionList &&
                                    accordionList.map((item: any, id: any) => (
                                        <AccordionTab
                                            key={id}
                                            header={
                                                <span className="inline-flex items-center gap-2">
                                                    <span>{`${item.skill} (${item.children.length})`}</span>
                                                    <AddSkillsToAccordion accordionItem={item} />
                                                    <RemoveSkillsFromAccordion accordionItem={item} />
                                                </span>
                                            }
                                        >
                                            <h1 style={{ fontSize: '7px' }}>Habilidades associadas a {item.skill}:</h1>
                                            {item.children.map((child: any, counter: any) => (
                                                <p className="m-0" key={child.label} style={{ fontSize: '12px' }}>
                                                    {counter + 1 + ': ' + child.label}
                                                </p>
                                            ))}
                                        </AccordionTab>
                                    ))}
                            </Accordion>
                        </div>
                    </div>
                </div>
            )}
        </ScrollPanel>
    );
};
type SkillFixHierarchyType = 'add' | 'remove';

// Mesmas regras de VisJsonCommonsFields/JnJsonCommonsFields no backend, checadas aqui para não gastar requisição
const DESCRIPTION_MIN_LENGTH = 10;
const DESCRIPTION_MAX_LENGTH = 500;

const warn = (summary: string, detail: string) => PubSub.publish('showMessage', { summary, detail, severity: 'warn' });

const isValidDescription = (description: string) => {
    const length = description.trim().length;
    if (length < DESCRIPTION_MIN_LENGTH || length > DESCRIPTION_MAX_LENGTH) {
        warn('Explicação inválida', `A explicação deve ter entre ${DESCRIPTION_MIN_LENGTH} e ${DESCRIPTION_MAX_LENGTH} caracteres.`);
        return false;
    }
    return true;
};

/**
 * Loading no botão que disparou a requisição, como no ModalLogin, em vez da capa que cobre a página inteira.
 * Sem email na sessão o JnAjax chama o 401 antes de requisitar, sem passar pelo complete (que é quem chama o
 * setNotLoading), por isso o 401 também desliga o loading antes de seguir para o tratamento que já tinha.
 * Chamar depois de definir retryAfterAuthentication e o 401 próprio, se houver.
 */
const withButtonLoading = (callbacks: any, setLoading: (loading: boolean) => void) => {
    callbacks['setLoading'] = () => setLoading(true);
    callbacks['setNotLoading'] = () => setLoading(false);
    const handle401 = callbacks[401] || JnAjax.getHandler401(callbacks['retryAfterAuthentication'] || (() => {}));
    callbacks[401] = () => {
        setLoading(false);
        handle401();
    };
};

/**
 * Envia, numa única requisição, a sugestão de correção de hierarquia com todas as skills em lista.
 * Não pode ser uma requisição por skill: a chave da sugestão é email + parent + type, então uma sobrescreveria a outra.
 */
const sendSkillFixHierarchy = (parent: string, skills: string[], type: SkillFixHierarchyType, description: string, onSuccess: () => void, setLoading: (loading: boolean) => void) => {
    const callbacks: any = {};
    callbacks['retryAfterAuthentication'] = () => sendSkillFixHierarchy(parent, skills, type, description, onSuccess, setLoading);
    callbacks[200] = () => {
        PubSub.publish('showMessage', {
            summary: 'Sugestão enviada',
            detail: 'Obrigado! Sua sugestão será analisada e você será avisado do resultado.',
        });
        onSuccess();
    };
    // todas as habilidades do pedido já foram avaliadas antes: nada fica pendente e o resultado vai por e-mail
    callbacks[208] = () => {
        PubSub.publish('showMessage', {
            summary: 'Solicitação já atendida',
            detail: 'Sua solicitação está completa: todas as habilidades dela já foram avaliadas pelo nosso time. Estamos enviando um e-mail com o resultado.',
        });
        onSuccess();
    };
    // o modal não deixa enviar com sugestão pendente; o 409 só chega se ela ficou pendente por outra aba ou janela
    callbacks[409] = () => warn('Sugestão já pendente', `Você já tem uma sugestão pendente para ${parent}. Para alterá-la, desista dela e envie uma nova.`);
    callbacks['onUnexpectedHttpStatus'] = () => {
        PubSub.publish('showMessage', {
            summary: 'Falha ao enviar sugestão',
            detail: 'Não conseguimos registrar a sua sugestão. Tente novamente mais tarde.',
            severity: 'error',
        });
    };
    withButtonLoading(callbacks, setLoading);
    const body = { parent, skill: skills, type, description: description.trim() };
    JnAjax.doAnAjaxRequest('resume/{email}/skills/hierarchy', callbacks, 'POST', body, {}, 'http://localhost:8081');
};

// Sugestão pendente fica só para leitura nos dois modais (sugerir habilidade e ajuste de hierarquia)
const PendingSuggestionHint: React.FC = () => (
    <p className="m-0 text-left" style={{ fontSize: '12px' }}>
        Esta sugestão está em análise. Para alterá-la, desista dela e envie uma nova.
    </p>
);

type SkillFixHierarchyStatus = 'pending' | 'fulfiled';

interface SkillFixHierarchySuggestion {
    skill: string[];
    description: string;
    status: SkillFixHierarchyStatus;
    explanation?: string;
}

const SKILL_FIX_HIERARCHY_STATUS_LABELS: Record<SkillFixHierarchyStatus, string> = {
    pending: 'Pendente',
    fulfiled: 'Avaliado',
};

/**
 * Busca a sugestão já feita pelo candidato para este parent e type. É POST, e não GET, porque o filtro de
 * sessão do backend só valida o login quando a requisição tem corpo. Sem sugestão, o backend devolve json vazio
 * e onFound não é chamado.
 * Abrir o modal não exige login (só enviar ou desistir exige): o 401 aqui equivale a "nenhuma sugestão" e não
 * abre a tela de login.
 */
const getSkillFixHierarchy = (parent: string, type: SkillFixHierarchyType, onFound: (suggestion: SkillFixHierarchySuggestion) => void, setLoading: (loading: boolean) => void) => {
    const callbacks: any = {};
    callbacks[401] = () => {};
    callbacks[200] = (response: any) => response && response.status && onFound(response);
    callbacks['onUnexpectedHttpStatus'] = () => warn('Falha ao carregar sugestão', 'Não conseguimos carregar a sua sugestão anterior para este conhecimento.');
    withButtonLoading(callbacks, setLoading);
    JnAjax.doAnAjaxRequest('resume/{email}/skills/hierarchy/search', callbacks, 'POST', { parent, type }, {}, 'http://localhost:8081');
};

const deleteSkillFixHierarchy = (parent: string, type: SkillFixHierarchyType, onSuccess: () => void, onNotFound: () => void, setLoading: (loading: boolean) => void) => {
    const callbacks: any = {};
    callbacks['retryAfterAuthentication'] = () => deleteSkillFixHierarchy(parent, type, onSuccess, onNotFound, setLoading);
    callbacks[200] = () => {
        PubSub.publish('showMessage', {
            summary: 'Sugestão retirada',
            detail: 'Sua sugestão não será mais analisada.',
        });
        onSuccess();
    };
    // a sugestão pode ter sido analisada (e saído da pendente) entre abrir o modal e desistir
    const showNotFound = JnAjax.getHandler404('Sugestão não encontrada', 'Não encontramos uma sugestão pendente para desistir. Ela pode já ter sido analisada.');
    callbacks[404] = () => {
        showNotFound();
        onNotFound();
    };
    callbacks['onUnexpectedHttpStatus'] = () => {
        PubSub.publish('showMessage', {
            summary: 'Falha ao retirar sugestão',
            detail: 'Não conseguimos retirar a sua sugestão. Tente novamente mais tarde.',
            severity: 'error',
        });
    };
    withButtonLoading(callbacks, setLoading);
    JnAjax.doAnAjaxRequest('resume/{email}/skills/hierarchy', callbacks, 'DELETE', { parent, type }, {}, 'http://localhost:8081');
};

interface SkillFixHierarchyStatusViewProps {
    suggestion: SkillFixHierarchySuggestion;
}
const SkillFixHierarchyStatusView: React.FC<SkillFixHierarchyStatusViewProps> = ({ suggestion }) => (
    <div className="text-left">
        <label className="font-semibold">{`status: ${SKILL_FIX_HIERARCHY_STATUS_LABELS[suggestion.status]}`}</label>
        {suggestion.status !== 'pending' && (
            <Accordion className="mt-2">
                <AccordionTab header="Motivo">
                    <p className="m-0" style={{ whiteSpace: 'pre-line' }}>{suggestion.explanation}</p>
                </AccordionTab>
            </Accordion>
        )}
    </div>
);

interface SkillFixHierarchyModalProps {
    accordionItem: any;
    type: SkillFixHierarchyType;
    options: any[];
    icon: string;
    linkText: string;
    headerModal: string;
    reasonExplanation: string;
    multiSelectPlaceholder: string;
    noSkillSelectedDetail: string;
}
/**
 * Modal de sugestão de correção de hierarquia de um accordion: multi-select das skills e memo de justificativa.
 * Fica no cabeçalho do AccordionTab, que abre/fecha no clique e intercepta Enter/Espaço; como o Dialog é filho
 * deste componente na árvore do React, sem barrar a propagação digitar no memo ou clicar no modal mexeria no accordion.
 */
const SkillFixHierarchyModal: React.FC<SkillFixHierarchyModalProps> = ({
    accordionItem,
    type,
    options,
    icon,
    linkText,
    headerModal,
    reasonExplanation,
    multiSelectPlaceholder,
    noSkillSelectedDetail,
}) => {
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [reason, setReason] = useState('');
    const [suggestion, setSuggestion] = useState<SkillFixHierarchySuggestion | null>(null);

    // Requisição em andamento, para o loading ficar no botão que a disparou (a carga ao abrir fica no botão
    // principal, cujo rótulo depende da sugestão carregada) e os demais botões ficarem desabilitados até ela voltar.
    const [loadingRequest, setLoadingRequest] = useState<'load' | 'save' | 'withdraw' | null>(null);
    const setLoadingOf = (request: 'load' | 'save' | 'withdraw') => (loading: boolean) => setLoadingRequest(loading ? request : null);
    const busy = loadingRequest !== null;

    const stopPropagation = (e: React.SyntheticEvent) => e.stopPropagation();

    const loadSuggestion = () => {
        setSelectedSkills([]);
        setReason('');
        setSuggestion(null);
        getSkillFixHierarchy(
            accordionItem.skill,
            type,
            (found) => {
                setSelectedSkills(found.skill || []);
                setReason(found.description || '');
                setSuggestion(found);
            },
            setLoadingOf('load'),
        );
    };

    // Skills da sugestão que já não estão entre as opções (ex.: uma adição aprovada passa a ser filha do
    // accordion e sai das opções de adicionar); sem elas o MultiSelect esconderia parte do que foi sugerido.
    const optionSkills = options.map((option: any) => option.skill);
    const missingOptions = selectedSkills.filter((skill) => !optionSkills.includes(skill)).map((skill) => ({ label: skill, skill }));
    const allOptions = [...options, ...missingOptions];

    // Sugestão já avaliada: em vez de reenviar o que já foi avaliado, o botão oferece começar uma nova
    const alreadyReviewed = !!suggestion && suggestion.status !== 'pending';

    const startNewSuggestion = () => {
        setSelectedSkills([]);
        setReason('');
        setSuggestion(null);
    };

    const save = (close: () => void) => {
        if (!selectedSkills.length) {
            warn('Nenhuma habilidade selecionada', noSkillSelectedDetail);
            return;
        }
        if (!isValidDescription(reason)) {
            return;
        }
        sendSkillFixHierarchy(
            accordionItem.skill,
            selectedSkills,
            type,
            reason,
            () => {
                setSelectedSkills([]);
                setReason('');
                close();
            },
            setLoadingOf('save'),
        );
    };

    // Só existe o que desistir enquanto a sugestão está pendente; avaliada (fulfiled) é histórico da análise
    const pending = !!suggestion && suggestion.status === 'pending';
    const [confirmingWithdraw, setConfirmingWithdraw] = useState(false);

    const withdraw = (close: () => void) => {
        deleteSkillFixHierarchy(
            accordionItem.skill,
            type,
            () => {
                startNewSuggestion();
                close();
            },
            // o modal mostrava "Pendente", que já não é verdade: recarrega para exibir o status real
            loadSuggestion,
            setLoadingOf('withdraw'),
        );
    };

    // ConfirmDialog controlado (e não o confirmDialog() global): cada accordion tem os seus modais, e o global
    // exigiria um único <ConfirmDialog /> na página, compartilhado entre todos.
    const withdrawButton = (close: () => void) =>
        pending && (
            <>
                <ConfirmDialog
                    visible={confirmingWithdraw}
                    onHide={() => setConfirmingWithdraw(false)}
                    header="Desistir da sugestão"
                    message="Tem certeza de que deseja desistir desta sugestão? Ela deixará de ser analisada."
                    icon="pi pi-exclamation-triangle"
                    acceptLabel="Sim, desistir"
                    rejectLabel="Não"
                    accept={() => withdraw(close)}
                />
                <LoadingButton
                    onClick={() => setConfirmingWithdraw(true)}
                    label="Desistir da sugestão"
                    loading={loadingRequest === 'withdraw'}
                    invalid={busy}
                    style={{ minWidth: '15%' }}
                    className="btn btn-outline-danger"
                />
            </>
        );

    // Pendente é só leitura: editar daria 409 (já há sugestão pendente para este conhecimento e tipo), e permitir a edição
    // abriria corrida com o operador, que pode estar revisando os itens. Para alterar, o candidato desiste e envia de novo.
    const getMainButton = () => {
        if (pending) {
            return { label: 'Fechar', onSave: (close: () => void) => close() };
        }
        if (alreadyReviewed) {
            return { label: 'Nova sugestão', onSave: startNewSuggestion };
        }
        return { label: 'Enviar', onSave: save };
    };
    const mainButton = getMainButton();

    return (
        <span onClick={stopPropagation} onKeyDown={stopPropagation}>
            <LinkModal
                onSave={mainButton.onSave}
                saveButtonLabel={mainButton.label}
                saveLoading={loadingRequest === 'load' || loadingRequest === 'save'}
                saveDisabled={busy}
                extraActions={withdrawButton}
                onOpen={loadSuggestion}
                headerModal={headerModal} labelText={reasonExplanation} linkText={linkText} icon={icon}>
                <div className="flex w-full flex-col items-stretch gap-3">
                    <MultiSelect
                        className="w-full"
                        value={selectedSkills}
                        onChange={(e) => setSelectedSkills(e.value)}
                        options={allOptions}
                        optionLabel="label"
                        optionValue="skill"
                        filter
                        maxSelectedLabels={3}
                        selectedItemsLabel="{0} habilidades selecionadas"
                        placeholder={multiSelectPlaceholder}
                        // por padrão a lista de opções vai para o body e rola com a página, descolando do Dialog (fixo)
                        appendTo="self"
                        disabled={!!suggestion}
                    />
                    <InputTextarea className="w-full" placeholder={reasonExplanation} value={reason} onChange={(e) => setReason(e.target.value)} rows={6} disabled={!!suggestion} />
                    {suggestion && <SkillFixHierarchyStatusView suggestion={suggestion} />}
                    {pending && <PendingSuggestionHint />}
                </div>
            </LinkModal>
        </span>
    );
};

interface AccordionSkillsProps {
    accordionItem: any;
}
const AddSkillsToAccordion: React.FC<AccordionSkillsProps> = ({ accordionItem }) => {
    const { groups } = TabSkillStore((state: ITabSkillStore) => ({
        ...state,
    }));

    const mainGroup: any = groups.filter((group: any) => group.main)[0] || {};
    const skillsInAccordion = accordionItem.children.map((child: any) => child.skill);
    const availableSkills = (mainGroup.list || []).filter((sk: any) => !skillsInAccordion.includes(sk.skill));

    return (
        <SkillFixHierarchyModal
            accordionItem={accordionItem}
            type="add"
            options={availableSkills}
            icon="pi-plus-circle"
            linkText="Sugira adicionar habilidades (presentes no seu currículo) que você acredita que deveria estar aqui e não estão"
            headerModal={`Sugira adicionar (presentes no seu currículo) que você acredita que dependem do conhecimento em ${accordionItem.skill}`}
            reasonExplanation={`Explique por que as habilidades selecionadas acima deveriam ser associadas a ${accordionItem.skill}`}
            multiSelectPlaceholder="Selecione as habilidades do seu currículo"
            noSkillSelectedDetail={`Selecione ao menos uma habilidade para associar a ${accordionItem.skill}.`}
        />
    );
};

const RemoveSkillsFromAccordion: React.FC<AccordionSkillsProps> = ({ accordionItem }) => (
    <SkillFixHierarchyModal
        accordionItem={accordionItem}
        type="remove"
        options={accordionItem.children}
        icon="pi-trash"
        linkText={`Sugira remover habilidades que você acredita que não dependem do conhecimento em ${accordionItem.skill}`}
        headerModal={`Sugira remover habilidades que você acredita que não dependem do conhecimento em ${accordionItem.skill}`}
        reasonExplanation={`Explique por que as habilidades selecionadas acima não deveriam estar associadas a ${accordionItem.skill}`}
        multiSelectPlaceholder={`Selecione as habilidades associadas a ${accordionItem.skill}`}
        noSkillSelectedDetail={`Selecione ao menos uma habilidade para desassociar de ${accordionItem.skill}.`}
    />
);

// Mesmas regras de VisJsonCommonsFields no backend (skill e synonym), checadas aqui para não gastar requisição
const SKILL_MIN_LENGTH = 2;
const SKILL_MAX_LENGTH = 50;

// A habilidade é gravada como as do sistema: maiúsculas e com um só espaço entre as palavras
const normalizeSkill = (text: string) => text.trim().replace(/\s+/g, ' ').toUpperCase();

const isValidSkillName = (name: string, summary: string) => {
    if (name.length < SKILL_MIN_LENGTH || name.length > SKILL_MAX_LENGTH) {
        warn(summary, `'${name}' deve ter entre ${SKILL_MIN_LENGTH} e ${SKILL_MAX_LENGTH} caracteres.`);
        return false;
    }
    return true;
};

type SkillSuggestionStatus = 'pending' | 'approved' | 'rejected';

interface SkillSuggestion {
    skill: string;
    synonym?: string[];
    description: string;
    status: SkillSuggestionStatus;
    explanation?: string;
}

const SKILL_SUGGESTION_STATUS_LABELS: Record<SkillSuggestionStatus, string> = {
    pending: 'Pendente',
    approved: 'Aprovada',
    rejected: 'Rejeitada',
};

/**
 * Envia a sugestão de habilidade com os sinônimos e a justificativa. A chave da sugestão é email + skill: o mesmo
 * candidato não tem duas sugestões pendentes da mesma habilidade (409).
 */
const sendSkillSuggestion = (skill: string, synonyms: string[], description: string, onSuccess: () => void, setLoading: (loading: boolean) => void) => {
    const callbacks: any = {};
    callbacks['retryAfterAuthentication'] = () => sendSkillSuggestion(skill, synonyms, description, onSuccess, setLoading);
    callbacks[200] = () => {
        PubSub.publish('showMessage', {
            summary: 'Sugestão enviada',
            detail: 'Obrigado! Sua sugestão será analisada e você será avisado do resultado.',
        });
        onSuccess();
    };
    callbacks[409] = () => warn('Sugestão já pendente', `Você já sugeriu a habilidade '${skill}' e ela ainda está em análise.`);
    callbacks[412] = () => warn('Habilidade já reconhecida', `A habilidade '${skill}' já é reconhecida pelo sistema.`);
    // a tela mostra a rejeição ao digitar a habilidade; o 410 só chega se ela foi rejeitada depois de carregada
    callbacks[410] = () => warn('Sugestão já avaliada', `A habilidade '${skill}' já foi sugerida por você e rejeitada pelo suporte. Digite-a de novo no modal para ver o motivo.`);
    callbacks['onUnexpectedHttpStatus'] = () => {
        PubSub.publish('showMessage', {
            summary: 'Falha ao enviar sugestão',
            detail: 'Não conseguimos registrar a sua sugestão. Tente novamente mais tarde.',
            severity: 'error',
        });
    };
    withButtonLoading(callbacks, setLoading);
    const body = { skill, synonym: synonyms, description: description.trim() };
    JnAjax.doAnAjaxRequest('resume/{email}/skills/suggestion', callbacks, 'POST', body, {}, 'http://localhost:8081');
};

/**
 * Busca a sugestão que o candidato já fez desta habilidade. É POST, e não GET, porque o filtro de sessão do backend
 * só valida o login quando a requisição tem corpo. Sem sugestão, o backend devolve json vazio e onFound não é chamado.
 * Digitar a habilidade não exige login (só enviar ou desistir exige): o 401 aqui equivale a "nenhuma sugestão".
 */
const getSkillSuggestion = (skill: string, onFound: (suggestion: SkillSuggestion) => void, setLoading: (loading: boolean) => void) => {
    const callbacks: any = {};
    callbacks[401] = () => {};
    callbacks[200] = (response: any) => response && response.status && onFound(response);
    callbacks['onUnexpectedHttpStatus'] = () => warn('Falha ao carregar sugestão', 'Não conseguimos carregar a sua sugestão anterior para esta habilidade.');
    withButtonLoading(callbacks, setLoading);
    JnAjax.doAnAjaxRequest('resume/{email}/skills/suggestion/search', callbacks, 'POST', { skill }, {}, 'http://localhost:8081');
};

const deleteSkillSuggestion = (skill: string, onSuccess: () => void, onNotFound: () => void, setLoading: (loading: boolean) => void) => {
    const callbacks: any = {};
    callbacks['retryAfterAuthentication'] = () => deleteSkillSuggestion(skill, onSuccess, onNotFound, setLoading);
    callbacks[200] = () => {
        PubSub.publish('showMessage', {
            summary: 'Sugestão retirada',
            detail: 'Sua sugestão não será mais analisada.',
        });
        onSuccess();
    };
    // a sugestão pode ter sido analisada (e saído da pendente) entre carregá-la e desistir
    const showNotFound = JnAjax.getHandler404('Sugestão não encontrada', 'Não encontramos uma sugestão pendente para desistir. Ela pode já ter sido analisada.');
    callbacks[404] = () => {
        showNotFound();
        onNotFound();
    };
    callbacks['onUnexpectedHttpStatus'] = () => {
        PubSub.publish('showMessage', {
            summary: 'Falha ao retirar sugestão',
            detail: 'Não conseguimos retirar a sua sugestão. Tente novamente mais tarde.',
            severity: 'error',
        });
    };
    withButtonLoading(callbacks, setLoading);
    JnAjax.doAnAjaxRequest('resume/{email}/skills/suggestion', callbacks, 'DELETE', { skill }, {}, 'http://localhost:8081');
};

interface SkillSuggestionStatusViewProps {
    suggestion: SkillSuggestion;
}
const SkillSuggestionStatusView: React.FC<SkillSuggestionStatusViewProps> = ({ suggestion }) => (
    <div className="text-left">
        <label className="font-semibold">{`status: ${SKILL_SUGGESTION_STATUS_LABELS[suggestion.status]}`}</label>
        {suggestion.status !== 'pending' && (
            <Accordion className="mt-2">
                <AccordionTab header="Motivo">
                    <p className="m-0" style={{ whiteSpace: 'pre-line' }}>{suggestion.explanation}</p>
                </AccordionTab>
            </Accordion>
        )}
    </div>
);

/**
 * Modal "Deixamos de listar alguma habilidade?": o candidato sugere uma habilidade que consta no texto do currículo e
 * não foi listada, com os sinônimos (várias frases) e a justificativa. Ao sair do campo da habilidade, carrega a
 * sugestão que ele já tenha feito dela, com o status; enquanto pendente, ele pode desistir.
 */
const SkillSuggestionModal: React.FC = () => {
    const { context, groups, accordionList } = TabSkillStore((state: ITabSkillStore) => ({
        ...state,
    }));
    const [skill, setSkill] = useState('');
    const [synonyms, setSynonyms] = useState<string[]>([]);
    const [reason, setReason] = useState('');
    const [suggestion, setSuggestion] = useState<SkillSuggestion | null>(null);
    // habilidade da última busca, para não repetir a busca quando o campo perde o foco sem ter mudado
    const [searchedSkill, setSearchedSkill] = useState('');

    const [loadingRequest, setLoadingRequest] = useState<'load' | 'save' | 'withdraw' | null>(null);
    const setLoadingOf = (request: 'load' | 'save' | 'withdraw') => (loading: boolean) => setLoadingRequest(loading ? request : null);
    const busy = loadingRequest !== null;

    const startNewSuggestion = () => {
        setSkill('');
        setSynonyms([]);
        setReason('');
        setSuggestion(null);
        setSearchedSkill('');
    };

    const loadSuggestion = (skillToSearch: string) => {
        setSuggestion(null);
        setSearchedSkill(skillToSearch);
        if (skillToSearch.length < SKILL_MIN_LENGTH || skillToSearch.length > SKILL_MAX_LENGTH) {
            return;
        }
        getSkillSuggestion(
            skillToSearch,
            (found) => {
                setSynonyms(found.synonym || []);
                setReason(found.description || '');
                setSuggestion(found);
            },
            setLoadingOf('load'),
        );
    };

    const onSkillBlur = () => {
        const normalizedSkill = normalizeSkill(skill);
        setSkill(normalizedSkill);
        if (normalizedSkill === searchedSkill) {
            return;
        }
        loadSuggestion(normalizedSkill);
    };

    const pending = !!suggestion && suggestion.status === 'pending';

    const save = (close: () => void) => {
        const normalizedSkill = normalizeSkill(skill);
        setSkill(normalizedSkill);
        if (!isValidSkillName(normalizedSkill, 'Habilidade inválida')) {
            return;
        }
        const invalidSynonym = synonyms.filter((synonym) => synonym.length < SKILL_MIN_LENGTH || synonym.length > SKILL_MAX_LENGTH)[0];
        if (invalidSynonym && !isValidSkillName(invalidSynonym, 'Sinônimo inválido')) {
            return;
        }
        if (!isValidDescription(reason)) {
            return;
        }
        if (isSkillSuggestionBlocked(normalizedSkill, context, groups, accordionList)) {
            return;
        }
        // depois das checagens acima: elas explicam melhor os casos que também ficariam fora (ASP dentro de ASPECTJ)
        if (isSkillOutOfTheResume(normalizedSkill)) {
            return;
        }
        const otherSynonyms = synonyms.filter((synonym) => synonym !== normalizedSkill);
        sendSkillSuggestion(
            normalizedSkill,
            otherSynonyms,
            reason,
            () => {
                startNewSuggestion();
                close();
            },
            setLoadingOf('save'),
        );
    };

    const [confirmingWithdraw, setConfirmingWithdraw] = useState(false);

    const withdraw = (close: () => void) => {
        deleteSkillSuggestion(
            skill,
            () => {
                startNewSuggestion();
                close();
            },
            // o modal mostrava "Pendente", que já não é verdade: recarrega para exibir o status real
            () => loadSuggestion(skill),
            setLoadingOf('withdraw'),
        );
    };

    const withdrawButton = (close: () => void) =>
        pending && (
            <>
                <ConfirmDialog
                    visible={confirmingWithdraw}
                    onHide={() => setConfirmingWithdraw(false)}
                    header="Desistir da sugestão"
                    message="Tem certeza de que deseja desistir desta sugestão? Ela deixará de ser analisada."
                    icon="pi pi-exclamation-triangle"
                    acceptLabel="Sim, desistir"
                    rejectLabel="Não"
                    accept={() => withdraw(close)}
                />
                <LoadingButton
                    onClick={() => setConfirmingWithdraw(true)}
                    label="Desistir da sugestão"
                    loading={loadingRequest === 'withdraw'}
                    invalid={busy}
                    style={{ minWidth: '15%' }}
                    className="btn btn-outline-danger"
                />
            </>
        );

    // Com sugestão carregada (pendente ou avaliada) o modal é só leitura: pendente se altera desistindo e enviando de novo,
    // e avaliada não se reenvia (a rejeição é definitiva; aprovada já é reconhecida). "Nova sugestão" limpa para outra habilidade.
    const hasSuggestion = !!suggestion;

    return (
        <LinkModal
            onSave={hasSuggestion ? startNewSuggestion : save}
            saveButtonLabel={hasSuggestion ? 'Nova sugestão' : 'Enviar'}
            saveLoading={loadingRequest === 'load' || loadingRequest === 'save'}
            saveDisabled={busy}
            extraActions={withdrawButton}
            onOpen={startNewSuggestion}
            headerModal="Descreva a habilidade técnica que CONSTA no texto do seu currículo e que deixamos de listar aqui"
            labelText=""
            linkText="Deixamos de listar alguma habilidade?"
        >
            <div className="flex w-full flex-col items-stretch gap-3">
                <InputText
                    className="w-full"
                    placeholder="Habilidade que consta no seu currículo (ex.: REACT NATIVE)"
                    value={skill}
                    disabled={hasSuggestion}
                    maxLength={SKILL_MAX_LENGTH}
                    onChange={(e) => setSkill(e.target.value.toUpperCase())}
                    onBlur={onSkillBlur}
                />
                <Chips
                    className="w-full"
                    // a raiz do Chips é inline-flex e a lista de frases não ocupa a largura do modal sem isso
                    pt={{ container: { className: 'w-full' } }}
                    value={synonyms}
                    disabled={hasSuggestion}
                    onChange={(e) => setSynonyms(Array.from(new Set((e.value || []).map(normalizeSkill).filter((synonym: string) => !!synonym))))}
                    separator=","
                    placeholder="Sinônimos: digite cada um e tecle Enter (ou separe por vírgula)"
                />
                <InputTextarea
                    className="w-full"
                    placeholder="Explique por que esta habilidade deveria ser reconhecida (ex.: em que parte do currículo ela aparece)"
                    value={reason}
                    disabled={hasSuggestion}
                    onChange={(e) => setReason(e.target.value)}
                    rows={6}
                />
                {suggestion && <SkillSuggestionStatusView suggestion={suggestion} />}
                {pending && <PendingSuggestionHint />}
            </div>
        </LinkModal>
    );
};

interface LinkModalProps {
    children: React.ReactNode;
    headerModal: string;
    // recebe a função que fecha o modal, para quem salva decidir fechar só depois de salvar com sucesso
    onSave: (close: () => void) => void;
    // disparado toda vez que o modal é aberto
    onOpen?: () => void;
    // texto do botão que chama onSave (padrão: 'Enviar')
    saveButtonLabel?: string;
    // ícone de loading no botão que chama onSave, enquanto a requisição dele está em andamento
    saveLoading?: boolean;
    // desabilita o botão que chama onSave (ex.: enquanto outra requisição do modal está em andamento)
    saveDisabled?: boolean;
    // botões adicionais, à esquerda do principal; recebem a função que fecha o modal
    extraActions?: (close: () => void) => React.ReactNode;
    labelText: string;
    linkText: string;
    icon?: string;
}
const LinkModal: React.FC<LinkModalProps> = ({ onSave, onOpen, saveButtonLabel = 'Enviar', saveLoading = false, saveDisabled = false, extraActions, labelText, linkText, headerModal, icon, children }) => {
    const [visible, setVisible] = useState(false);
    const open = () => {
        setVisible(true);
        onOpen && onOpen();
    };
    return (
        <div className={icon ? 'inline-flex items-center' : undefined}>
            {labelText && !icon && <label style={{ fontSize: '10px' }}>{labelText}</label>}
            {icon ? (
                // span em vez de <a>: o ícone pode ficar dentro do cabeçalho do AccordionTab, que já é um <a>; o
                // preventDefault impede que o clique siga o href desse <a> e troque o hash da URL
                <span
                    role="button"
                    tabIndex={0}
                    className="linkParaAbrirModal inline-flex cursor-pointer items-center"
                    title={linkText}
                    aria-label={linkText}
                    onClick={(e) => {
                        e.preventDefault();
                        open();
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && open()}
                >
                    <i className={`pi ${icon}`} style={{ fontSize: '12px', lineHeight: 1 }} />
                </span>
            ) : (
                <a href="#" className="linkParaAbrirModal" onClick={open}>
                    {linkText}
                </a>
            )}
            <Dialog
                style={{ width: '50vw' }}
                header={headerModal}
                blockScroll
                visible={visible}
                onHide={() => {
                    if (!visible) return;
                    setVisible(false);
                }}
            >
                <LabelComponent explanation={headerModal} labelValue="" property="resumeText" errors={{}}>
                    {children}
                </LabelComponent>

                <div className="mb-5 text-center">
                    <div className="flex justify-end gap-2">
                        {extraActions && extraActions(() => setVisible(false))}
                        <LoadingButton
                            onClick={() => onSave(() => setVisible(false))}
                            label={saveButtonLabel}
                            loading={saveLoading}
                            invalid={saveDisabled}
                            style={{ minWidth: '15%' }}
                            className="btn btn-danger"
                        />
                    </div>
                </div>
            </Dialog>
        </div>
    );
};
