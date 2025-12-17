

import { HttpClient, HttpStatusCode } from '@/data/protocols/http/http-client'
import { AccessDeniedError, UnexpectedError } from '@/domain/errors'
import { ViewVagasModel } from '@/domain/models/view-vagas-model'
import { EditVagas } from '@/domain/usecases/vagas/edit-vagas'

export class RemoteEditVagas implements EditVagas {
  constructor (
    private readonly url: string,
    private readonly httpClient: HttpClient<RemoteEditVagas.Model>
  ) {}

  async edit (params: EditVagas.Params): Promise<EditVagas.Model> {
    const httpResponse = await this.httpClient.request({
      url: this.url,
      method: 'patch',
      body: params
    })
    const remoteEditVagas = httpResponse.body



    switch (httpResponse.statusCode) {
      case HttpStatusCode.ok: return { ...remoteEditVagas, message: 'Dados atualizados com sucesso' }
      case HttpStatusCode.forbidden: throw new AccessDeniedError()
      default: throw new UnexpectedError()
    }
  }
}

export namespace RemoteEditVagas {
  export type Model = ViewVagasModel
}
