import { makeLocalStorageAdapter } from '@/main/factories/cache'
import { AccountModel } from '@/domain/models'

export const setCurrentAccountAdapter = (account: AccountModel | null): void => {
  makeLocalStorageAdapter().set('account', account)
}

export const getCurrentAccountAdapter = (): AccountModel | null => {
  return makeLocalStorageAdapter().get('account')
}
