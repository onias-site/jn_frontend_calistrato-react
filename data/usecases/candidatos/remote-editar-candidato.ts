

import { HttpClient, HttpStatusCode } from '@/data/protocols/http/http-client'
import { AccessDeniedError, UnexpectedError } from '@/domain/errors'
import { ViewCandidatoModel } from '@/domain/models/view-canditato-model'
import { EditCandidato } from '@/domain/usecases/candidato/edit-canditato'

export class RemoteEditCandidato implements EditCandidato {
  constructor (
    private readonly url: string,
    private readonly httpClient: HttpClient<RemoteEditCandidato.Model>
  ) {}

  async edit (params: EditCandidato.Params): Promise<EditCandidato.Model> {
    const httpResponse = await this.httpClient.request({
      url: this.url,
      method: 'patch',
      body: params
    })
    const remoteEditCandidato = httpResponse.body



    switch (httpResponse.statusCode) {
      case HttpStatusCode.ok: return { ...remoteEditCandidato, message: 'Dados atualizados com sucesso' }
      case HttpStatusCode.forbidden: throw new AccessDeniedError()
      default: throw new UnexpectedError()
    }
  }
}

export namespace RemoteEditCandidato {
  export type Model = ViewCandidatoModel
}
