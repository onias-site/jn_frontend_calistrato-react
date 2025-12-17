import { ViewCandidatoModel } from "@/domain/models/view-canditato-model"


export interface ViewCandidatos {
    findAll: () => Promise<ViewCandidatos.Model[]>
}

export namespace ViewCandidatos {
  export type Params = {
    id: string,
    sobreMim: string,
    empresasExcluidas: string,
    vagaExclusivaPCD: string,
    cargoRecenteAtual: string,
    cargoDesejado: string,
    experiencia: string,
    estadoSelecionadoId: string,
    pcd: string,
    clt: string,
    pj: string,
    btc: string,
    remoto: string,
    hibrido: string,
    presencial: string,
    pagamentopj: string,
    pagamentoclt: string,
    pagamentobtc: string,
    pretensaoPJ: string,
    pretensaoCLT: string,
  }

  export type Model = ViewCandidatoModel
}
