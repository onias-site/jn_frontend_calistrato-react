
import { HttpClient, HttpStatusCode } from '@/data/protocols/http/http-client'
import { EmailInUseError, UnexpectedError } from '@/domain/errors'
import { AddCandidato } from '@/domain/usecases/candidato/add-candidato';

export class RemoteAddCandidato implements AddCandidato {
  constructor (
    private readonly url: string,
    private readonly httpClient: HttpClient<RemoteAddCandidato.Model>
  ) {}

  async add (params: AddCandidato.Params): Promise<AddCandidato.Model> {
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

export namespace RemoteAddCandidato {
  export type Model = AddCandidato.Model
}

