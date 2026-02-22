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
import { LabelComponent } from '@/presentation/components/source/LabelComponent';
import PubSub from 'pubsub-js';

export class SkillListModel {
    constructor(main: boolean = false, filter: string = '', list: any[] = [], originalList: any[] = [], title: string, name: string) {}
}
export interface ITabSkillStore {
    setGroups: (groups: SkillListModel[], getAccordionList: (group: any) => any[]) => void;
    getWordsFromGroup: (name: string) => string[];
    setContext: (context: any) => void;
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


const getSkillsContext = (context: any, groups: any[], accordionList:  any[]) => {

    const skillsContext : any[] = [];

    const discardedSkills = context.discardedSkills || {};

    for(let type in discardedSkills){
        const array = discardedSkills[type] || [];
        const category = 'discardedSkills';
        for(let index in array) {
            const sk = array[index];
            const skill = {...sk, type, category};
            skillsContext.push(skill);
        }
    }

    for(let groupIndex in groups){
        const group = groups[groupIndex] || {};
        const array = group.list || [];
        const type = group.name;
        const category = type;
        for(let index in array) {
            const sk = array[index];
            const skill = {...sk, type, category};
            skillsContext.push(skill);
        }
    }


    for(let index in accordionList){
        const skill = accordionList[index];
        if(!skill){
            continue;
        }
        skill.category = 'parent';
        skill.type = 'parent';
        skillsContext.push(skill);
    }


    return skillsContext;
}


const sendSkillSuggest = (word: string, context: any, groups: any[], accordionList:  any[]) => {
    const skillsContext = getSkillsContext(context, groups, accordionList);

    const numbers = {};

    const types = skillsContext.map(x => x.category);

    const set = new Set(types);
    const array = [...set];
    for(let index in array){
        const type = array[index];
        const number = skillsContext.filter(x => x.category == type).length;

        numbers[type] = number;
    }
    console.log(numbers);
    const mainGroup = groups.filter(group => group.main)[0];

    {
        const showMessage = mainGroup.list.filter((sk: any) => sk.word.toUpperCase() == word.toUpperCase())[0];
        if (showMessage) {
            PubSub.publish('showInfoMessage', { detail: `A palavra '${word}' já está relacionada em sua lista de ferramentas`, summary: `Palavra já relacionada` });
            return;
        }
    }
    {
        const showMessage = mainGroup.list.filter((sk: any) => sk.skill.toUpperCase() == word.toUpperCase())[0];
        if (showMessage) {
            PubSub.publish('showInfoMessage', {
                detail: `A palavra '${word}' já está relacionada em sua lista de ferramentas porém com o nome '${showMessage.word}'`,
                summary: `Palavra já relacionada`,
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
                PubSub.publish('showInfoMessage', { detail: `A palavra '${word}' já está relacionada em sua lista de ferramentas na lista '${group.title}'`, summary: `Palavra já relacionada` });
                return;
            }
        }
        {
            const showMessage = group.list.filter((sk: any) => sk.word.toUpperCase() == word.toUpperCase())[0];
            if (showMessage) {
                PubSub.publish('showInfoMessage', {
                    detail: `A palavra '${word}' já está relacionada em sua lista de ferramentas porém com o nome '${showMessage.word}' e na lista '${group.title}'`,
                    summary: `Palavra já relacionada`,
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

            if(errorHasFound(context, error, word)){
                return;
            }
        }

        {
            const showMessage = mainGroup.list.filter((sk: any) => sk.parent.includes(word.toUpperCase()));
            if (showMessage.length) {
                const words = showMessage.map((x: any) => x.word);
                PubSub.publish('showInfoMessage', {
                    detail: `A palavra '${word}' já está relacionada em sua lista de ferramentas porém como pré requisito das palavras ${JSON.stringify(words)}`,
                    summary: `Palavra já relacionada como pré requisito de outras palavras`,
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
    PubSub.publish('showInfoMessage', {
        detail: summary.replace('{associated}', filtered.associated),
        summary : summary.replace('{associated}', filtered.associated),
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
    const [errorImplictKnowledge, setErrorImplictKnowledge] = useState('');
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
                        <Tooltip target="#btnHelp" content="Clique aqui para saber o que são conhecimentos implícitos" position="bottom" />
                        <Button icon="pi pi-question-circle" id="btnHelp" onClick={() => setVisible(true)} />
                        <LinkModal
                            onSave={() => {}}
                            headerModal="Descreva o erro de associação de conhecimentos que você encontrou ou discordância com essa classificação"
                            labelText={`Meus conhecimentos implícitos (${accordionList ? accordionList.length : 0})`}
                            linkText="Discorda dessas associações ou encontrou algum erro?"
                        >
                            <InputTextarea placeholder="" style={{ width: '75%' }} value={errorImplictKnowledge} onChange={(e) => setErrorImplictKnowledge(e.target.value)} rows={10} cols={100} />
                        </LinkModal>
                    </div>
                    <div className="panel mb-3" style={{ maxHeight: '400px', overflow: 'auto', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)' }}>
                        <div className="gap-x-12 sm:grid-cols-2">
                            <Accordion>
                                {accordionList &&
                                    accordionList.map((item: any, id: any) => (
                                        <AccordionTab key={id} header={`${item.skill} (${item.children.length})`}>
                                            <h1 style={{ fontSize: '7px' }}>Habilidades associadas a {item.skill}:</h1>
                                            {item.children.map((child: any, counter: any) => (
                                                <p className="m-0" key={child.label}>
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
interface LinkModalProps {
    children: React.ReactNode;
    headerModal: string;
    onSave: () => void;
    labelText: string;
    linkText: string;
}
const LinkModal: React.FC<LinkModalProps> = ({ onSave, labelText, linkText, headerModal, children }) => {
    const [visible, setVisible] = useState(false);
    return (
        <div>
            <label style={{ fontSize: '10px' }}>{labelText}</label>
            <a href="#" className="linkParaAbrirModal" onClick={() => setVisible(true)}>
                {linkText}
            </a>
            <Dialog
                style={{ width: '50vw' }}
                header={headerModal}
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
                    <div className="flex-column flex">
                        <button onClick={onSave} style={{ width: '15%' }} type="button" className="btn btn-danger ltr:ml-auto rtl:mr-auto">
                            Enviar
                        </button>
                    </div>
                </div>
            </Dialog>
        </div>
    );
};
