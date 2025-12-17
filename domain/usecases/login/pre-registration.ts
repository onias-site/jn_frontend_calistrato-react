export interface PreRegistrationRepository {
    registration: (params: PreRegistrationRepository.Params) => Promise<PreRegistrationRepository.Model>
}

export namespace PreRegistrationRepository {
  export type Params = {
    email: string | null
    goal: string
    channel: string
  }

  export type Model = any
}
