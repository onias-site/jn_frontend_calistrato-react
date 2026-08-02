# De-Para: Status HTTP — Backend Java × Frontend TypeScript

Gerado em: 2026-08-01  
Fonte backend: `JnRestApiLogin.java` + `JnServiceLogin.java` + enums `JnProcessStatus*`  
Fonte frontend: `ServerRequests.ts` (atributos `callbacks` e `cached` de cada request)

---

## Mapeamento de endpoints

| Frontend (ServerRequests) | Verbo | URL                                      | Backend (JnServiceLogin)  |
|---------------------------|-------|------------------------------------------|---------------------------|
| `checkEmail`              | HEAD  | `/login/{email}/token`                   | `ExistsLoginEmail`        |
| `confirmEmail`            | POST  | `/login/{email}/token`                   | `CreateLoginEmail`        |
| `requestPassword`         | POST  | `/login/{email}`                         | `ExecuteLogin`            |
| `requestAnswers`          | POST  | `/login/{email}/pre-registration`        | `SaveAnswers`             |
| `savePassword`            | POST  | `/login/{email}/password`                | `SavePassword`            |
| `requestResendToken`      | POST  | `/login/{email}/token/request/resending` | `ResendLoginToken`        |
| `sendToken`               | POST  | `/login/{email}/token/language/{lang}`   | `CreateLoginToken`        |
| `requestUnlockToken`      | POST  | `/login/{email}/token/request/unlocking` | `UnlockLoginToken`        |

---

## Inconsistências encontradas

### 1. `checkEmail` → HEAD `/login/{email}/token` → `ExistsLoginEmail`

**Enum:** `JnProcessStatusExistsLoginEmail`

| Status | Nome backend         | Backend retorna | Frontend trata | Situação                              |
|--------|----------------------|-----------------|----------------|---------------------------------------|
| 200    | expectedStatus       | ✓               | ✓ (cached)     | OK                                    |
| 201    | missingAnswers       | ✓               | ✓              | OK                                    |
| 202    | missingPassword      | ✓               | ✓              | OK                                    |
| 400    | invalidEmail         | ✓               | ✗              | ⚠ Backend retorna, frontend não trata |
| **403**| **lockedToken**      | **✓**           | **✗**          | **❌ Backend retorna, frontend não trata** |
| 404    | missingEmail         | ✓               | ✓              | OK                                    |
| 409    | loginConflict        | ✓               | ✓              | OK                                    |
| 422    | invalidJson          | ✓               | ✗              | ⚠ Backend retorna, frontend não trata |
| 427    | lockedPassword       | ✓               | ✓              | OK                                    |

---

### 2. `confirmEmail` → POST `/login/{email}/token` → `CreateLoginEmail`

**Enum:** `JnProcessStatusCreateLoginEmail`

| Status | Nome backend         | Backend retorna | Frontend trata | Situação                              |
|--------|----------------------|-----------------|----------------|---------------------------------------|
| 200    | expectedStatus       | ✓               | ✓              | OK                                    |
| 201    | missingSaveAnswers   | ✓               | ✓              | OK                                    |
| 202    | missingSavePassword  | ✓               | ✓              | OK                                    |
| 400    | invalidEmail         | ✓               | ✗              | ⚠ Backend retorna, frontend não trata |
| **403**| **lockedToken**      | **✓**           | **✗**          | **❌ Backend retorna, frontend não trata** |
| **404**| *(não existe neste enum)* | **✗**     | **✓**          | **❌ Frontend trata, backend não retorna** |
| **409**| **loginConflict**    | **✓**           | **✗**          | **❌ Backend retorna, frontend não trata** |
| **421**| *(não existe no backend)* | **✗**    | **✓**          | **❌ Frontend trata, backend não retorna** |
| **427**| **lockedPassword**   | **✓**           | **✗**          | **❌ Backend retorna, frontend não trata** |

---

### 3. `requestPassword` → POST `/login/{email}` → `ExecuteLogin`

**Enum:** `JnProcessStatusExecuteLogin` + `JnProcessStatusCreateLoginEmail.missingSaveAnswers`

| Status | Nome backend             | Backend retorna | Frontend trata | Situação                              |
|--------|--------------------------|-----------------|----------------|---------------------------------------|
| 200    | expectedStatus           | ✓               | ✓              | OK                                    |
| 201    | missingSaveAnswers       | ✓               | ✓              | OK                                    |
| 202    | missingSavePassword      | ✓               | ✓              | OK                                    |
| 400    | invalidEmail             | ✓               | ✗              | ⚠ Backend retorna, frontend não trata |
| **403**| **lockedToken**          | **✓**           | **✗**          | **❌ Backend retorna, frontend não trata** |
| 404    | missingSavingEmail       | ✓               | ✓              | OK                                    |
| 409    | loginConflict            | ✓               | ✓              | OK                                    |
| 423    | lockedPassword           | ✓               | ✓              | OK                                    |
| 427    | wrongPassword            | ✓               | ✓              | OK                                    |
| 429    | passwordLockedRecently   | ✓               | ✓              | OK                                    |

---

### 4. `requestAnswers` → POST `/login/{email}/pre-registration` → `SaveAnswers`

**Enum:** `JnProcessStatusSaveAnswers`

