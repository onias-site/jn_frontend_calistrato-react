import { HttpClient, HttpRequest, HttpResponse, HttpStatusCode } from '@/data/protocols/http/http-client'
import casual from 'casual'


export const mockHttpRequest = (): HttpRequest => ({
  url: casual.url,
  method: casual.random_element(['get', 'post', 'put', 'delete']),
  body: {
    key1: casual.word,
    key2: casual.integer(1, 100)
  },
  headers: {
    'Content-Type': 'application/json'
  }
})

export class HttpClientSpy<R = any> implements HttpClient<R> {
  url?: string
  method?: string
  body?: any
  headers?: any
  response: HttpResponse<R> = {
    statusCode: HttpStatusCode.ok
  }

  async request (data: HttpRequest): Promise<HttpResponse<R>> {
    this.url = data.url
    this.method = data.method
    this.body = data.body
    this.headers = data.headers
    return this.response
  }
}
