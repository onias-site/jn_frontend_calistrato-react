
import { HttpClient, HttpStatusCode } from '@/data/protocols/http/http-client'
import { EmailInUseError, UnexpectedError } from '@/domain/errors'
import { AddVagas } from '@/domain/usecases/vagas/add-vagas'

export class RemoteAddVagas implements AddVagas {
  constructor (
    private readonly url: string,
    private readonly httpClient: HttpClient<RemoteAddVagas.Model>
  ) {}

  async add (params: AddVagas.Params): Promise<AddVagas.Model> {
    const httpResponse = await this.httpClient.request({
      url: this.url,
      method: 'post',
      body: params
    })

    if (httpResponse.body === undefined) {
        throw new UnexpectedError();
      }
    switch (httpResponse.statusCode) {
      case HttpStatusCode.created: return httpResponse.body
      case HttpStatusCode.forbidden: throw new EmailInUseError()
      default: throw new UnexpectedError()
    }
  }
}

export namespace RemoteAddVagas {
  export type Model = AddVagas.Model
}

