// store.ts
import create from 'zustand';

interface Estado {
  id: string;
  nome: string;
  selected: boolean;
}

interface StoreState {
  isRemoto: boolean;
  isHibrido: boolean;
  isPresencial: boolean;
  isPcd: boolean;
  isClt: boolean;
  isPj: boolean;
  isBtc: boolean;
  estadoSelecionadoId: string | undefined;
  estados: Estado[];
  toggleClt: () => void;
  togglePj: () => void;
  toggleBtc: () => void;
  togglePcd: () => void;
  toggleRemoto: () => void;
  toggleHibrido: () => void;
  togglePresencial: () => void;
  setRemoto: (value: boolean) => void;
  setHibrido: (value: boolean) => void;
  setPresencial: (value: boolean) => void;
  setClt: (value: boolean) => void;
  setPj: (value: boolean) => void;
  setBtc: (value: boolean) => void;
  setEstados: (estado: Estado[]) => void;
  setEstadoSelecionadoId: (id: string) => void;
  setStatus: (status: string) => void;
  status: string;
}

const useFiltroCandidatoStore = create<StoreState>((set, get) => ({
  isRemoto: true,
  isHibrido: false,
  isPresencial: false,
  isPcd: false,
  isClt: false,
  isPj: false,
  isBtc: false,
  estadoSelecionadoId: undefined,
  estados: [
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

],
  toggleClt: () => set({ isClt: !get().isClt, isPj: false, isBtc: false }),
  togglePj: () => set({ isPj: !get().isPj, isClt: false, isBtc: false }),
  toggleBtc: () => set({ isBtc: !get().isBtc, isClt: false, isPj: false }),
  togglePcd: () => set({ isPcd: !get().isPcd }),
  toggleRemoto: () => set({ isRemoto: !get().isRemoto, isHibrido: false, isPresencial: false }),
  toggleHibrido: () => set({ isHibrido: !get().isHibrido, isRemoto: false, isPresencial: false }),
  togglePresencial: () => set({ isPresencial: !get().isPresencial, isRemoto: false, isHibrido: false }),

  setRemoto: (value) => set({ isRemoto: value }),
  setHibrido: (value) => set({ isHibrido: value }),
  setPresencial: (value) => set({ isPresencial: value }),
  setClt: (value) => set({ isClt: value }),
  setPj: (value) => set({ isPj: value }),
  setBtc: (value) => set({ isBtc: value }),
  setEstados: (estados: Estado[]) => set({ estados }),
  setEstadoSelecionadoId: (id: string | undefined) => set((state) => ({
    estadoSelecionadoId: id,
    estados: state.estados.map(estado => ({
      ...estado,
      selected: estado.id === id
    }))
  })),
  status: '',
  setStatus: (status: string) => set({ status }),
}));

export default useFiltroCandidatoStore;

