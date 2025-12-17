import { HttpClient, HttpStatusCode } from '../../protocols/http/http-client';
import { BlockedTokenError, InvalidEmailError, UnexpectedError, UserAlreadyLoggedError } from "@/domain/errors";
import { MissingEmailError } from '@/domain/errors/missing-email-error';
import { PasswordLockedRecentlyError } from '@/domain/errors/password-locked-recently-error';
import { WrongPasswordError } from '@/domain/errors/wrong-password-error';
import { Authentication } from "@/domain/usecases/login/authentication";


export class RemoteAuthentication implements Authentication {
    constructor(private readonly url: string,private readonly httpClient: HttpClient<Authentication.Model>) {}


    async login(params: Authentication.Params):Promise<Authentication.Model> {
        const httpResponse = await this.httpClient.request({
            url: this.url,
            method: 'post',
            body: params
        })
        switch (httpResponse.statusCode) {
            case HttpStatusCode.ok:
                return { status: httpResponse.statusCode, data: httpResponse.body };
            // case HttpStatusCode.passwordError:
            //     return { status: httpResponse.statusCode, data: httpResponse.body };
                case HttpStatusCode.passwordError:
                    throw new WrongPasswordError();
                case HttpStatusCode.badRequest:
                    throw new InvalidEmailError();
                case HttpStatusCode.forbidden:
                    throw new BlockedTokenError();
                case HttpStatusCode.notFound:
                    throw new MissingEmailError();
                case HttpStatusCode.lockedPassword:
                    throw new PasswordLockedRecentlyError();
                case HttpStatusCode.conflict:
                    throw new UserAlreadyLoggedError();
                // case HttpStatusCode.tokenLockedRecently:
                //     throw new PasswordLockedRecentlyError();

                    default:
                throw new UnexpectedError();
        }
    }

}


export namespace RemoteAuthentication {
    export type Model = Authentication.Model
}


