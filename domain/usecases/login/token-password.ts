import { AccountModel } from "../../models/account-model"
export interface TokenPasswordRepository {
    tokenPassword: (params: TokenPasswordRepository.Params) => Promise<TokenPasswordRepository.Model>
}

export namespace TokenPasswordRepository {
  export type Params = {
    email: string
    token: string
    password: string
    confirmPassword: string
  }

  export type Model = any
}
