'use client';
import { create } from 'zustand';

import { ReactSortable } from 'react-sortablejs';

import { InputText } from 'primereact/inputtext';

import React from 'react';

interface SkillsListProps {
    moveBetweenLists: (item: any) => void;
    name: string;
}

const SkillsList: React.FC<SkillsListProps> = ({ name, moveBetweenLists }) => {
    const { skillsGroups } = TabSkillsStore((state: ITabSkillsStore) => ({
        ...state,
    }));

    const { stores, setStores } = SkillsInternalListStore((state: ISkillsInternalListStore) => ({
        ...state,
    }));

    const reloadStores = (store: SkillListStore) => {
        stores[name] = store;
        setStores(stores);
    };

    const skillsGroup: TabSkillsModel = skillsGroups.filter((skillsGroup: TabSkillsModel) => skillsGroup.name == name)[0];

    const width = skillsGroups.length ? 100 / skillsGroups.length + '%' : '';
    return (
        <div style={{ width, padding: '10px' }}>
            <div className="mb-5" style={{ fontSize: '10px' }}>
                <label>{skillsGroup.title}</label>
                {stores[name] && stores[name].list.length >= 7 && (
                    <InputText
                        style={{ padding: '10px', width: '100%' }}
                        placeholder="Digite a habilidade para filtrar da listagem abaixo"
                        value={stores[name] && stores[name].filter}
                        onChange={(e) => stores[name] && stores[name].setFilter(e.target.value, reloadStores)}
                    />
                )}
            </div>
            <div className="panel mb-3" style={{ maxHeight: '400px', overflow: 'auto', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)' }}>
                <div className="gap-x-12 sm:grid-cols-2">
                    <ul>
                        <SkillsInternalList name={name} moveBetweenLists={moveBetweenLists} />
                    </ul>
                </div>
            </div>
        </div>
    );
};

interface SkillComponentProps {
    skill: string;
    id: number;
}

const SkillComponent: React.FC<SkillComponentProps> = ({ skill, id }) => {
    return (
        <li key={id} className="mb-2.5 cursor-grab ">
            <div className="items-md-center flex flex-col rounded-md border border-white-light bg-white px-6 py-3.5 text-center dark:border-dark dark:bg-[#1b2e4b] md:flex-row ltr:md:text-left rtl:md:text-right">
                <div className="flex flex-1 flex-col items-center justify-between md:flex-row">
                    <div className="my-3 font-semibold md:my-0 ">
                        <div className="text-base text-dark dark:text-[#bfc9d4]">{skill}</div>
                    </div>
                </div>
            </div>
        </li>
    );
};

interface SkillsInternalListProps {
    moveBetweenLists: (item: any) => void;
    name: string;
}
export interface ISkillsInternalListStore {
    registerStore: (name: string) => void;
    stores: any;
    getSkills : (storeName: string) => any;
}

class SkillListStore {
    list: any[] = [];
    filter: string = '';
    filtered: any[] = [];
    sorter = (a: any, b: any) => {
        return ('' + a).localeCompare('' + b);
    };

    constructor() {}

    setFilter = (filter: any, reloadStores: any) => {
        const { list } = this;
        this.filtered = [...list.filter((x: any) => !filter || x.toUpperCase().startsWith(filter.toUpperCase()))];
        this.filtered.sort(this.sorter);
        this.filter = filter;
        reloadStores(this);
    };

    setList = (list: any[], reloadStores: any) => {
        list.sort(this.sorter);

        this.filtered = [...list];
        this.list = list;

        if (this.filter) {
            this.setFilter(this.filter, reloadStores);
            return;
        }
        reloadStores(this);
    };
}

export const SkillsInternalListStore = create<ISkillsInternalListStore>((set, get) => ({
    registerStore: (name: string) => {
        const { stores } = get();
        stores[name] = stores[name] || new SkillListStore();
    },

    getSkills : (storeName: string) =>{
        const { stores } = get();
        const store = stores[storeName];
        if(!store){
            return [];
        }
        return store.list.map((word:any) => {
            return {word, skill: word}
        });
    },

    setStores: (stores: any) => {
        set({ stores });
    },
    stores: {},
}));

const SkillsInternalList: React.FC<SkillsInternalListProps> = ({ name, moveBetweenLists }) => {
    const { registerStore } = SkillsInternalListStore((state: ISkillsInternalListStore) => ({
        ...state,
    }));

    registerStore(name);
    const { stores, setStores } = SkillsInternalListStore((state: ISkillsInternalListStore) => ({
        ...state,
    }));
    const reloadStores = (store: SkillListStore) => {
        stores[name] = store;
        setStores(stores);
    };

    const { skillsGroups } = TabSkillsStore((state: ITabSkillsStore) => ({
        ...state,
    }));
    const skillsGroup: TabSkillsModel = skillsGroups.filter((skillsGroup: TabSkillsModel) => skillsGroup.name == name)[0];
    const skills = (skillsGroup && skillsGroup.skills) || [];

    if (stores[name].filtered && stores[name].filtered.length) {
        return (
            <ReactSortable
                list={stores[name].list}
                setList={(myList) => stores[name].setList(myList, reloadStores)}
                animation={200}
                delay={1}
                ghostClass="gu-transit"
                group="shared"
                onAdd={(evt) => moveBetweenLists(evt.item.textContent)}
            >
                {stores[name].filtered.map((skill: any, id: number) => (
                    <SkillComponent id={id} skill={skill} key={id} />
                ))}
            </ReactSortable>
        );
    }
    return (
        <ReactSortable
            list={skills}
            setList={(myList) => stores[name].setList(myList, reloadStores)}
            animation={200}
            delay={1}
            ghostClass="gu-transit"
            group="shared"
            onAdd={(evt) => moveBetweenLists(evt.item.textContent)}
        >
            <li className="mb-2.5 cursor-grab">
                <div className="flex items-center justify-center md:flex-row">
                    <div className="my-3 font-semibold md:my-0">
                        <div className="text-base text-dark dark:text-[#bfc9d4] ">Arraste e solte aqui para adicionar.</div>
                    </div>
                </div>
            </li>
        </ReactSortable>
    );
};
export interface TabSkillsProps {}

export class TabSkillsModel {
    skills: any[] = [];
    title: string = '';
    name: string = '';
    constructor() {}
}

export interface ITabSkillsStore {
    skillsGroups: TabSkillsModel[];
    setSkillsGroups: (skillsGroups: TabSkillsModel[]) => void;
}

export const TabSkillsStore = create<ITabSkillsStore>((set, get) => ({
    skillsGroups: [],
    setSkillsGroups: (skillsGroups: TabSkillsModel[]) => set({ skillsGroups }),
}));

export const TabSkills: React.FC<TabSkillsProps> = () => {
    const { skillsGroups, setSkillsGroups } = TabSkillsStore((state: ITabSkillsStore) => ({
        ...state,
    }));

    const moveBetweenLists = (listName: string, item: any) => {
        for (let index in skillsGroups) {
            const skillsGroup = skillsGroups[index];

            if (skillsGroup.name == listName) {
                skillsGroup.skills = [...skillsGroup.skills, item];
                setSkillsGroups(skillsGroups);
                continue;
            }

            skillsGroup.skills = skillsGroup.skills.filter((x: any) => x != item);
            setSkillsGroups(skillsGroups);
        }
    };
    console.log('sendo renderizado', skillsGroups[1].skills.length);
    return (
        <div>
            <div className="flex-column flex" style={{ maxHeight: '1000px' }}>
                {skillsGroups.map((skillsGroup: TabSkillsModel, index: number) => (
                    <SkillsList key={index} name={skillsGroup.name} moveBetweenLists={(evt) => moveBetweenLists(skillsGroup.name, evt)} />
                ))}
            </div>
        </div>
    );
};
