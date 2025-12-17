import { InvalidCredentialsError, UnexpectedError } from '@/domain/errors';
import { HttpClient, HttpStatusCode } from '../../protocols/http/http-client';
import { ViewVagas } from '@/domain/usecases/vagas/view-vagas';
import { ViewVagasModel } from '@/domain/models/view-vagas-model';

export class RemoteViewVagas implements ViewVagas {
    constructor(private readonly url: string, private readonly httpClient: HttpClient<ViewVagasModel[]>) {}

    async findAll(): Promise<ViewVagasModel[]> {

       if(!this.url){
        return [];
       }
        const httpResponse = await this.httpClient.request({
            url: this.url,
            method: 'get',
        });
        const remoteVagas = httpResponse.body || [];
        switch (httpResponse.statusCode) {
            case HttpStatusCode.ok:
                return remoteVagas.map((remoteVaga) => ({
                    ...remoteVaga,
                }));
            case HttpStatusCode.unauthorized:
                throw new InvalidCredentialsError();
            default:
                throw new UnexpectedError();
        }
    }
}
