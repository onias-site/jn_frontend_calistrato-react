'use client';
import { dddRegions } from '@/presentation/components/regions/dddRegions';
import React from 'react';
import { create } from 'zustand';
import { Checkbox } from '@mantine/core';
import { SummaryMultiSelect } from '@/presentation/components/source/SummaryMultiSelect';

export interface RegioesProps {
    labelHomeOffice: string;
    labelOutrasRegioes: string;
    labelTodasAsRegioes: string;
}
export interface IRegioesStore {
    regioesSelecionadas: any[];
    onMoveOnFowardTabs: () => string[];
    getPendingRequirements: () => string[];
    setRegioesSelecionadas: (regioesSelecionadas: any[]) => void;
    loadFromSavedResume: (resume: any) => void;
}

// regiões metropolitanas da lista, sem "qualquer estado / cidade" (0) e sem home office (10)
const totalDeRegioesMetropolitanas = 67;

// id da opção "aceito trabalhar em qualquer estado / cidade" e do home office
export const TODAS_AS_REGIOES = '0';
export const HOME_OFFICE = '10';

export const RegioesStore = create<IRegioesStore>((set, get) => ({
    // um currículo novo começa como home office (desde 2026-11-08); quem quer presencial desmarca e escolhe as regiões
    regioesSelecionadas: [HOME_OFFICE],
    // o backend grava os ddds como números e sem o "qualquer estado / cidade", que a tela marca de novo quando todas as
    // regiões metropolitanas estão escolhidas
    loadFromSavedResume: (resume: any) => {
        const regioes = (resume.ddd || []).map((ddd: any) => String(ddd));
        const todasAsRegioesMetropolitanas = regioes.length == totalDeRegioesMetropolitanas && !regioes.includes('10');
        set({ regioesSelecionadas: todasAsRegioesMetropolitanas ? [...regioes, '0'] : regioes });
    },
    onMoveOnFowardTabs: () => get().getPendingRequirements(),
    // mesma regra de ddd em VisEntityResume.Fields no backend: de 1 a 67 regiões; "qualquer estado / cidade" (0) não conta,
    // porque é só uma opção da tela que marca todas as outras
    getPendingRequirements: () => {
        const { regioesSelecionadas } = get();
        const regioes = regioesSelecionadas.filter((regiao: any) => regiao != '0');
        if (!regioes.length) {
            return ['Deve-se selecionar ao menos uma das regiões metropolitanas'];
        }
        if (regioes.length > 67) {
            return ['Deve-se selecionar no máximo 67 regiões metropolitanas'];
        }
        return [];
    },
    setRegioesSelecionadas: (regioesSelecionadas: any[]) => set({ regioesSelecionadas }),
}));

const RegioesComponent: React.FC<RegioesProps> = ({ labelTodasAsRegioes, labelOutrasRegioes, labelHomeOffice }) => {
    const { regioesSelecionadas, setRegioesSelecionadas } = RegioesStore((state: IRegioesStore) => ({
        ...state,
    }));
    const homeOffice = regioesSelecionadas.includes(HOME_OFFICE);

    // as regiões da lista (sem o home office, que virou o checkbox acima dela)
    const regioes = [{ id: TODAS_AS_REGIOES, nome: labelTodasAsRegioes }, ...dddRegions.map((region) => ({ id: region.id, nome: (labelOutrasRegioes ? labelOutrasRegioes + ' ' : '') + region.nome }))];
    const todasAsRegioesMetropolitanas = dddRegions.map((region) => region.id);

    // Home office e regiões se excluem (o backend recusa os dois juntos): o checkbox marcado deixa só o home office;
    // desmarcado, abre a lista de regiões vazia
    const alternarHomeOffice = (marcado: boolean) => setRegioesSelecionadas(marcado ? [HOME_OFFICE] : []);

    const selecionarRegioes = (novosValores: string[], regiaoClicada: string) => {
        const incluindo = novosValores.includes(regiaoClicada);
        if (regiaoClicada == TODAS_AS_REGIOES) {
            // "qualquer estado / cidade" marca (ou desmarca) todas as regiões de uma vez
            setRegioesSelecionadas(incluindo ? [TODAS_AS_REGIOES, ...todasAsRegioesMetropolitanas] : []);
            return;
        }
        const regioesEscolhidas = novosValores.filter((val) => val != TODAS_AS_REGIOES);
        // com todas as regiões marcadas uma a uma, o "qualquer estado / cidade" acende junto; ao desmarcar uma, apaga
        const todasMarcadas = regioesEscolhidas.length == todasAsRegioesMetropolitanas.length;
        setRegioesSelecionadas(todasMarcadas ? [TODAS_AS_REGIOES, ...regioesEscolhidas] : regioesEscolhidas);
    };

    const invalid = !homeOffice && !regioesSelecionadas.length;
    return (
        <div className="mb-5">
            <label className="mb-2 block font-semibold text-dark dark:text-white-light">Onde aceito trabalhar</label>
            <Checkbox className="mb-3" checked={homeOffice} onChange={(e) => alternarHomeOffice(e.currentTarget.checked)} label={labelHomeOffice} />
            {!homeOffice && (
                <SummaryMultiSelect
                    id="regioes"
                    data={regioes.map((regiao) => ({ value: regiao.id, label: regiao.nome }))}
                    value={regioesSelecionadas}
                    onChange={selecionarRegioes}
                    placeholder="Selecione as regiões onde aceita trabalhar presencialmente ou de forma híbrida"
                    searchPlaceholder="Digite a cidade ou o estado que você procura"
                    nothingFoundMessage="Nenhuma região encontrada"
                    summaryLabel={(count) => `${count} ${count == 1 ? 'região selecionada' : 'regiões selecionadas'}`}
                    countValue={(value) => value != TODAS_AS_REGIOES}
                    maxDisplayedPills={2}
                    error={invalid}
                />
            )}
        </div>
    );
};
export default RegioesComponent;
