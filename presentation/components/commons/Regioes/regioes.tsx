import React from 'react';
import './regioes.css';
import { MultiSelect } from 'primereact/multiselect';
import RegioesStore, { IRegioesStore } from './regioes-store';

interface RegioesProps {


}
const RegioesComponent: React.FC<RegioesProps> = () => {
    const { regioesSelecionadas, setRegioesSelecionadas } = RegioesStore((state: IRegioesStore) => ({
        ...state,
    }));

    const estados = [
        {
            "id": "0",
            "nome": "Estou disponível para mudar de cidade e/ou UF",
            "selected": false
        },
        {
            "id": "10",
            "nome": "Avalia apenas homeoffice",
            "selected": false
        },
        {
            "id": "11",
            "nome": "São Paulo – SP",
            "selected": false
        },
        {
            "id": "12",
            "nome": "São José dos Campos – SP",
            "selected": false
        },
        {
            "id": "13",
            "nome": "Santos – SP",
            "selected": false
        },
        {
            "id": "14",
            "nome": "Bauru – SP",
            "selected": false
        },
        {
            "id": "15",
            "nome": "Sorocaba – SP",
            "selected": false
        },
        {
            "id": "16",
            "nome": "Ribeirão Preto – SP",
            "selected": false
        },
        {
            "id": "17",
            "nome": "São José do Rio Preto – SP",
            "selected": false
        },
        {
            "id": "18",
            "nome": "Presidente Prudente – SP",
            "selected": false
        },
        {
            "id": "19",
            "nome": "Campinas – SP",
            "selected": false
        },
        {
            "id": "21",
            "nome": "Rio de Janeiro – RJ",
            "selected": false
        },
        {
            "id": "22",
            "nome": "Campos dos Goytacazes – RJ",
            "selected": false
        },
        {
            "id": "24",
            "nome": "Volta Redonda – RJ",
            "selected": false
        },
        {
            "id": "27",
            "nome": "Vila Velha/Vitória – ES",
            "selected": false
        },
        {
            "id": "28",
            "nome": "Cachoeira de Itapemirim – ES",
            "selected": false
        },
        {
            "id": "31",
            "nome": "Belo Horizonte – MG",
            "selected": false
        },
        {
            "id": "32",
            "nome": "Juiz de Fora – MG",
            "selected": false
        },
        {
            "id": "33",
            "nome": "Governador Valadares – MG",
            "selected": false
        },
        {
            "id": "34",
            "nome": "Uberlândia – MG",
            "selected": false
        },
        {
            "id": "35",
            "nome": "Poços de Caldas – MG",
            "selected": false
        },
        {
            "id": "37",
            "nome": "Divinópolis – MG",
            "selected": false
        },
        {
            "id": "38",
            "nome": "Montes Claros – MG",
            "selected": false
        },
        {
            "id": "41",
            "nome": "Curitiba – PR",
            "selected": false
        },
        {
            "id": "42",
            "nome": "Ponta Grossa – PR",
            "selected": false
        },
        {
            "id": "43",
            "nome": "Londrina – PR",
            "selected": false
        },
        {
            "id": "44",
            "nome": "Maringá – PR",
            "selected": false
        },
        {
            "id": "45",
            "nome": "Foz do Iguaçú – PR",
            "selected": false
        },
        {
            "id": "46",
            "nome": "Francisco Beltrão/Pato Branco – PR",
            "selected": false
        },
        {
            "id": "47",
            "nome": "Joinville – SC",
            "selected": false
        },
        {
            "id": "48",
            "nome": "Florianópolis – SC",
            "selected": false
        },
        {
            "id": "49",
            "nome": "Chapecó – SC",
            "selected": false
        },
        {
            "id": "51",
            "nome": "Porto Alegre – RS",
            "selected": false
        },
        {
            "id": "53",
            "nome": "Pelotas – RS",
            "selected": false
        },
        {
            "id": "54",
            "nome": "Caxias do Sul – RS",
            "selected": false
        },
        {
            "id": "55",
            "nome": "Santa Maria – RS",
            "selected": false
        },
        {
            "id": "61",
            "nome": "Brasília – DF",
            "selected": false
        },
        {
            "id": "62",
            "nome": "Goiânia – GO",
            "selected": false
        },
        {
            "id": "63",
            "nome": "Palmas – TO",
            "selected": false
        },
        {
            "id": "64",
            "nome": "Rio Verde – GO",
            "selected": false
        },
        {
            "id": "65",
            "nome": "Cuiabá – MT",
            "selected": false
        },
        {
            "id": "66",
            "nome": "Rondonópolis – MT",
            "selected": false
        },
        {
            "id": "67",
            "nome": "Campo Grande – MS",
            "selected": false
        },
        {
            "id": "68",
            "nome": "Rio Branco – AC",
            "selected": false
        },
        {
            "id": "69",
            "nome": "Porto Velho – RO",
            "selected": false
        },
        {
            "id": "71",
            "nome": "Salvador – BA",
            "selected": false
        },
        {
            "id": "73",
            "nome": "Ilhéus – BA",
            "selected": false
        },
        {
            "id": "74",
            "nome": "Juazeiro – BA",
            "selected": false
        },
        {
            "id": "75",
            "nome": "Feira de Santana – BA",
            "selected": false
        },
        {
            "id": "77",
            "nome": "Barreiras – BA",
            "selected": false
        },
        {
            "id": "79",
            "nome": "Aracaju – SE",
            "selected": false
        },
        {
            "id": "81",
            "nome": "Recife – PE",
            "selected": false
        },
        {
            "id": "82",
            "nome": "Maceió – AL",
            "selected": false
        },
        {
            "id": "83",
            "nome": "João Pessoa – PB",
            "selected": false
        },
        {
            "id": "84",
            "nome": "Natal – RN",
            "selected": false
        },
        {
            "id": "85",
            "nome": "Fortaleza – CE",
            "selected": false
        },
        {
            "id": "86",
            "nome": "Teresina – PI",
            "selected": false
        },
        {
            "id": "87",
            "nome": "Petrolina – PE",
            "selected": false
        },
        {
            "id": "88",
            "nome": "Juazeiro do Norte – CE",
            "selected": false
        },
        {
            "id": "89",
            "nome": "Picos – PI",
            "selected": false
        },
        {
            "id": "91",
            "nome": "Belém – PA",
            "selected": false
        },
        {
            "id": "92",
            "nome": "Manaus – AM",
            "selected": false
        },
        {
            "id": "93",
            "nome": "Santarém – PA",
            "selected": false
        },
        {
            "id": "94",
            "nome": "Marabá – PA",
            "selected": false
        },
        {
            "id": "95",
            "nome": "Boa Vista – RR",
            "selected": false
        },
        {
            "id": "96",
            "nome": "Macapá – AP",
            "selected": false
        },
        {
            "id": "97",
            "nome": "Coari – AM",
            "selected": false
        },
        {
            "id": "98",
            "nome": "São Luís – MA",
            "selected": false
        },
        {
            "id": "99",
            "nome": "Imperatriz – MA",
            "selected": false
        }

    ];

    const todasAsRegioes = "0";
    const homeOffice = "10";

    const estaIncluindoTodasAsRegioes =  (e:any) => {
        const values = estados.map(est => est.id).filter(val => val != homeOffice);
        setRegioesSelecionadas(values);
    };

    const estaExcluindoTodasAsRegioes = (e:any) => {
        const values = [];
        setRegioesSelecionadas(values);
    };

    const estaExcluindoHomeOffice = (e:any) => {
        const values = [];
        setRegioesSelecionadas(values);

    };

    const estaIncluindoHomeOffice = (e:any) => {
        const values = [homeOffice];
        setRegioesSelecionadas(values);
    };

    const estaIncluindoQualquerOutraRegiao = (e:any) =>{
        const values = estados.map(est => est.id).filter(val => val != homeOffice).filter(val => val != todasAsRegioes);
        if(values.length > e.value.length){
            estaExcluindoQualquerOutraRegiao(e);
            return;
        }

        values.push(todasAsRegioes);
        setRegioesSelecionadas(values);

    };

    const estaExcluindoQualquerOutraRegiao = (e:any) =>{
        setRegioesSelecionadas(e.value.filter(val => val != homeOffice).filter(val => val != todasAsRegioes));
    };


    const eventosNoCliqueDeEscolherTodasAsRegioes = {};
    eventosNoCliqueDeEscolherTodasAsRegioes["true"] = estaIncluindoTodasAsRegioes;
    eventosNoCliqueDeEscolherTodasAsRegioes["false"] = estaExcluindoTodasAsRegioes;

    const eventosNoCliqueDeEscolherHomeOffice = {};
    eventosNoCliqueDeEscolherHomeOffice["true"] = estaIncluindoHomeOffice;
    eventosNoCliqueDeEscolherHomeOffice["false"] = estaExcluindoHomeOffice;


    const eventosAoEscolherHomeOfficeOuTodasAsRegioes = {};
    eventosAoEscolherHomeOfficeOuTodasAsRegioes[todasAsRegioes] =  eventosNoCliqueDeEscolherTodasAsRegioes;
    eventosAoEscolherHomeOfficeOuTodasAsRegioes[homeOffice] =  eventosNoCliqueDeEscolherHomeOffice;

    const eventosAoEscolherQualquerOutraRegiao = {};
    eventosAoEscolherQualquerOutraRegiao["false"] = estaExcluindoQualquerOutraRegiao;
    eventosAoEscolherQualquerOutraRegiao["true"] = estaIncluindoQualquerOutraRegiao;

    const selecionarRegioes =  e =>{
        const eventoEscolhido = eventosAoEscolherHomeOfficeOuTodasAsRegioes[e.selectedOption.id] || eventosAoEscolherQualquerOutraRegiao;
        const estaIncluindoRegiao = e.value.includes(e.selectedOption.id);
        const funcaoParaSerExecutada = eventoEscolhido[estaIncluindoRegiao];
        funcaoParaSerExecutada(e);
    }
    return (
        <div className="mb-5">
            <MultiSelect
                selectAll={false}
                style={{ borderStyle: 'solid', borderColor: 'black' }}
                value={regioesSelecionadas}
                onChange={selecionarRegioes}
                options={estados}
                selectedItemsLabel="{label} Regiões selecionadas"
                optionLabel="nome"
                optionValue="id"
                placeholder="Selecione as regiões desejadas para seu novo emprego"
                maxSelectedLabels={10}
                className="form-input"
            />
        </div>
    );
};
export default RegioesComponent;
