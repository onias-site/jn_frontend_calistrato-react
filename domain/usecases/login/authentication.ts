import { AccountModel } from "../../models";

export interface Authentication {
    login: (params: Authentication.Params) => Promise<Authentication.Model>
}

export namespace Authentication {
  export type Params = {
    password: string
  }

  export type Model = AccountModel
}
