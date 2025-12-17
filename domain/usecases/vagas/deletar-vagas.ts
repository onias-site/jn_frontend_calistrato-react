import { InativarVagasModel } from "@/domain/models/inativar-vagas-model"


export interface DeleteVagas {
    deleteVaga: (params: DeleteVagas.Params) => Promise<DeleteVagas.Model>
}

export namespace DeleteVagas {
  export type Params = {
    idVaga: string
  }

  export type Model = InativarVagasModel
}
