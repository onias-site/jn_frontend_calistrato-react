import { HttpClient, HttpRequest, HttpResponse } from '@/data/protocols/http/http-client'
import axios, { AxiosResponse } from 'axios'


export class AxiosHttpClient implements HttpClient {
  async request(data: HttpRequest): Promise<HttpResponse> {
    let axiosResponse: AxiosResponse

    try {
      // Retrieve token directly from localStorage
      const token = localStorage.getItem('sessionToken')

      // Add Authorization header if token exists
      const headers = {
        ...data.headers,
        ...(token && { Authorization: `Bearer ${token}` })
      }

      axiosResponse = await axios.request({
        url: data.url,
        method: data.method,
        data: data.body,
        headers
      })
    } catch (error: any) {
      axiosResponse = error.response
    }

    return {
      statusCode: axiosResponse?.status,
      body: axiosResponse?.data
    }
  }
}
