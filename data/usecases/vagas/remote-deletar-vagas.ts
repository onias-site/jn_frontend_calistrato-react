import { InvalidCredentialsError, UnexpectedError } from '@/domain/errors';
import { HttpClient, HttpStatusCode } from '../../protocols/http/http-client';
import { DeleteVagas } from '@/domain/usecases/vagas/deletar-vagas';

export class RemoteDeleteVagas implements DeleteVagas {
    constructor(private readonly url: string, private readonly httpClient: HttpClient<DeleteVagas.Model[]>) {}

    async deleteVaga(params: DeleteVagas.Params): Promise<DeleteVagas.Model> {
        const httpResponse = await this.httpClient.request({
            url: this.url,
            method: 'delete',
            body: params
        });
        switch (httpResponse.statusCode) {
            case HttpStatusCode.ok: return httpResponse.body
            case HttpStatusCode.unauthorized:
                throw new InvalidCredentialsError();
            default:
                throw new UnexpectedError();
        }
    }
}
