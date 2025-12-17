import { ViewCandidatoModel } from "@/domain/models/view-canditato-model"
import { Estados} from "@/domain/models/view-vagas-model"


export interface EditCandidato {
  edit: (params: EditCandidato.Params) => Promise<EditCandidato.Model>
}

export namespace EditCandidato {
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

  export type Model = ViewCandidatoModel
}


