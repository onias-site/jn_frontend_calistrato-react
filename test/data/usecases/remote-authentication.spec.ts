import { InvalidCredentialsError, UnexpectedError } from '@/domain/errors'


import casual from 'casual'
import { HttpClientSpy } from '../mocks'
import { RemoteAuthentication } from '@/data/usecases/login/remote-authentication'
import { HttpStatusCode } from '@/data/protocols/http/http-client'
import { mockAuthenticationModel, mockAuthenticationParams } from '@/test/domain/mocks/mock-authentication'

type SutTypes = {
  sut: RemoteAuthentication
  httpClientSpy: HttpClientSpy<RemoteAuthentication.Model>
}

const makeSut = (url: string = casual.url): SutTypes => {
  const httpClientSpy = new HttpClientSpy<RemoteAuthentication.Model>()
  const sut = new RemoteAuthentication(url, httpClientSpy)
  return {
    sut,
    httpClientSpy
  }
}

describe('RemoteAuthentication', () => {
  test('Deve chamar HttpClient com valores corretos', async () => {
    const url = casual.url
    const { sut, httpClientSpy } = makeSut(url)
    const authenticationParams = mockAuthenticationParams()

    await sut.login(authenticationParams)

    expect(httpClientSpy.url).toBe(url)
    expect(httpClientSpy.method).toBe('post')
    expect(httpClientSpy.body).toEqual(authenticationParams)
  })

  test('Deve lançar InvalidCredentialsError se HttpClient retornar 401', async () => {
    const { sut, httpClientSpy } = makeSut()
    httpClientSpy.response = {
      statusCode: HttpStatusCode.unauthorized
    }

    const promise = sut.login(mockAuthenticationParams())

    await expect(promise).rejects.toThrow(new InvalidCredentialsError())
  })

  test('Deve lançar UnexpectedError se HttpClient retornar 400', async () => {
    const { sut, httpClientSpy } = makeSut()
    httpClientSpy.response = {
      statusCode: HttpStatusCode.badRequest
    }

    const promise = sut.login(mockAuthenticationParams())

    await expect(promise).rejects.toThrow(new UnexpectedError())
  })

  test('Deve lançar UnexpectedError se HttpClient retornar 500', async () => {
    const { sut, httpClientSpy } = makeSut()
    httpClientSpy.response = {
      statusCode: HttpStatusCode.serverError
    }

    const promise = sut.login(mockAuthenticationParams())

    await expect(promise).rejects.toThrow(new UnexpectedError())
  })

  test('Deve lançar UnexpectedError se HttpClient retornar 404', async () => {
    const { sut, httpClientSpy } = makeSut()
    httpClientSpy.response = {
      statusCode: HttpStatusCode.notFound
    }

    const promise = sut.login(mockAuthenticationParams())

    await expect(promise).rejects.toThrow(new UnexpectedError())
  })

  test('Deve retornar um Authentication.Model se HttpClient retornar 200', async () => {
    const { sut, httpClientSpy } = makeSut()
    const httpResult = mockAuthenticationModel()
    httpClientSpy.response = {
      statusCode: HttpStatusCode.ok,
      body: httpResult
    }

    const account = await sut.login(mockAuthenticationParams())

    expect(account).toEqual(httpResult)
  })
})
