

import { mockAccountModel } from '@/domain/test'
import { Authentication } from '@/domain/usecases/login/authentication'
import casual from 'casual'

export const mockAuthenticationParams = (): Authentication.Params => ({
  email: casual.email,
  password: casual.password
})

export const mockAuthenticationModel = (): Authentication.Model => mockAccountModel()

export class AuthenticationSpy implements Authentication {
  account = mockAuthenticationModel()
  params: Authentication.Params | undefined
  callsCount = 0

  async login (params: Authentication.Params): Promise<Authentication.Model> {
    this.params = params
    this.callsCount++
    return this.account
  }
}
