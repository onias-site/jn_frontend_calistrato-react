import { InvalidCredentialsError, UnexpectedError } from '@/domain/errors';
import { HttpClient, HttpStatusCode } from '../../protocols/http/http-client';
import { InativarVagas } from '@/domain/usecases/vagas/inativar-vagas';
import { InativarVagasModel } from '@/domain/models/inativar-vagas-model';



export class RemoteInativarVagas implements InativarVagas {
    constructor(private readonly url: string, private readonly httpClient: HttpClient<InativarVagasModel>) {}

    async inativarVaga(params: InativarVagas.Params): Promise<InativarVagasModel> {
        const httpResponse = await this.httpClient.request({
            url: this.url,
            method: 'patch',
            body: params
        });
        if (!httpResponse.body) {
            throw new UnexpectedError();
        }
        switch (httpResponse.statusCode) {
            case HttpStatusCode.ok: return httpResponse.body
            case HttpStatusCode.unauthorized:
                throw new InvalidCredentialsError();
            default:
                throw new UnexpectedError();
        }
    }
}
