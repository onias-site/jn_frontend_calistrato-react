'use client';
import { create } from 'zustand';

import { ReactSortable } from 'react-sortablejs';

import { InputText } from 'primereact/inputtext';

import React, { useRef, useState } from 'react';

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
    getPendingRequirements: () => string[];
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

    // sem efeitos colaterais: é chamado a cada renderização para habilitar ou não o botão de avançar
    getPendingRequirements: () => {
        const skillsContext = get().loadSkillsContext();
        const errors = getResumeSkillsErrors(skillsContext);
        return errors;
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
                // o ReactSortable pode já ter inserido o item via setList; evita duplicá-lo
                const listWithoutTransferred = group.list.filter((x: any) => x.label != obj.label);
                group.list = [...listWithoutTransferred, obj];
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
        // no celular as três colunas ficam uma embaixo da outra; a partir do md, lado a lado, cada uma com a sua fração
        <div className="flex flex-col md:max-h-[1000px] md:flex-row">
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

// cada item segue o esquema de VisJsonFieldsSkills no backend: só os campos dele (o índice do currículo é estrito),
// skill, word, type e category obrigatórios, associated opcional de 2 a 50 caracteres e parent opcional
const toResumeSkill = (item: any, type: string, category: string) => {
    const word = item.word || item.skill;
    const resumeSkill: any = { skill: item.skill, word, type, category };
    const parent = item.parent || [];
    parent.length && (resumeSkill.parent = parent);
    const associated = item.associated || '';
    associated.length >= 2 && associated.length <= 50 && (resumeSkill.associated = associated);
    return resumeSkill;
};

// mesmas regras de VisJsonFieldsSkills no backend; skill e word ainda exigem dois caracteres que não sejam espaço
const twoNonBlankCharacters = /\S.*\S/s;
const isInvalidText = (text: any, minLength: number, maxLength: number) => typeof text != 'string' || text.length < minLength || text.length > maxLength;
const isInvalidSkillText = (text: any) => isInvalidText(text, 2, 50) || !twoNonBlankCharacters.test(text);

const getResumeSkillErrors = (resumeSkill: any): string[] => {
    const errors: string[] = [];
    const name = resumeSkill.skill || resumeSkill.word || '(sem nome)';
    isInvalidSkillText(resumeSkill.skill) && errors.push(`A habilidade ${name} deve ter um nome de 2 a 50 caracteres`);
    isInvalidSkillText(resumeSkill.word) && errors.push(`A palavra da habilidade ${name} deve ter de 2 a 50 caracteres`);
    isInvalidText(resumeSkill.type, 2, 20) && errors.push(`O tipo da habilidade ${name} deve ter de 2 a 20 caracteres`);
    isInvalidText(resumeSkill.category, 2, 20) && errors.push(`A categoria da habilidade ${name} deve ter de 2 a 20 caracteres`);
    resumeSkill.associated !== undefined && isInvalidText(resumeSkill.associated, 2, 50) && errors.push(`O termo associado à habilidade ${name} deve ter de 2 a 50 caracteres`);
    const parents = resumeSkill.parent || [];
    parents.some((parent: any) => isInvalidSkillText(parent)) && errors.push(`As habilidades pai de ${name} devem ter de 2 a 50 caracteres`);
    return errors;
};

const getResumeSkillsErrors =(resumeSkills: any[]): string[] => {
    const errors = resumeSkills.flatMap((resumeSkill: any) => getResumeSkillErrors(resumeSkill));
    const uniqueErrors = [...new Set(errors)];
    return uniqueErrors;
};

const getSkillsContext = (context: any, groups: any[], accordionList: any[]) => {
    const skillsContext: any[] = [];

    const discardedSkills = context.discardedSkills || {};

    for (let type in discardedSkills) {
        const array = discardedSkills[type] || [];
        const category = 'discardedSkills';
        for (let index in array) {
            const sk = array[index];
            const skill = toResumeSkill(sk, type, category);
            skillsContext.push(skill);
        }
    }

    for (let groupIndex in groups) {
        const group = groups[groupIndex] || {};
        const array = group.list || [];
        const type = group.name;
        const category = group.category;
        for (let index in array) {
            const sk = array[index];
            const skill = toResumeSkill(sk, type, category);
            skillsContext.push(skill);
        }
    }

    // habilidades implícitas (pais das habilidades do currículo): a própria habilidade faz as vezes de palavra
    for (let index in accordionList) {
        const sk = accordionList[index];
        if (!sk) {
            continue;
        }
        const skill = toResumeSkill(sk, 'parent', 'parent');
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

    if (isSynonymOfAListedSkill(word, groups)) {
        return true;
    }

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

// A habilidade digitada é sinônimo de uma que já está em alguma das listas (PTL, sinônimo de PICK BY LIGHT): o sistema
// já a reconhece pelo outro nome, e sugeri-la seria sugerir a mesma habilidade de novo. Os sinônimos vêm do skills/fromText.
const isSynonymOfAListedSkill = (word: string, groups: any[]) => {
    const comparableWord = toComparable(word);
    for (const group of groups) {
        const list = group.list || [];
        const listedSkill = list.filter((sk: any) => (sk.synonym || []).some((synonym: string) => toComparable(synonym) === comparableWord))[0];
        if (!listedSkill) {
            continue;
        }
        warn('Habilidade já cadastrada por meio de sinônimo', `'${word}' é sinônimo de '${listedSkill.skill}', que já está na lista '${group.title}'.`);
        return true;
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
    // o ReactSortable localiza o item arrastado pelo índice no DOM, então precisa receber a mesma lista que é renderizada (a filtrada)
    const filteredList = list.filter(filtro);
    // ao devolver a lista filtrada alterada, os itens escondidos pelo filtro são preservados
    const setFilteredList = (newFilteredList: any[]) => {
        const hiddenByFilter = list.filter((item: any) => !filtro(item));
        setList([...hiddenByFilter, ...newFilteredList]);
    };
    const [helpVisible, setHelpVisible] = useState(false);
    const helpButtonId = main ? 'btnHelpSkillsFromResume' : 'btnHelpExcludedSkillsFromResume';
    return (
        <ScrollPanel className="w-full md:w-[var(--skills-column-width)]" style={{ ['--skills-column-width' as any]: width, padding: '10px' }}>
            <Dialog
                header={title}
                visible={helpVisible}
                style={{ width: '50vw' }}
                onHide={() => {
                    if (!helpVisible) return;
                    setHelpVisible(false);
                }}
            >
                <p className="m-0">{main ? SKILLS_FROM_RESUME_HELP : EXCLUDED_SKILLS_FROM_RESUME_HELP}</p>
            </Dialog>
            <div className="mb-5" style={{ fontSize: '10px' }}>
                <Tooltip target={`#${helpButtonId}`} content="Clique aqui para saber mais detalhes sobre esta lista" position="bottom" />
                <label>
                    <Button icon="pi pi-question-circle" id={helpButtonId} onClick={() => setHelpVisible(true)} />
                    {`${title} (${list.length})`}
                </label>

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
                            list={filteredList}
                            setList={setFilteredList}
                            animation={200}
                            delay={1}
                            ghostClass="gu-transit"
                            group="shared"
                            onAdd={(evt) => transferToAnotherList(evt.item.textContent)}
                        >
                            {list.length ? (
                                filteredList.map((skill: any, id: number) => (
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
    // mesmo filtro das outras duas listas: aparece a partir de 7 itens (ou enquanto houver texto digitado) e filtra pelo começo do nome
    const [filter, setFilter] = useState('');
    const filteredAccordionList = (accordionList || []).filter((item: any) => !filter || ('' + item.skill).toUpperCase().startsWith(filter.trim().toUpperCase()));
    return (
        <ScrollPanel className="w-full md:w-[var(--skills-column-width)]" style={{ ['--skills-column-width' as any]: width, padding: '10px' }}>
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

                            {(accordionList.length >= 7 || filter) && (
                                <InputText
                                    style={{ padding: '10px', width: '100%' }}
                                    placeholder="Digite o conhecimento para filtrar da listagem abaixo"
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                />
                            )}
                        </div>
                    </div>
                    <div className="panel mb-3" style={{ maxHeight: '400px', overflow: 'auto', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)' }}>
                        <div className="gap-x-12 sm:grid-cols-2">
                            <Accordion>
                                {filteredAccordionList.map((item: any) => (
                                    <AccordionTab
                                        key={item.skill}
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
        warn('Justificativa inválida', `A justificativa deve ter entre ${DESCRIPTION_MIN_LENGTH} e ${DESCRIPTION_MAX_LENGTH} caracteres.`);
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
    // desistir de novo do mesmo conhecimento e tipo dentro de uma hora: a sugestão continua pendente (evita que o vai e
    // vem do candidato encha o operador de avisos no Telegram e gaste a cota de e-mails)
    callbacks[429] = () =>
        warn(
            'Desistência não permitida',
            `Você já desistiu de uma sugestão de ${type === 'add' ? 'associação' : 'desassociação'} com ${parent} há pouco. Não é possível desistir dela de novo dentro de uma hora: ela continua em análise.`,
        );
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
                <AccordionTab header="Justificativa do suporte">
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
    // textos do botão de ajuda de cada campo: o que é o campo e como usá-lo
    skillsHelp: string;
    reasonHelp: string;
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
    skillsHelp,
    reasonHelp,
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

    // O stopPropagation acima também barra o clique que o MultiSelect escuta no window para fechar a lista ao clicar
    // fora dela (o Dialog vai para o body por portal, mas o evento sobe pela árvore do React até este span): sem isto a
    // lista ficava aberta por cima dos outros campos. Por isso o fechamento é feito aqui, antes de barrar o clique.
    const skillsMultiSelect = useRef<MultiSelect>(null);
    const closeSkillListWhenClickedOutside = (e: React.MouseEvent) => {
        const clicked = e.target as Node;
        const multiSelectElement = skillsMultiSelect.current?.getElement();
        const skillList = skillsMultiSelect.current?.getOverlay();
        const clickedInsideTheMultiSelect = !!multiSelectElement && multiSelectElement.contains(clicked);
        const clickedInsideTheList = !!skillList && skillList.contains(clicked);
        if (!clickedInsideTheMultiSelect && !clickedInsideTheList) {
            skillsMultiSelect.current?.hide();
        }
        e.stopPropagation();
    };

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
        <span onClick={closeSkillListWhenClickedOutside} onKeyDown={stopPropagation}>
            <LinkModal
                onSave={mainButton.onSave}
                saveButtonLabel={mainButton.label}
                saveLoading={loadingRequest === 'load' || loadingRequest === 'save'}
                saveDisabled={busy}
                extraActions={withdrawButton}
                onOpen={loadSuggestion}
                fieldsHaveOwnHelp
                headerModal={headerModal} labelText={reasonExplanation} linkText={linkText} icon={icon}>
                <div className="flex w-full flex-col items-stretch">
                    <LabelComponent explanation={skillsHelp} labelValue="Habilidades" property={`skillFixHierarchySkills-${type}`} errors={{}}>
                        <MultiSelect
                            ref={skillsMultiSelect}
                            id={`skillFixHierarchySkills-${type}`}
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
                    </LabelComponent>
                    <LabelComponent explanation={reasonHelp} labelValue="Justificativa" property={`skillFixHierarchyReason-${type}`} errors={{}}>
                        <InputTextarea
                            id={`skillFixHierarchyReason-${type}`}
                            className="w-full"
                            placeholder={reasonExplanation}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={6}
                            disabled={!!suggestion}
                        />
                    </LabelComponent>
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
            skillsHelp={
                `São as habilidades do seu currículo que, na sua opinião, dependem do conhecimento em ${accordionItem.skill}: quem domina cada uma delas precisa conhecer ${accordionItem.skill} ` +
                '(ex.: SPRING BOOT depende de JAVA), mas hoje elas não aparecem associadas a ele. ' +
                'Como usar: abra a lista e marque uma ou mais habilidades; a busca no topo da lista encontra cada uma pelo nome. ' +
                `A lista mostra só as habilidades do seu currículo que ainda não estão associadas a ${accordionItem.skill}. Selecione ao menos uma.`
            }
            reasonHelp={
                'É a sua explicação para o nosso time de suporte, que vai avaliar a sugestão. ' +
                `Como usar: conte por que as habilidades marcadas dependem de ${accordionItem.skill} (ex.: são bibliotecas, frameworks ou ferramentas construídas sobre ele). ` +
                `Escreva entre ${DESCRIPTION_MIN_LENGTH} e ${DESCRIPTION_MAX_LENGTH} caracteres. ` +
                'Cada habilidade marcada é avaliada separadamente; o resultado chega por e-mail e também aparece aqui, no painel Motivo, quando você abrir este modal de novo.'
            }
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
        skillsHelp={
            `São as habilidades hoje associadas a ${accordionItem.skill} que, na sua opinião, não dependem desse conhecimento: é possível dominá-las sem conhecer ${accordionItem.skill}. ` +
            'Como usar: abra a lista e marque uma ou mais habilidades; a busca no topo da lista encontra cada uma pelo nome. ' +
            `A lista mostra só as habilidades associadas a ${accordionItem.skill}. Selecione ao menos uma.`
        }
        reasonHelp={
            'É a sua explicação para o nosso time de suporte, que vai avaliar a sugestão. ' +
            `Como usar: conte por que as habilidades marcadas não dependem de ${accordionItem.skill} (ex.: funcionam sem ele ou pertencem a outra tecnologia). ` +
            `Escreva entre ${DESCRIPTION_MIN_LENGTH} e ${DESCRIPTION_MAX_LENGTH} caracteres. ` +
            'Cada habilidade marcada é avaliada separadamente; o resultado chega por e-mail e também aparece aqui, no painel Motivo, quando você abrir este modal de novo.'
        }
    />
);

// Mesmas regras de VisJsonCommonsFields no backend (skill e synonym), checadas aqui para não gastar requisição
const SKILL_MIN_LENGTH = 2;
const SKILL_MAX_LENGTH = 50;

// A habilidade é gravada como as do sistema: maiúsculas e com um só espaço entre as palavras
const normalizeSkill = (text: string) => text.trim().replace(/\s+/g, ' ').toUpperCase();

// Para comparar duas grafias da mesma habilidade: além de normalizar, ignora a acentuação (PROGRAMAÇÃO = PROGRAMACAO)
const toComparable = (text: string) =>
    normalizeSkill(text)
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '');

const isValidSkillName = (name: string, summary: string) => {
    if (name.length < SKILL_MIN_LENGTH || name.length > SKILL_MAX_LENGTH) {
        warn(summary, `'${name}' deve ter entre ${SKILL_MIN_LENGTH} e ${SKILL_MAX_LENGTH} caracteres.`);
        return false;
    }
    return true;
};

/**
 * Um sinônimo precisa ter de 2 a 50 caracteres (depois do trim e sem contar a acentuação) e não pode ser a própria
 * habilidade escrita de outro jeito (com outra acentuação, outras maiúsculas ou espaços repetidos).
 */
const isValidSynonym = (synonym: string, skill: string) => {
    const comparableLength = toComparable(synonym).length;
    if (comparableLength < SKILL_MIN_LENGTH || comparableLength > SKILL_MAX_LENGTH) {
        warn('Sinônimo inválido', `'${synonym}' deve ter entre ${SKILL_MIN_LENGTH} e ${SKILL_MAX_LENGTH} caracteres.`);
        return false;
    }
    if (toComparable(synonym) !== toComparable(skill)) {
        return true;
    }
    warn('Sinônimo inválido', `'${synonym}' é a própria habilidade '${skill}', e não um sinônimo dela.`);
    return false;
};

type SkillSuggestionStatus = 'pending' | 'approved' | 'rejected';

interface SkillSuggestion {
    skill: string;
    synonym?: string[];
    description: string;
    status: SkillSuggestionStatus;
    explanation?: string;
    // o que o candidato digitou, quando a sugestão foi achada por ser um dos sinônimos dela (PTL leva a PICK BY LIGHT)
    typedSynonym?: string;
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
const sendSkillSuggestion = (skill: string, synonyms: string[], description: string, onSuccess: () => void, onAlreadyDecided: () => void, setLoading: (loading: boolean) => void) => {
    const callbacks: any = {};
    callbacks['retryAfterAuthentication'] = () => sendSkillSuggestion(skill, synonyms, description, onSuccess, onAlreadyDecided, setLoading);
    callbacks[200] = () => {
        PubSub.publish('showMessage', {
            summary: 'Sugestão enviada',
            detail: 'Obrigado! Sua sugestão será analisada e você será avisado do resultado.',
        });
        onSuccess();
    };
    // já pendente, ou já sugerida por meio de um sinônimo (PTL depois de sugerir PICK BY LIGHT com o sinônimo PTL): o
    // modal carrega a sugestão que já existe
    callbacks[409] = () => {
        warn('Sugestão já feita', `Você já sugeriu a habilidade '${skill}', diretamente ou por meio de um sinônimo. Veja abaixo a situação dela.`);
        onAlreadyDecided();
    };
    // nos dois casos o modal carrega a decisão do suporte sobre a habilidade, ainda que a sugestão tenha sido de outro candidato
    callbacks[412] = () => {
        warn('Habilidade já reconhecida', `A habilidade '${skill}' já é reconhecida pelo sistema.`);
        onAlreadyDecided();
    };
    // a tela mostra a decisão ao digitar a habilidade; o 410 só chega se ela foi avaliada depois de carregada
    callbacks[410] = () => {
        warn('Sugestão já avaliada', `A habilidade '${skill}' já foi avaliada pelo suporte. Veja abaixo o resultado e o motivo.`);
        onAlreadyDecided();
    };
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
 * Busca a sugestão que o candidato já fez desta habilidade (ou de outra, da qual esta é sinônimo). É POST, e não GET,
 * porque o filtro de sessão do backend só valida o login quando a requisição tem corpo. Sem sugestão, o backend devolve
 * json vazio e quem é chamado é onNotFound.
 * Digitar a habilidade não exige login (só enviar ou desistir exige): o 401 aqui equivale a "nenhuma sugestão".
 * O 400 é a validação do backend (a mesma da tela: ao menos 2 caracteres além dos espaços).
 */
const getSkillSuggestion = (skill: string, onFound: (suggestion: SkillSuggestion) => void, onNotFound: () => void, setLoading: (loading: boolean) => void) => {
    const callbacks: any = {};
    callbacks[401] = onNotFound;
    callbacks[200] = (response: any) => (response && response.status ? onFound(response) : onNotFound());
    callbacks[400] = () => warn('Habilidade inválida', `'${skill}' deve ter entre ${SKILL_MIN_LENGTH} e ${SKILL_MAX_LENGTH} caracteres.`);
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
    // desistir de novo da mesma habilidade dentro de uma hora: a sugestão continua pendente
    callbacks[429] = () =>
        warn('Desistência não permitida', `Você já desistiu de uma sugestão da habilidade '${skill}' há pouco. Não é possível desistir dela de novo dentro de uma hora: ela continua em análise.`);
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

// textos do botão de ajuda das duas listas de habilidades do currículo: o que é a lista e como usá-la
const SKILLS_FROM_RESUME_HELP =
    'São as habilidades técnicas que encontramos no texto do seu currículo. São por elas que os recrutadores encontram o seu currículo nas buscas. ' +
    'Como usar: se não quer ser encontrado por alguma delas (ex.: uma tecnologia com a qual não quer mais trabalhar), arraste-a para a lista de habilidades pelas quais você NÃO quer ser encontrado. ' +
    'Com 7 habilidades ou mais, aparece um campo para filtrar a lista pelo começo do nome. ' +
    'Se faltar alguma habilidade que consta no seu currículo, use o link "Deixamos de listar alguma habilidade?" para sugeri-la.';

const EXCLUDED_SKILLS_FROM_RESUME_HELP =
    'São habilidades que constam no seu currículo, mas pelas quais você escolheu NÃO ser encontrado nas buscas dos recrutadores. ' +
    'Como usar: para esconder uma habilidade, arraste-a para cá a partir da lista de habilidades pelas quais você quer ser encontrado; ' +
    'para voltar a ser encontrado por ela, arraste-a de volta. ' +
    'Com 7 habilidades ou mais, aparece um campo para filtrar a lista pelo começo do nome.';

// textos do botão de ajuda de cada campo do modal de sugestão de habilidade: o que é o campo e como usá-lo
const SKILL_SUGGESTION_SKILL_HELP =
    'É a habilidade técnica (ferramenta, linguagem, framework, metodologia) que CONSTA no texto do seu currículo e que deixamos de listar entre as suas habilidades. ' +
    'Como usar: digite-a exatamente como está escrita no currículo (ex.: REACT NATIVE); o texto vira maiúsculas e os espaços repetidos são removidos. ' +
    'Ao sair do campo, a habilidade é validada: precisa ter ao menos 2 caracteres, não pode estar na sua lista (nem como sinônimo de uma habilidade dela) e precisa constar no currículo. ' +
    'Se ela já foi sugerida antes, por você ou por outro candidato, ou se é sinônimo de uma habilidade que você já sugeriu, mostramos a situação dela e, se já foi avaliada, o motivo da decisão. ' +
    'Os sinônimos e a justificativa só ficam disponíveis depois de uma habilidade válida.';

const SKILL_SUGGESTION_SYNONYMS_HELP =
    'São outras formas de escrever a mesma habilidade: siglas, abreviações e grafias alternativas (ex.: para PICK BY LIGHT, os sinônimos PICK TO LIGHT e PTL). ' +
    'Se a sugestão for aprovada, os sinônimos também passam a ser reconhecidos nos currículos. ' +
    'Como usar: digite um sinônimo e tecle Enter (ou saia do campo) para transformá-lo em etiqueta, ou digite vários separados por vírgula; para remover um, clique no x da etiqueta. ' +
    `Cada sinônimo deve ter entre ${SKILL_MIN_LENGTH} e ${SKILL_MAX_LENGTH} caracteres e não pode ser a própria habilidade (nem escrita com outra acentuação). O campo é opcional.`;

const SKILL_SUGGESTION_REASON_HELP =
    'É a sua explicação para o nosso time de suporte, que vai avaliar a sugestão. ' +
    'Como usar: conte por que esta habilidade deveria ser reconhecida e em que parte do currículo ela aparece (ex.: o projeto, a empresa, o período). ' +
    `Escreva entre ${DESCRIPTION_MIN_LENGTH} e ${DESCRIPTION_MAX_LENGTH} caracteres. ` +
    'O resultado da avaliação chega por e-mail e também aparece aqui, no painel Motivo, quando você digitar a habilidade de novo.';

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
    // a habilidade passou pelas validações (da tela e do servidor) e ainda não foi sugerida: só então os sinônimos e a
    // justificativa ficam habilitados
    const [skillValid, setSkillValid] = useState(false);

    const [loadingRequest, setLoadingRequest] = useState<'load' | 'save' | 'withdraw' | null>(null);
    const setLoadingOf = (request: 'load' | 'save' | 'withdraw') => (loading: boolean) => setLoadingRequest(loading ? request : null);
    const busy = loadingRequest !== null;

    const startNewSuggestion = () => {
        setSkill('');
        setSynonyms([]);
        setReason('');
        setSuggestion(null);
        setSearchedSkill('');
        setSkillValid(false);
    };

    // Validações que não dependem do servidor: o tamanho (depois do trim) e as da lista do currículo (já está na lista,
    // é sinônimo de uma da lista, é pedaço de outra palavra...), as mesmas que o botão Enviar faz
    const isSkillAllowedByTheScreen = (normalizedSkill: string) =>
        isValidSkillName(normalizedSkill, 'Habilidade inválida') && !isSkillSuggestionBlocked(normalizedSkill, context, groups, accordionList);

    const loadSuggestion = (skillToSearch: string) => {
        setSuggestion(null);
        setSkillValid(false);
        setSearchedSkill(skillToSearch);
        getSkillSuggestion(
            skillToSearch,
            (found) => {
                if (found.typedSynonym) {
                    warn(
                        'Habilidade já sugerida por meio de sinônimo',
                        `'${found.typedSynonym}' é sinônimo de '${found.skill}', que já foi sugerida. Veja abaixo a situação dela.`,
                    );
                    setSkill(found.skill);
                    setSearchedSkill(found.skill);
                }
                setSynonyms(found.synonym || []);
                setReason(found.description || '');
                setSuggestion(found);
            },
            // ainda não sugerida: falta conferir se ela consta no currículo (depois da busca, para que um sinônimo de
            // uma sugestão anterior, que pode não constar no currículo, seja reconhecido como tal)
            () => setSkillValid(!isSkillOutOfTheResume(skillToSearch)),
            setLoadingOf('load'),
        );
    };

    const onSkillBlur = () => {
        const normalizedSkill = normalizeSkill(skill);
        setSkill(normalizedSkill);
        if (normalizedSkill === searchedSkill) {
            return;
        }
        setSuggestion(null);
        setSkillValid(false);
        setSearchedSkill(normalizedSkill);
        // campo deixado em branco: não há o que validar
        if (!skill.length) {
            return;
        }
        if (!isSkillAllowedByTheScreen(normalizedSkill)) {
            return;
        }
        loadSuggestion(normalizedSkill);
    };

    // Cada sinônimo novo (Enter, vírgula ou saída do campo) passa pelas regras de isValidSynonym; o que não passa é
    // descartado com o aviso. Repetidos, mesmo com outra acentuação, viram um só.
    const onSynonymsChange = (values: string[]) => {
        const acceptedSynonyms: string[] = [];
        for (const value of values || []) {
            const synonym = normalizeSkill(value);
            const alreadyAccepted = acceptedSynonyms.some((accepted) => toComparable(accepted) === toComparable(synonym));
            if (!synonym || alreadyAccepted) {
                continue;
            }
            if (!isValidSynonym(synonym, skill)) {
                continue;
            }
            acceptedSynonyms.push(synonym);
        }
        setSynonyms(acceptedSynonyms);
    };

    const pending = !!suggestion && suggestion.status === 'pending';

    const save = (close: () => void) => {
        const normalizedSkill = normalizeSkill(skill);
        setSkill(normalizedSkill);
        if (!isSkillAllowedByTheScreen(normalizedSkill)) {
            return;
        }
        const invalidSynonym = synonyms.filter((synonym) => !isValidSynonym(synonym, normalizedSkill))[0];
        if (invalidSynonym) {
            return;
        }
        if (!isValidDescription(reason)) {
            return;
        }
        // depois das checagens acima: elas explicam melhor os casos que também ficariam fora (ASP dentro de ASPECTJ)
        if (isSkillOutOfTheResume(normalizedSkill)) {
            return;
        }
        sendSkillSuggestion(
            normalizedSkill,
            synonyms,
            reason,
            () => {
                startNewSuggestion();
                close();
            },
            () => loadSuggestion(normalizedSkill),
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
    // sinônimos e justificativa só depois de uma habilidade válida e ainda não sugerida
    const otherFieldsDisabled = hasSuggestion || !skillValid;

    return (
        <LinkModal
            onSave={hasSuggestion ? startNewSuggestion : save}
            saveButtonLabel={hasSuggestion ? 'Nova sugestão' : 'Enviar'}
            saveLoading={loadingRequest === 'load' || loadingRequest === 'save'}
            saveDisabled={busy || (!hasSuggestion && !skillValid)}
            extraActions={withdrawButton}
            onOpen={startNewSuggestion}
            fieldsHaveOwnHelp
            headerModal="Descreva a habilidade técnica que CONSTA no texto do seu currículo e que deixamos de listar aqui"
            labelText=""
            linkText="Deixamos de listar alguma habilidade?"
        >
            <div className="flex w-full flex-col items-stretch">
                <LabelComponent explanation={SKILL_SUGGESTION_SKILL_HELP} labelValue="Habilidade" property="skillSuggestionSkill" errors={{}}>
                    <InputText
                        id="skillSuggestionSkill"
                        className="w-full"
                        placeholder="Habilidade que consta no seu currículo (ex.: REACT NATIVE)"
                        value={skill}
                        disabled={hasSuggestion}
                        maxLength={SKILL_MAX_LENGTH}
                        onChange={(e) => {
                            setSkill(e.target.value.toUpperCase());
                            setSkillValid(false);
                        }}
                        onBlur={onSkillBlur}
                    />
                </LabelComponent>
                <LabelComponent explanation={SKILL_SUGGESTION_SYNONYMS_HELP} labelValue="Sinônimos" property="skillSuggestionSynonyms" errors={{}}>
                    <Chips
                        id="skillSuggestionSynonyms"
                        className="w-full"
                        // a raiz do Chips é inline-flex e a lista de frases não ocupa a largura do modal sem isso
                        pt={{ container: { className: 'w-full' } }}
                        value={synonyms}
                        disabled={otherFieldsDisabled}
                        onChange={(e) => onSynonymsChange(e.value || [])}
                        // sair do campo com um sinônimo digitado vale como teclar Enter
                        addOnBlur
                        separator=","
                        placeholder="Sinônimos: digite cada um e tecle Enter (ou separe por vírgula)"
                    />
                </LabelComponent>
                <LabelComponent explanation={SKILL_SUGGESTION_REASON_HELP} labelValue="Justificativa" property="skillSuggestionReason" errors={{}}>
                    <InputTextarea
                        id="skillSuggestionReason"
                        className="w-full"
                        placeholder="Explique por que esta habilidade deveria ser reconhecida (ex.: em que parte do currículo ela aparece)"
                        value={reason}
                        disabled={otherFieldsDisabled}
                        onChange={(e) => setReason(e.target.value)}
                        rows={6}
                    />
                </LabelComponent>
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
    // os campos trazem o próprio botão de ajuda (um LabelComponent por campo): o modal não põe o botão único do topo
    fieldsHaveOwnHelp?: boolean;
}
const LinkModal: React.FC<LinkModalProps> = ({ onSave, onOpen, saveButtonLabel = 'Enviar', saveLoading = false, saveDisabled = false, extraActions, labelText, linkText, headerModal, icon, fieldsHaveOwnHelp = false, children }) => {
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
                {fieldsHaveOwnHelp ? (
                    <div className="mb-5">{children}</div>
                ) : (
                    <LabelComponent explanation={headerModal} labelValue="" property="resumeText" errors={{}}>
                        {children}
                    </LabelComponent>
                )}

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
