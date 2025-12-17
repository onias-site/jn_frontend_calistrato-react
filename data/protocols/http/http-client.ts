export type HttpRequest = {
  url: string
  method: HttpMethod
  body?: any
  headers?: any
}

export interface HttpClient<R = any> {
  request: (data: HttpRequest) => Promise<HttpResponse<R>>
}

export type HttpMethod = 'head' | 'post' | 'get' | 'patch' | 'delete'

export enum HttpStatusCode {
    ok = 200,
    created = 201,
    accepted = 202,
    badRequest = 400,
    unauthorized = 401,
    forbidden = 403,
    notFound = 404,
    conflict = 409,
    passwordError = 421,
    lockedPassword = 423,
    tokenLockedRecently = 429,
    serverError = 500
}


export type HttpResponse<T = any> = {
  statusCode: HttpStatusCode
  body?: T
}
