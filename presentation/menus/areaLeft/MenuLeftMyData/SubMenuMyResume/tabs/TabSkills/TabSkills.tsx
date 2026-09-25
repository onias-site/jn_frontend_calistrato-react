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
import { ConfirmDialog } from 'primereact/confirmdialog';
import { LabelComponent } from '@/presentation/components/source/LabelComponent';
import PubSub from 'pubsub-js';
import JnAjax from '@/app/JnAjax';

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

const sendSkillSuggest = (word: string, context: any, groups: any[], accordionList: any[]) => {
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
            return;
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
            return;
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
                return;
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
                return;
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
                return;
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
                return;
            }
        }
    }
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
    const [skill, setSkill] = useState('');
    const filtro = (item: any) => !filter || item.label.toUpperCase().startsWith(filter.trim().toUpperCase());
    const { context, groups, accordionList } = TabSkillStore((state: ITabSkillStore) => ({
        ...state,
    }));
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
                    <LinkModal
                        onSave={() => sendSkillSuggest(skill, context, groups, accordionList)}
                        headerModal="Descreva a habilidade técnica que CONSTA no texto do seu currículo e que deixamos de listar aqui"
                        labelText={``}
                        linkText="Deixamos de listar alguma habilidade?"
                    >
                        <InputText placeholder="" style={{ width: '75%' }} value={skill} onChange={(e) => setSkill(e.target.value)} rows={10} cols={100} />
                    </LinkModal>
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
 * Envia, numa única requisição, a sugestão de correção de hierarquia com todas as skills em lista.
 * Não pode ser uma requisição por skill: a chave da sugestão é email + parent + type, então uma sobrescreveria a outra.
 */
const sendSkillFixHierarchy = (parent: string, skills: string[], type: SkillFixHierarchyType, description: string, onSuccess: () => void) => {
    const callbacks: any = {};
    callbacks['retryAfterAuthentication'] = () => sendSkillFixHierarchy(parent, skills, type, description, onSuccess);
    callbacks[200] = () => {
        PubSub.publish('showMessage', {
            summary: 'Sugestão enviada',
            detail: 'Obrigado! Sua sugestão será analisada e você será avisado do resultado.',
        });
        onSuccess();
    };
    callbacks['onUnexpectedHttpStatus'] = () => {
        PubSub.publish('showMessage', {
            summary: 'Falha ao enviar sugestão',
            detail: 'Não conseguimos registrar a sua sugestão. Tente novamente mais tarde.',
            severity: 'error',
        });
    };
    const body = { parent, skill: skills, type, description: description.trim() };
    JnAjax.doAnAjaxRequest('resume/{email}/skills/hierarchy', callbacks, 'POST', body, {}, 'http://localhost:8081');
};

type SkillFixHierarchyStatus = 'pending' | 'approved' | 'rejected';

interface SkillFixHierarchySuggestion {
    skill: string[];
    description: string;
    status: SkillFixHierarchyStatus;
    explanation?: string;
}

const SKILL_FIX_HIERARCHY_STATUS_LABELS: Record<SkillFixHierarchyStatus, string> = {
    pending: 'Pendente',
    approved: 'Aprovado',
    rejected: 'Reprovado',
};

/**
 * Busca a sugestão já feita pelo candidato para este parent e type. É POST, e não GET, porque o filtro de
 * sessão do backend só valida o login quando a requisição tem corpo. Sem sugestão, o backend devolve json vazio
 * e onFound não é chamado.
 */
const getSkillFixHierarchy = (parent: string, type: SkillFixHierarchyType, onFound: (suggestion: SkillFixHierarchySuggestion) => void, retry: () => void) => {
    const callbacks: any = {};
    callbacks['retryAfterAuthentication'] = retry;
    callbacks[200] = (response: any) => response && response.status && onFound(response);
    callbacks['onUnexpectedHttpStatus'] = () => warn('Falha ao carregar sugestão', 'Não conseguimos carregar a sua sugestão anterior para este conhecimento.');
    JnAjax.doAnAjaxRequest('resume/{email}/skills/hierarchy/search', callbacks, 'POST', { parent, type }, {}, 'http://localhost:8081');
};

