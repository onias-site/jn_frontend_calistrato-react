import { Estados, ViewVagasModel } from "@/domain/models/view-vagas-model"


export interface AddCandidato {
  add: (params: AddCandidato.Params) => Promise<AddCandidato.Model>
}

export namespace AddCandidato {
  export type Params = {
    id: string,
    empresasExcluidas: string[],
    vagaExclusivaPCD: string | undefined,
    cargoRecenteAtual: string | undefined,
    cargoDesejado: string | undefined,
    experiencia: string | undefined,
    estadoSelecionadoId: string | undefined,
    sobremim: string | undefined,
    remoto: boolean,
    presencial: boolean,
    hibrido: boolean,
    pj: boolean,
    clt: boolean,
    btc: boolean,
    estados: Estados[],
    pcd: boolean,
    pagamentopj: string,
    pagamentoclt: string,
    pagamentobtc: string,
    pretensaoPJ: string,
    pretensaoCLT: string
  }

  export type Model = ViewVagasModel
}
