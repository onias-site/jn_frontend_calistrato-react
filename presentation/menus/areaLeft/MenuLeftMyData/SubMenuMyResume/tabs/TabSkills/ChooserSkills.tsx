'use client'

import { ReactSortable } from 'react-sortablejs';
import React from 'react';

interface SkillsComponentProps {
    moveBetweenLists: (item: any) => void;
    setSkills: (skills: any[]) => void;
    totalItems: number;
    skills: any[];
    title: string;
}

const SkillsComponent: React.FC<SkillsComponentProps> = ({totalItems, skills, title, setSkills, moveBetweenLists }) => {
   const width = totalItems ? (100 / totalItems) + '%' : '';
    console.log('width', width);
    return (
        <div  style={{ width, padding: "10px"}}>
            <div className="mb-5" style={{fontSize:"10px"}}>{title}</div>
            <div className="panel mb-3" style={{ maxHeight: '400px', overflow: 'auto', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)' }}>
                <div className="gap-x-12 sm:grid-cols-2">
                    <ul>
                        <SkillsGroupComponent skills={skills} setSkills={setSkills} moveBetweenLists={moveBetweenLists} />
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
        <li key={id} className="mb-2.5 cursor-grab">
            <div className="items-md-center flex flex-col rounded-md border border-white-light bg-white px-6 py-3.5 text-center dark:border-dark dark:bg-[#1b2e4b] md:flex-row ltr:md:text-left rtl:md:text-right">
                <div className="flex flex-1 flex-col items-center justify-between md:flex-row">
                    <div className="my-3 font-semibold md:my-0">
                        <div className="text-base text-dark dark:text-[#bfc9d4]">{skill}</div>
                    </div>
                </div>
            </div>
        </li>
    );
};

interface SkillsGroupComponentProps {
    moveBetweenLists: (item: any) => void;
    setSkills: (skills: any[]) => void;
    skills: any[];
}

const SkillsGroupComponent: React.FC<SkillsGroupComponentProps> = ({ skills, setSkills, moveBetweenLists }) => {
    if (skills.length) {
        return (
            <ReactSortable list={skills} setList={setSkills} animation={200} delay={1} ghostClass="gu-transit" group="shared" onAdd={(evt) => moveBetweenLists(evt.item)}>
                {skills.map((skill, id) => (
                    <SkillComponent id={id} skill={skill} key = {id}/>
                ))}
            </ReactSortable>
        );
    }
    return (
        <ReactSortable list={skills} setList={setSkills} animation={200} delay={1} ghostClass="gu-transit" group="shared" onAdd={(evt) => moveBetweenLists(evt.item)}>
            <li className="mb-2.5 cursor-grab" >
                <div className="flex items-center justify-center md:flex-row">
                    <div className="my-3 font-semibold md:my-0">
                        <div className="text-base text-dark dark:text-[#bfc9d4] ">Arraste e solte aqui para adicionar.</div>
                    </div>
                </div>
            </li>
        </ReactSortable>
    );
};

export class SkillGroup {
    skills: any[] = [];
    title: string = '';
    name: string = '';
    constructor(){

    }
}

export interface ChooserSkillsProps {
    skillsGroups: SkillGroup[];
}

export const ChooserSkills: React.FC<ChooserSkillsProps> = ({ skillsGroups }) => {
    const moveBetweenLists = (listName: string, item: any) => {
        for (let index in skillsGroups) {
            const skillsGroup = skillsGroups[index];

            if (skillsGroup.name == listName) {
                skillsGroup.skills = [...skillsGroup.skills, item];
                continue;
            }

            skillsGroup.skills = skillsGroup.skills.filter((x) => x != item);
        }
    };

    return (
        <div className="flex-column flex" style={{ maxHeight: '1000px'}}>
            {skillsGroups.map((skillsGroup, index) => (
                <SkillsComponent
                    key = {index}
                    title={skillsGroup.title}
                    skills={skillsGroup.skills}
                    totalItems = {skillsGroups.length}
                    setSkills={(skills: any[]) => (skillsGroup.skills = skills)}
                    moveBetweenLists={(item: any) => moveBetweenLists(skillsGroup.name, item)}
                />
            ))}
        </div>
    );
};