const deleteSkillFixHierarchy = (parent: string, type: SkillFixHierarchyType, onSuccess: () => void, onNotFound: () => void) => {
    const callbacks: any = {};
    callbacks['retryAfterAuthentication'] = () => deleteSkillFixHierarchy(parent, type, onSuccess, onNotFound);
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
                    <p className="m-0">{suggestion.explanation}</p>
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

    const stopPropagation = (e: React.SyntheticEvent) => e.stopPropagation();

    const loadSuggestion = () => {
        setSelectedSkills([]);
        setReason('');
        setSuggestion(null);
        getSkillFixHierarchy(accordionItem.skill, type, (found) => {
            setSelectedSkills(found.skill || []);
            setReason(found.description || '');
            setSuggestion(found);
        }, loadSuggestion);
    };

    // Skills da sugestão que já não estão entre as opções (ex.: uma adição aprovada passa a ser filha do
    // accordion e sai das opções de adicionar); sem elas o MultiSelect esconderia parte do que foi sugerido.
    const optionSkills = options.map((option: any) => option.skill);
    const missingOptions = selectedSkills.filter((skill) => !optionSkills.includes(skill)).map((skill) => ({ label: skill, skill }));
    const allOptions = [...options, ...missingOptions];

    // Sugestão já avaliada: em vez de reenviar o que foi aprovado/reprovado, o botão oferece começar uma nova
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
        sendSkillFixHierarchy(accordionItem.skill, selectedSkills, type, reason, () => {
            setSelectedSkills([]);
            setReason('');
            close();
        });
    };

    // Só existe o que desistir enquanto a sugestão está pendente; aprovada/reprovada é histórico da análise
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
                <button onClick={() => setConfirmingWithdraw(true)} style={{ minWidth: '15%' }} type="button" className="btn btn-outline-danger">
                    Desistir da sugestão
                </button>
            </>
        );

    return (
        <span onClick={stopPropagation} onKeyDown={stopPropagation}>
            <LinkModal
                onSave={alreadyReviewed ? startNewSuggestion : save}
                saveButtonLabel={alreadyReviewed ? 'Nova sugestão' : 'Enviar'}
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
                    />
                    <InputTextarea className="w-full" placeholder={reasonExplanation} value={reason} onChange={(e) => setReason(e.target.value)} rows={6} />
                    {suggestion && <SkillFixHierarchyStatusView suggestion={suggestion} />}
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

interface LinkModalProps {
    children: React.ReactNode;
    headerModal: string;
    // recebe a função que fecha o modal, para quem salva decidir fechar só depois de salvar com sucesso
    onSave: (close: () => void) => void;
    // disparado toda vez que o modal é aberto
    onOpen?: () => void;
    // texto do botão que chama onSave (padrão: 'Enviar')
    saveButtonLabel?: string;
    // botões adicionais, à esquerda do principal; recebem a função que fecha o modal
    extraActions?: (close: () => void) => React.ReactNode;
    labelText: string;
    linkText: string;
    icon?: string;
}
const LinkModal: React.FC<LinkModalProps> = ({ onSave, onOpen, saveButtonLabel = 'Enviar', extraActions, labelText, linkText, headerModal, icon, children }) => {
    const [visible, setVisible] = useState(false);
    const open = () => {
        setVisible(true);
        onOpen && onOpen();
    };
    return (
        <div className={icon ? 'inline-flex items-center' : undefined}>
            {labelText && !icon && <label style={{ fontSize: '10px' }}>{labelText}</label>}
            {icon ? (
                // span em vez de <a>: o ícone pode ficar dentro do cabeçalho do AccordionTab, que já é um <a>
                <span
                    role="button"
                    tabIndex={0}
                    className="linkParaAbrirModal inline-flex cursor-pointer items-center"
                    title={linkText}
                    aria-label={linkText}
                    onClick={open}
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
                        <button onClick={() => onSave(() => setVisible(false))} style={{ minWidth: '15%' }} type="button" className="btn btn-danger">
                            {saveButtonLabel}
                        </button>
                    </div>
                </div>
            </Dialog>
        </div>
    );
};
