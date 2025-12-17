import { EmailExistsRepository} from "@/domain/usecases/login/exists-email";
import { InvalidCredentialsError, UnexpectedError } from "@/domain/errors";
import { HttpClient, HttpStatusCode } from "../../protocols/http/http-client";
import { InvalidEmailError } from "@/domain/errors/invalid-email-error";
import { BlockedTokenError } from "@/domain/errors/blocked-token-error";
import { UserAlreadyLoggedError } from "@/domain/errors/user-already-logged-error";

export class RemoteEmailExists implements EmailExistsRepository {
    constructor(private readonly url: string, private readonly httpClient: HttpClient<EmailExistsRepository.Model>) {}

    async email(params: EmailExistsRepository.Params): Promise<EmailExistsRepository.Model> {
        const httpResponse = await this.httpClient.request({
            url: this.url,
            method: 'head',
            body: params
        });
        switch (httpResponse.statusCode) {
            case HttpStatusCode.ok:
                return { status: HttpStatusCode.ok, data: httpResponse.body };
            case HttpStatusCode.created:
                return { status: HttpStatusCode.created, data: httpResponse.body };
            case HttpStatusCode.accepted:
                return { status: HttpStatusCode.accepted, data: httpResponse.body };
            case HttpStatusCode.notFound:
                return { status: HttpStatusCode.notFound, data: httpResponse.body };
            case HttpStatusCode.passwordError:
                return { status: HttpStatusCode.passwordError, data: httpResponse.body };
            case HttpStatusCode.unauthorized:
                throw new InvalidCredentialsError();
            // case HttpStatusCode.lockedPassword:
            //      new InvalidCredentialsError();
                case HttpStatusCode.badRequest:
                    throw new InvalidEmailError();
                case HttpStatusCode.forbidden:
                    throw new BlockedTokenError();
                case HttpStatusCode.conflict:
                    throw new UserAlreadyLoggedError();
            default:
                throw new UnexpectedError();
        }
    }
}
