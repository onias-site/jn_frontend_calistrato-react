'use client';
import { dddRegions } from '@/presentation/components/regions/dddRegions';
import React from 'react';
import PubSub from 'pubsub-js';
import { create } from 'zustand';
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

export const RegioesStore = create<IRegioesStore>((set, get) => ({
    regioesSelecionadas: [],
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
    const estados = [
        { id: '0', nome: labelTodasAsRegioes },
        { id: '10', nome: labelHomeOffice },
        ...dddRegions.map((region) => ({ id: region.id, nome: labelOutrasRegioes + ' ' + region.nome })),
    ];

    const todasAsRegioes = '0';
    const homeOffice = '10';

    // Home office e regiões se excluem (o backend recusa os dois juntos). Quando a troca desfaz uma escolha anterior, a
    // tela avisa o que foi desmarcado: até 2026-10-15 a troca acontecia em silêncio (achado 28).
    const homeOfficeEstavaMarcado = regioesSelecionadas.includes(homeOffice);
    const avisarQueOHomeOfficeFoiDesmarcado = () => {
        if (!homeOfficeEstavaMarcado) {
            return;
        }
        PubSub.publish('showMessage', {
            summary: 'Home office desmarcado',
            detail: 'Ao escolher uma região, o home office foi desmarcado: os dois não podem ficar juntos.',
            severity: 'warn',
        });
    };
    const avisarQueAsRegioesForamDesmarcadas = () => {
        const regioesQueEstavamMarcadas = regioesSelecionadas.filter((val) => val != homeOffice && val != todasAsRegioes).length;
        if (!regioesQueEstavamMarcadas) {
            return;
        }
        const quaisRegioes = regioesQueEstavamMarcadas == 1 ? 'a região escolhida foi desmarcada' : `as ${regioesQueEstavamMarcadas} regiões escolhidas foram desmarcadas`;
        PubSub.publish('showMessage', {
            summary: 'Regiões desmarcadas',
            detail: `Home office não combina com regiões: ${quaisRegioes}.`,
            severity: 'warn',
        });
    };

    const estaIncluindoTodasAsRegioes = () => {
        const values = estados.map((est) => est.id).filter((val) => val != homeOffice);
        avisarQueOHomeOfficeFoiDesmarcado();
        setRegioesSelecionadas(values);
    };

    const estaExcluindoTodasAsRegioes = () => setRegioesSelecionadas([]);

    const estaExcluindoHomeOffice = () => setRegioesSelecionadas([]);

    const estaIncluindoHomeOffice = () => {
        avisarQueAsRegioesForamDesmarcadas();
        setRegioesSelecionadas([homeOffice]);
    };

    const estaExcluindoQualquerOutraRegiao = (novosValores: string[], regiaoClicada: string) => {
        // também é o caminho de quem marca uma região sem completar todas (estaIncluindoQualquerOutraRegiao)
        const estaIncluindoRegiao = novosValores.includes(regiaoClicada);
        estaIncluindoRegiao && avisarQueOHomeOfficeFoiDesmarcado();
        setRegioesSelecionadas(novosValores.filter((val) => val != homeOffice).filter((val) => val != todasAsRegioes));
    };

    const estaIncluindoQualquerOutraRegiao = (novosValores: string[], regiaoClicada: string) => {
        const values = estados
            .map((est) => est.id)
            .filter((val) => val != homeOffice)
            .filter((val) => val != todasAsRegioes);
        if (values.length > novosValores.length) {
            estaExcluindoQualquerOutraRegiao(novosValores, regiaoClicada);
            return;
        }
        // todas as regiões marcadas uma a uma: o "qualquer estado / cidade" acende junto
        values.push(todasAsRegioes);
        avisarQueOHomeOfficeFoiDesmarcado();
        setRegioesSelecionadas(values);
    };

    const selecionarRegioes = (novosValores: string[], regiaoClicada: string) => {
        const estaIncluindoRegiao = novosValores.includes(regiaoClicada);
        if (regiaoClicada == todasAsRegioes) {
            estaIncluindoRegiao ? estaIncluindoTodasAsRegioes() : estaExcluindoTodasAsRegioes();
            return;
        }
        if (regiaoClicada == homeOffice) {
            estaIncluindoRegiao ? estaIncluindoHomeOffice() : estaExcluindoHomeOffice();
            return;
        }
        estaIncluindoRegiao ? estaIncluindoQualquerOutraRegiao(novosValores, regiaoClicada) : estaExcluindoQualquerOutraRegiao(novosValores, regiaoClicada);
    };

    // o "qualquer estado / cidade" ('0') fica no valor só para marcar a opção: não é uma região e não entra na contagem
    const invalid = !regioesSelecionadas.length;
    return (
        <div className="mb-5">
            <label className="mb-1.5 block font-semibold text-dark dark:text-white-light">Onde aceito trabalhar</label>
            <SummaryMultiSelect
                id="regioes"
                data={estados.map((estado) => ({ value: estado.id, label: estado.nome }))}
                value={regioesSelecionadas}
                onChange={selecionarRegioes}
                placeholder="Selecione as regiões desejadas para seu novo emprego"
                searchPlaceholder="Digite a cidade ou o estado que você procura"
                nothingFoundMessage="Nenhuma região encontrada"
                summaryLabel={(count) => `${count} ${count == 1 ? 'região selecionada' : 'regiões selecionadas'}`}
                countValue={(value) => value != todasAsRegioes}
                maxDisplayedPills={2}
                error={invalid}
            />
        </div>
    );
};
export default RegioesComponent;
