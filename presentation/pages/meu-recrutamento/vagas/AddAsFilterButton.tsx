'use client';
import React from 'react';
import { ActionIcon } from '@mantine/core';
import { notify } from '@/presentation/components/source/notify';
import IconPlusCircle from '@/presentation/icons/icon-plus-circle';
import { ITabSkillStore, SkillStore, getImplicitSkills } from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/tabs/TabSkills/TabSkills';
import { REQUIRED_SKILLS, REQUIRED_SKILLS_MAX, toSkillListItem } from './positionsData';

type AddAsFilterButtonProps = {
    store: SkillStore;
    // a especificação do termo abrangente
    skill: string;
};

/**
 * O "+" ao lado de cada especificação de uma ferramenta abrangente (desde 2026-11-22): acrescenta a habilidade às
 * obrigatórias da vaga, que são o filtro de habilidades da contagem de currículos. Já obrigatória, o botão fica desligado;
 * se estiver entre as desejáveis, passa para as obrigatórias.
 */
export const AddAsFilterButton = ({ store, skill }: AddAsFilterButtonProps) => {
    const groups: any[] = store((state: ITabSkillStore) => state.groups);
    const required = groups.find((group) => group.name == REQUIRED_SKILLS);
    const alreadyAFilter = !!required && (required.list || []).some((item: any) => item.skill == skill);
    const title = alreadyAFilter ? 'Já está entre as habilidades obrigatórias' : 'Acrescentar como filtro';

    const addAsFilter = () => {
        if (!required || alreadyAFilter) return;
        if ((required.list || []).length >= REQUIRED_SKILLS_MAX) {
            notify({ summary: 'Limite de habilidades', detail: `A vaga aceita no máximo ${REQUIRED_SKILLS_MAX} habilidades obrigatórias. Retire uma para acrescentar ${skill}.`, severity: 'warn' });
            return;
        }
        // a mesma habilidade numa lista só: se estiver entre as desejáveis, sai de lá
        const desired = groups.filter((group) => group.name != REQUIRED_SKILLS);
        const found = desired.flatMap((group) => group.list || []).find((item: any) => item.skill == skill);
        desired.forEach((group) => (group.list = (group.list || []).filter((item: any) => item.skill != skill)));
        required.list = [...(required.list || []), found || toSkillListItem({ skill, word: skill, parent: [] })];
        store.getState().setGroups(groups, getImplicitSkills);
        notify({ summary: 'Filtro acrescentado', detail: `${skill} foi acrescentada às habilidades obrigatórias da vaga.` });
    };

    return (
        <ActionIcon variant="subtle" color="primary" radius="xl" size="sm" title={title} aria-label={title} disabled={alreadyAFilter} onClick={addAsFilter}>
            <IconPlusCircle className="h-4 w-4" />
        </ActionIcon>
    );
};
