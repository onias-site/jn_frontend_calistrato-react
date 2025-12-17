import { InativarVagasModel } from "@/domain/models/inativar-vagas-model"



export interface InativarVagas {
    inativarVaga: (params: InativarVagas.Params) => Promise<InativarVagas.Model>
}

export namespace InativarVagas {
  export type Params = {
    idVaga: string
  }

  export type Model = InativarVagasModel
}
