export interface Sortable {
    id: number;
    text: string;
    chosen: boolean;
    selected: boolean;
}

export interface Estados {
    id: string;
    nome: string;
    selected: boolean;
}



export type ViewVagasModel = {
    id: string,
    status: string,
    vaga: string,
    descricao: string,
    remoto: boolean,
    presencial: boolean,
    hibrido: boolean,
    pj: boolean,
    clt: boolean,
    btc: boolean,
    sortable: Sortable[],
    datelimite: string,
    obrigatorios: string[],
    desejaveis: string[],
    estados: Estados[],
    pcd: boolean,
    pagamentopj: string,
    pagamentoclt: string,
    pagamentobtc: string
}

