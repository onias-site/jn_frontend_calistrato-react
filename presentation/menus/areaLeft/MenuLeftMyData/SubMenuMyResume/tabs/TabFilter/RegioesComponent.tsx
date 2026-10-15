'use client';
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
        {
            id: '11',
            nome: 'São Paulo – SP',
            selected: false,
        },
        {
            id: '12',
            nome: 'São José dos Campos – SP',
            selected: false,
        },
        {
            id: '13',
            nome: 'Santos – SP',
            selected: false,
        },
        {
            id: '14',
            nome: 'Bauru – SP',
            selected: false,
        },
        {
            id: '15',
            nome: 'Sorocaba – SP',
            selected: false,
        },
        {
            id: '16',
            nome: 'Ribeirão Preto – SP',
            selected: false,
        },
        {
            id: '17',
            nome: 'São José do Rio Preto – SP',
            selected: false,
        },
        {
            id: '18',
            nome: 'Presidente Prudente – SP',
            selected: false,
        },
        {
            id: '19',
            nome: 'Campinas – SP',
            selected: false,
        },
        {
            id: '21',
            nome: 'Rio de Janeiro – RJ',
            selected: false,
        },
        {
            id: '22',
            nome: 'Campos dos Goytacazes – RJ',
            selected: false,
        },
        {
            id: '24',
            nome: 'Volta Redonda – RJ',
            selected: false,
        },
        {
            id: '27',
            nome: 'Vila Velha/Vitória – ES',
            selected: false,
        },
        {
            id: '28',
            nome: 'Cachoeira de Itapemirim – ES',
            selected: false,
        },
        {
            id: '31',
            nome: 'Belo Horizonte – MG',
            selected: false,
        },
        {
            id: '32',
            nome: 'Juiz de Fora – MG',
            selected: false,
        },
        {
            id: '33',
            nome: 'Governador Valadares – MG',
            selected: false,
        },
        {
            id: '34',
            nome: 'Uberlândia – MG',
            selected: false,
        },
        {
            id: '35',
            nome: 'Poços de Caldas – MG',
            selected: false,
        },
        {
            id: '37',
            nome: 'Divinópolis – MG',
            selected: false,
        },
        {
            id: '38',
            nome: 'Montes Claros – MG',
            selected: false,
        },
        {
            id: '41',
            nome: 'Curitiba – PR',
            selected: false,
        },
        {
            id: '42',
            nome: 'Ponta Grossa – PR',
            selected: false,
        },
        {
            id: '43',
            nome: 'Londrina – PR',
            selected: false,
        },
        {
            id: '44',
            nome: 'Maringá – PR',
            selected: false,
        },
        {
            id: '45',
            nome: 'Foz do Iguaçú – PR',
            selected: false,
        },
        {
            id: '46',
            nome: 'Francisco Beltrão/Pato Branco – PR',
            selected: false,
        },
        {
            id: '47',
            nome: 'Joinville – SC',
            selected: false,
        },
        {
            id: '48',
            nome: 'Florianópolis – SC',
            selected: false,
        },
        {
            id: '49',
            nome: 'Chapecó – SC',
            selected: false,
        },
        {
            id: '51',
            nome: 'Porto Alegre – RS',
            selected: false,
        },
        {
            id: '53',
            nome: 'Pelotas – RS',
            selected: false,
        },
        {
            id: '54',
            nome: 'Caxias do Sul – RS',
            selected: false,
        },
        {
            id: '55',
            nome: 'Santa Maria – RS',
            selected: false,
        },
        {
            id: '61',
            nome: 'Brasília – DF',
            selected: false,
        },
        {
            id: '62',
            nome: 'Goiânia – GO',
            selected: false,
        },
        {
            id: '63',
            nome: 'Palmas – TO',
            selected: false,
        },
        {
            id: '64',
            nome: 'Rio Verde – GO',
            selected: false,
        },
        {
            id: '65',
            nome: 'Cuiabá – MT',
            selected: false,
        },
        {
            id: '66',
            nome: 'Rondonópolis – MT',
            selected: false,
        },
        {
            id: '67',
            nome: 'Campo Grande – MS',
            selected: false,
        },
        {
            id: '68',
            nome: 'Rio Branco – AC',
            selected: false,
        },
        {
            id: '69',
            nome: 'Porto Velho – RO',
            selected: false,
        },
        {
            id: '71',
            nome: 'Salvador – BA',
            selected: false,
        },
        {
            id: '73',
            nome: 'Ilhéus – BA',
            selected: false,
        },
        {
            id: '74',
            nome: 'Juazeiro – BA',
            selected: false,
        },
        {
            id: '75',
            nome: 'Feira de Santana – BA',
            selected: false,
        },
        {
            id: '77',
            nome: 'Barreiras – BA',
            selected: false,
        },
        {
            id: '79',
            nome: 'Aracaju – SE',
            selected: false,
        },
        {
            id: '81',
            nome: 'Recife – PE',
            selected: false,
        },
        {
            id: '82',
            nome: 'Maceió – AL',
            selected: false,
        },
        {
            id: '83',
            nome: 'João Pessoa – PB',
            selected: false,
        },
        {
            id: '84',
            nome: 'Natal – RN',
            selected: false,
        },
        {
            id: '85',
            nome: 'Fortaleza – CE',
            selected: false,
        },
        {
            id: '86',
            nome: 'Teresina – PI',
            selected: false,
        },
        {
            id: '87',
            nome: 'Petrolina – PE',
            selected: false,
        },
        {
            id: '88',
            nome: 'Juazeiro do Norte – CE',
            selected: false,
        },
        {
            id: '89',
            nome: 'Picos – PI',
            selected: false,
        },
        {
            id: '91',
            nome: 'Belém – PA',
            selected: false,
        },
        {
            id: '92',
            nome: 'Manaus – AM',
            selected: false,
        },
        {
            id: '93',
            nome: 'Santarém – PA',
            selected: false,
        },
        {
            id: '94',
            nome: 'Marabá – PA',
            selected: false,
        },
        {
            id: '95',
            nome: 'Boa Vista – RR',
            selected: false,
        },
        {
            id: '96',
            nome: 'Macapá – AP',
            selected: false,
        },
        {
            id: '97',
            nome: 'Coari – AM',
            selected: false,
        },
        {
            id: '98',
            nome: 'São Luís – MA',
            selected: false,
        },
        {
            id: '99',
            nome: 'Imperatriz – MA',
            selected: false,
        },
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