| Status | Nome backend         | Backend retorna | Frontend trata | Situação                              |
|--------|----------------------|-----------------|----------------|---------------------------------------|
| 200    | expectedStatus       | ✓               | ✓              | OK                                    |
| 202    | missingPassword      | ✓               | ✓              | OK                                    |
| 400    | invalidEmail         | ✓               | ✗              | ⚠ Backend retorna, frontend não trata |
| **403**| **lockedToken**      | **✓**           | **✗**          | **❌ Backend retorna, frontend não trata** |
| 404    | tokenFaltando        | ✓               | ✓              | OK                                    |
| **409**| **loginConflict**    | **✓**           | **✗**          | **❌ Backend retorna, frontend não trata** |
| **427**| **lockedPassword**   | **✓**           | **✗**          | **❌ Backend retorna, frontend não trata** |

---

### 5. `savePassword` → POST `/login/{email}/password` → `SavePassword`

**Enum:** `JnProcessStatusUpdatePassword` + `JnProcessStatusCreateLoginEmail.missingSaveAnswers`

| Status | Nome backend         | Backend retorna | Frontend trata | Situação                              |
|--------|----------------------|-----------------|----------------|---------------------------------------|
| 200    | expectedStatus       | ✓               | ✓              | OK                                    |
| 201    | missingSaveAnswers   | ✓               | ✓              | OK                                    |
| 400    | invalidEmail         | ✓               | ✗              | ⚠ Backend retorna, frontend não trata |
| **403**| **lockedToken**      | **✓**           | **✗**          | **❌ Backend retorna, frontend não trata** |
| 404    | missingEmail/Token   | ✓               | ✓              | OK                                    |
| 422    | invalidJson          | ✓               | ✗              | ⚠ Backend retorna, frontend não trata |
| 427    | wrongToken           | ✓               | ✓              | OK                                    |
| 429    | tokenLockedRecently  | ✓               | ✓              | OK                                    |

---

### 6. `requestResendToken` → POST `/login/{email}/token/request/resending` → `ResendLoginToken`

**Enum:** `JnProcessStatusUnlockLoginToken`

| Status | Nome backend              | Backend retorna | Frontend trata | Situação                              |
|--------|---------------------------|-----------------|----------------|---------------------------------------|
| 200    | *(implícito — sucesso)*   | ✓               | ✓              | OK                                    |
| **404**| **statusTokenNotExists**  | **✓**           | **✗**          | **❌ Backend retorna, frontend não trata** |
| 409    | statusAlreadyRequested    | ✓               | ✓ (cached)     | OK                                    |
| 429    | statusTokenAlredyResent   | ✓               | ✓ (cached)     | OK                                    |

---

### 7. `sendToken` → POST `/login/{email}/token/language/portuguese` → `CreateLoginToken`

**Enum:** `JnProcessStatusCreateLoginToken` + `JnProcessStatusUpdatePassword.tokenAlreadySent`

| Status | Nome backend         | Backend retorna | Frontend trata | Situação |
|--------|----------------------|-----------------|----------------|----------|
| 200    | expectedStatus       | ✓               | ✓              | OK       |
| 400    | statusInvalidEmail   | ✓               | ✗              | ⚠ Backend retorna, frontend não trata |
| 403    | statusLockedToken    | ✓               | ✓ (cached)     | OK       |
| 404    | statusMissingEmail   | ✓               | ✓              | OK       |
| 409    | tokenAlreadySent     | ✓               | ✓ (cached)     | OK       |

---

### 8. `requestUnlockToken` → POST `/login/{email}/token/request/unlocking` → `UnlockLoginToken`

**Enum:** `JnProcessStatusUnlockLoginToken`

| Status | Nome backend                | Backend retorna | Frontend trata | Situação |
|--------|-----------------------------|-----------------|----------------|----------|
| 200    | *(implícito — sucesso)*     | ✓               | ✓              | OK       |
| 404    | statusTokenNotLocked        | ✓               | ✓              | OK       |
| 409    | statusAlreadyRequested      | ✓               | ✓ (cached)     | OK       |
| 429    | statusTokenAlredyUnlocked   | ✓               | ✓ (cached)     | OK       |

---

## Resumo consolidado das inconsistências críticas (❌)

### Backend retorna — Frontend NÃO trata

| Endpoint frontend    | Status | Significado                                   |
|----------------------|--------|-----------------------------------------------|
| `checkEmail`         | 403    | Token bloqueado                               |
| `confirmEmail`       | 403    | Token bloqueado                               |
| `confirmEmail`       | 409    | Conflito de sessão ativa                      |
| `confirmEmail`       | 427    | Senha bloqueada                               |
| `requestPassword`    | 403    | Token bloqueado                               |
| `requestAnswers`     | 403    | Token bloqueado                               |
| `requestAnswers`     | 409    | Conflito de sessão ativa                      |
| `requestAnswers`     | 427    | Senha bloqueada                               |
| `savePassword`       | 403    | Token bloqueado                               |
| `requestResendToken` | 404    | Token não existe (não há token para reenviar) |

### Frontend trata — Backend NÃO retorna

| Endpoint frontend | Status | Observação                                                      |
|-------------------|--------|-----------------------------------------------------------------|
| `confirmEmail`    | 404    | `JnProcessStatusCreateLoginEmail` não possui status 404 no fluxo de `CreateLoginEmail` |
| `confirmEmail`    | 421    | Status 421 não existe em nenhum enum do backend                 |

### Observações adicionais (⚠ backend retorna 400/422, frontend silencia)

Os status **400** (`invalidEmail`) e **422** (`invalidJson`/`invalidPassword`) são retornados em quase todos os endpoints, mas o frontend não os trata em nenhum deles. Provavelmente são cobertos por validação client-side antes de disparar a requisição, mas caso cheguem ao frontend, não há feedback ao usuário.
