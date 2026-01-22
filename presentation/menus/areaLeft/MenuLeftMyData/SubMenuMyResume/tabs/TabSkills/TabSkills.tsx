'use client';
import { create } from 'zustand';

import { ReactSortable } from 'react-sortablejs';

import { InputText } from 'primereact/inputtext';

import React from 'react';

import { ScrollPanel } from 'primereact/scrollpanel';

import { Accordion, AccordionTab } from 'primereact/accordion';

import { Panel } from 'primereact/panel';

export class SkillListModel {
    constructor(main: boolean = false, filter: string = '', list: any[] = [], title: string, name: string) {}
}
export interface ITabSkillStore {
    setAccordionList: (accordionList: any[]) => void;
    setGroups: (groups: SkillListModel[], getAccordionList: (group: any) => any[]) => void;
    getWordsFromGroup: (name: string) => string[];
    groups: SkillListModel[];
    accordionList: any[];
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
    groups: [],
    accordionList: [],
    setAccordionList: (accordionList: any[]) => {
        set({ accordionList });
    },
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
    list: any[];
}

const SkillList: React.FC<SkillListProps> = ({ title, width, list, filter, setFilter, setList, transferToAnotherList }) => {
    // const originalList = [...list];

    const filtro = (item: any) => !filter || item.label.toUpperCase().startsWith(filter.toUpperCase());
    return (
        <ScrollPanel style={{ width, padding: '10px' }}>
            <div className="mb-5" style={{ fontSize: '10px' }}>
                <label>{`${title} (${list.length})`}</label>
                {list.length >= 7 && (
                    <InputText
                        style={{ padding: '10px', width: '100%' }}
                        placeholder="Digite a habilidade para filtrar da listagem abaixo"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                )}
            </div>
            <div className="panel mb-3" style={{ maxHeight: '400px', overflow: 'auto', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)' }}>
                <div className="gap-x-12 sm:grid-cols-2">
                    <ul>
                        <ReactSortable
                            list={list.filter(filtro)}
                            setList={(myList) => setList(myList.filter(filtro))}
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

    return (
        <ScrollPanel style={{ width, padding: '10px' }}>
            <div className="mb-5" style={{ fontSize: '10px' }}>
                <label>Meus conhecimentos implícitos ({accordionList ? accordionList.length : 0})</label>
                <Panel>
                    <Accordion>
                        {accordionList && accordionList.map((item: any, id: any) => (
                            <AccordionTab key={id} header={`${item.skill} (${item.children.length})`}>
                               <h1 style={{fontSize: "7px"}}>Habilidades associadas a {item.skill}:</h1>
                                {item.children.map((child: any, counter: any) => (
                                    <p className="m-0" key={child.label}>
                                        {(counter + 1)+': ' + child.label}
                                    </p>
                                ))}
                            </AccordionTab>
                        ))}
                    </Accordion>
                </Panel>
            </div>
        </ScrollPanel>
    );
};
