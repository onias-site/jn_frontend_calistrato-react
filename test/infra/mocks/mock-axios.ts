import axios from 'axios'
import casual from 'casual'

export const mockHttpResponse = (): any => ({
  data: casual.random_element,
  status: casual.integer(200, 299)
})

export const mockAxios = (): jest.Mocked<typeof axios> => {
  const mockedAxios = axios as jest.Mocked<typeof axios>
  mockedAxios.request.mockClear().mockResolvedValue(mockHttpResponse())
  return mockedAxios
}
