export interface TokenLanguageRepository {
    tokenLanguage: (params: TokenLanguageRepository.Params) => Promise<TokenLanguageRepository.Model>
}

export namespace TokenLanguageRepository {
  export type Params = {
    email: string | null
    language: string;
    signal?: AbortSignal;
  }

  export type Model = any
}
