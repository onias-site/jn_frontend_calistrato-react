import {  LogoutRepository } from "@/domain/usecases/login/logout";
import { UnexpectedError } from "@/domain/errors";
import { HttpClient, HttpStatusCode } from "../../protocols/http/http-client";

export class RemoteLogout implements LogoutRepository {
    constructor(private readonly url: string, private readonly httpClient: HttpClient<LogoutRepository.Model>) {}

    async logout(params: LogoutRepository.Params): Promise<LogoutRepository.Model> {
        const account: string = localStorage.getItem('account');
        const json = JSON.parse(account);

        const httpResponse = await this.httpClient.request({
            url: this.url + '/'+ json.sessionToken,
            method: 'delete',
        });
        switch (httpResponse.statusCode) {
            case HttpStatusCode.ok:
                return { status: httpResponse.statusCode };
            default:
                throw new UnexpectedError();
        }
    }
}
