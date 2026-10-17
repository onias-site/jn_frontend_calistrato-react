 export const makeApiUrl = (path: string): string => !path ? '' : `${process.env.API_URL ?? 'http://localhost:8080'}${path}`
// the login lives in the API of the js cost center since 2026-10-17
export const makeLoginApiUrl = (path: string): string => !path ? '' : `${process.env.LOGIN_API_URL ?? 'http://localhost:8082'}${path}`
//export const makeApiUrl = (path: string): string => `${process.env.API_URL ?? 'http://localhost:3000'}${path}`

