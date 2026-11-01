'use client';
import { dddRegions } from '@/presentation/components/regions/dddRegions';
import React from 'react';
import { MultiSelect } from 'primereact/multiselect';
import PubSub from 'pubsub-js';
import { create } from 'zustand';

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
        {
            id: '0',
            nome: labelTodasAsRegioes,
            selected: false,
        },
        {
            id: '10',
            nome: labelHomeOffice,
            selected: false,
        },
        ...dddRegions.map((region) => ({ ...region, selected: false })),
    ];
    estados.forEach((x) => {
        if (x.id < 11) {
            return;
        }
        x.nome = labelOutrasRegioes + ' ' + x.nome;
    });

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

    const estaIncluindoTodasAsRegioes = (e: any) => {
        const values = estados.map((est) => est.id).filter((val) => val != homeOffice);
        avisarQueOHomeOfficeFoiDesmarcado();
        setRegioesSelecionadas(values);
    };

    const estaExcluindoTodasAsRegioes = (e: any) => {
        const values = [];
        setRegioesSelecionadas(values);
    };

    const estaExcluindoHomeOffice = (e: any) => {
        const values = [];
        setRegioesSelecionadas(values);
    };

    const estaIncluindoHomeOffice = (e: any) => {
        const values = [homeOffice];
        avisarQueAsRegioesForamDesmarcadas();
        setRegioesSelecionadas(values);
    };

    const estaIncluindoQualquerOutraRegiao = (e: any) => {
        const values = estados
            .map((est) => est.id)
            .filter((val) => val != homeOffice)
            .filter((val) => val != todasAsRegioes);
        if (values.length > e.value.length) {
            estaExcluindoQualquerOutraRegiao(e);
            return;
        }

        values.push(todasAsRegioes);
        avisarQueOHomeOfficeFoiDesmarcado();
        setRegioesSelecionadas(values);
    };

    const estaExcluindoQualquerOutraRegiao = (e: any) => {
        // também é o caminho de quem marca uma região sem completar todas (estaIncluindoQualquerOutraRegiao)
        const estaIncluindoRegiao = e.value.includes(e.selectedOption.id);
        estaIncluindoRegiao && avisarQueOHomeOfficeFoiDesmarcado();
        setRegioesSelecionadas(e.value.filter((val) => val != homeOffice).filter((val) => val != todasAsRegioes));
    };

    const eventosNoCliqueDeEscolherTodasAsRegioes = {};
    eventosNoCliqueDeEscolherTodasAsRegioes['true'] = estaIncluindoTodasAsRegioes;
    eventosNoCliqueDeEscolherTodasAsRegioes['false'] = estaExcluindoTodasAsRegioes;

    const eventosNoCliqueDeEscolherHomeOffice = {};
    eventosNoCliqueDeEscolherHomeOffice['true'] = estaIncluindoHomeOffice;
    eventosNoCliqueDeEscolherHomeOffice['false'] = estaExcluindoHomeOffice;

    const eventosAoEscolherHomeOfficeOuTodasAsRegioes = {};
    eventosAoEscolherHomeOfficeOuTodasAsRegioes[todasAsRegioes] = eventosNoCliqueDeEscolherTodasAsRegioes;
    eventosAoEscolherHomeOfficeOuTodasAsRegioes[homeOffice] = eventosNoCliqueDeEscolherHomeOffice;

    const eventosAoEscolherQualquerOutraRegiao = {};
    eventosAoEscolherQualquerOutraRegiao['false'] = estaExcluindoQualquerOutraRegiao;
    eventosAoEscolherQualquerOutraRegiao['true'] = estaIncluindoQualquerOutraRegiao;

    const selecionarRegioes = (e) => {
        const eventoEscolhido = eventosAoEscolherHomeOfficeOuTodasAsRegioes[e.selectedOption.id] || eventosAoEscolherQualquerOutraRegiao;
        const estaIncluindoRegiao = e.value.includes(e.selectedOption.id);
        const funcaoParaSerExecutada = eventoEscolhido[estaIncluindoRegiao];
        funcaoParaSerExecutada(e);
    };
    // o "qualquer estado / cidade" ('0') fica no valor só para marcar a opção: não é uma região. O PrimeReact troca o
    // "{...}" do rótulo pelo tamanho do valor, então a contagem vai pronta (até 2026-10-14 mostrava 68 regiões)
    const totalDeRegioesSelecionadas = regioesSelecionadas.filter((regiao: any) => regiao != todasAsRegioes).length;
    const borderColor = regioesSelecionadas.length ? 'black' : '#e24c4c';
    const borderStyle = 'solid';
    const borderProperties = { borderStyle, borderColor };
    return (
        <div className="mb-5">
            <MultiSelect
                placeholder="Selecione as regiões desejadas para seu novo emprego"
                selectedItemsLabel={`${totalDeRegioesSelecionadas} Regiões selecionadas`}
                style={{...borderProperties}}
                onChange={selecionarRegioes}
                value={regioesSelecionadas}
                maxSelectedLabels={10}
                className="form-input"
                optionLabel="nome"
                selectAll={false}
                options={estados}
                optionValue="id"
            />
        </div>
    );
};
export default RegioesComponent;
