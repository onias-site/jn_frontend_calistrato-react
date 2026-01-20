'use client';
import { create } from 'zustand';

import { ReactSortable } from 'react-sortablejs';

import { InputText } from 'primereact/inputtext';

import React from 'react';

export interface TabSkillsProps {
    groups: SkillListModel[];
}

export class SkillListModel {
    constructor(filter: string,  title: string, name: string, list: any[] = [], setFilter: (str: string) => void, setList: (list: any[]) => void ){

    }
}

export const TabSkills2: React.FC<TabSkillsProps> = ({groups}) => {


    const transferToAnotherList = (name: string, item: any) => {
        for(let index in groups){

            const group = groups[index];

            if(group.name == name){
                group.setList([...group.list, item]);
                continue;
            }

            group.setList(group.list.filter(x => x.label != x.label));

        }
    };
    const width = groups.length ? 100 / groups.length + '%' : '';

    return (
        <div className="flex-column flex" style={{ maxHeight: '1000px' }}>
            {
                groups.map((group) =>
                <SkillList
                    transferToAnotherList = {(item: any) => transferToAnotherList(group.name, item)}
                    setList = {(list:any[]) => group.setList(list)}
                    setFilter = {group.setFilter}
                    filter = {group.filter}
                    title = {group.title}
                    list = {group.list}
                    width = {width}
                />)
            }


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
    return (
        <div style={{ width, padding: '10px' }}>
            <div className="mb-5" style={{ fontSize: '10px' }}>
                <label>{title}</label>
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
                            list={list}
                            setList={(myList) => setList(myList)}
                            animation={200}
                            delay={1}
                            ghostClass="gu-transit"
                            group="shared"
                            onAdd={(evt) => transferToAnotherList(evt.item.textContent)}
                        >
                            {list.length ? (
                                list
                                    .filter((item) => item.startsWith(filter))
                                    .map((skill: any, id: number) => (
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
        </div>
    );
};
