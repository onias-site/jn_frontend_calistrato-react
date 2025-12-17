import { InvalidCredentialsError, UnexpectedError } from '@/domain/errors';
import { HttpClient, HttpStatusCode } from '../../protocols/http/http-client';
import { ViewCandidatos } from '@/domain/usecases/candidato/view-candidato';


export class RemoteViewCandidatos implements ViewCandidatos {
    constructor(private readonly url: string, private readonly httpClient: HttpClient<ViewCandidatos.Model[]>) {}

    async findAll(): Promise<ViewCandidatos.Model[]> {
        const httpResponse = await this.httpClient.request({
            url: this.url,
            method: 'get',
        });
        const remoteCandidatos = httpResponse.body || [];
        switch (httpResponse.statusCode) {
            case HttpStatusCode.ok:
                return remoteCandidatos.map((remoteCandidato) => ({
                    ...remoteCandidato,
                }));
            case HttpStatusCode.unauthorized:
                throw new InvalidCredentialsError();
            default:
                throw new UnexpectedError();
        }
    }
}
