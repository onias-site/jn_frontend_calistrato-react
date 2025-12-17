export interface LogoutRepository {
    logout: (params: LogoutRepository.Params) => Promise<LogoutRepository.Model>
}

export namespace LogoutRepository {
  export type Params = {
    email: string
    signal?: AbortSignal;
  }

  export type Model = any
}
