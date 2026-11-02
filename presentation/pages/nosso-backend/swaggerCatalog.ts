// GERADO pela skill /ccp-atualizar-tela-nosso-backend a partir do /api-docs das APIs locais: nao edite a mao, rode a skill.
// E o documento OpenAPI de cada API, porque o /api-docs nao libera CORS para o front. Os textos ficam em ingles, como no Swagger.

export interface BackendSwaggerSection {
    title: string;
    swaggerUrl: string;
    endpoints: number;
    spec: Record<string, any>;
}

export const swaggerSections: BackendSwaggerSection[] = [
    {
        "endpoints": 14,
        "spec": {
            "components": {},
            "info": {
                "description": "REST API for authentication: login, password management, token and session control.",
                "title": "JobsNow Authentication API",
                "version": "1.0"
            },
            "openapi": "3.0.1",
            "paths": {
                "/contact-us/{email}": {
                    "post": {
                        "description": "When does it occur? When the user sends the contact us modal. What does it do? Saves the ticket (one open ticket per e-mail and type: a new one of the same type takes the place of the open one), e-mails the user what they filled in, telling that the ticket is being analyzed, and sends the support the command to answer it. No session is required.<br/><br/><b>Path variables:</b><ul><li><b>email</b> – Required. The e-mail the user is logged in with, or the one the login modal keeps. Min 7, max 100 characters.</li></ul><b>Request body fields (JSON):</b><ul><li><b>type</b> – Required. One of reportBug, makeCompliment, makeCriticism, makeSuggestion, makeComment, clarifyDoubts.</li><li><b>title</b> – Required. 5 to 50 characters.</li><li><b>description</b> – Required. 10 to 500 characters.</li><li><b>stackTrace</b> – Optional. The last stack trace caught by the page, up to 50,000 characters.</li></ul>",
                        "operationId": "saveContactUs",
                        "parameters": [
                            {
                                "in": "path",
                                "name": "email",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            }
                        ],
                        "requestBody": {
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "additionalProperties": {
                                            "type": "object"
                                        },
                                        "type": "object"
                                    }
                                }
                            },
                            "required": true
                        },
                        "responses": {
                            "200": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "Ticket saved. The frontend should tell the user that the support will answer by e-mail."
                            },
                            "400": {
                                "description": "Invalid email format."
                            },
                            "403": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "The support chose to ignore this user. The frontend should tell the user that the ticket could not be opened."
                            },
                            "405": {
                                "description": "Method Not Allowed"
                            },
                            "422": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "Validation error: a field missing or out of its size, or an unknown type."
                            },
                            "429": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "Daily limit reached: a ticket of the same quota was opened in the last 24 hours (a question has its own quota; the other kinds, except bugs, share it with the skill suggestion and the skill hierarchy fix). The frontend should ask the user to try again tomorrow."
                            }
                        },
                        "summary": "Open a ticket of the contact us",
                        "tags": [
                            "Contact us"
                        ]
                    }
                },
                "/grouper/{email}/{parentName}/{childName}/{parentId}": {
                    "get": {
                        "description": "When does it occur? When a screen needs a group already calculated by the writes of an entity (the views of the month of a recruiter, the views of the month of a resume, the resumes of a hash...). What does it do? Reads, by id with no query, the group on the side asked: the groups of the active records (jn_grouper, the default) or the ones of the inactive records (jn_inactive_grouper). Its children are ids, JSON texts or, in a group of counters, a single JSON text of counters; childCount is the size of the child list, but in a group of counters, where it is the number of keys.<br/><br/><b>Path variables:</b><ul><li><b>email</b> – Required. The logged-in user's e-mail.</li><li><b>parentName</b> – Required. The kind of group: the name of the entity that calculates the parent id (2 to 50 characters).</li><li><b>childName</b> – Required. The name of the entity of the children (2 to 50 characters).</li><li><b>parentId</b> – Required. The id of the parent (1 to 100 characters).</li></ul><b>Query parameters:</b><ul><li><b>side</b> – Optional. mainEntity (default), the groups of the active records, or twinEntity, the ones of the inactive records.</li></ul>",
                        "operationId": "getGroup",
                        "parameters": [
                            {
                                "in": "path",
                                "name": "childName",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            },
                            {
                                "in": "path",
                                "name": "email",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            },
                            {
                                "in": "path",
                                "name": "parentId",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            },
                            {
                                "in": "path",
                                "name": "parentName",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            },
                            {
                                "in": "query",
                                "name": "side",
                                "required": false,
                                "schema": {
                                    "default": "mainEntity",
                                    "type": "string"
                                }
                            }
                        ],
                        "responses": {
                            "200": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "example": {
                                                "child": [
                                                    "{\"empresa.com.br\":2,\"consultoria.com\":1}"
                                                ],
                                                "childCount": 2,
                                                "childName": "vis_viewed_resume",
                                                "parentId": "8f3c...",
                                                "parentJson": {
                                                    "email": "5e2b...",
                                                    "monthYear": "202610"
                                                },
                                                "parentName": "vis_resume_views_of_the_month"
                                            },
                                            "type": "string"
                                        }
                                    }
                                },
                                "description": "The group."
                            },
                            "400": {
                                "description": "Bad Request"
                            },
                            "401": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "No valid login."
                            },
                            "404": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "No group with this primary key on the side asked."
                            },
                            "405": {
                                "description": "Method Not Allowed"
                            },
                            "422": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "Validation error — a key out of its size, or a side other than mainEntity and twinEntity."
                            }
                        },
                        "summary": "A group of jn_grouper by its primary key",
                        "tags": [
                            "Grouper"
                        ]
                    }
                },
                "/grouper/{email}/{parentName}/{childName}/{parentId}/bothSides": {
                    "get": {
                        "description": "When does it occur? When a screen needs, in one request, the active and the inactive children of a group (the sessions of a user still open and the ones already closed, for one). What does it do? Reads, by id with no query and in a single search, the group on both sides: jn_grouper (the groups of the active records) and jn_inactive_grouper (the ones of the inactive records). Each side comes under the name of its entity, with an empty json when the group does not exist there.<br/><br/><b>Path variables:</b><ul><li><b>email</b> – Required. The logged-in user's e-mail.</li><li><b>parentName</b> – Required. The kind of group: the name of the entity that calculates the parent id (2 to 50 characters).</li><li><b>childName</b> – Required. The name of the entity of the children (2 to 50 characters).</li><li><b>parentId</b> – Required. The id of the parent (1 to 100 characters).</li></ul>",
                        "operationId": "getGroupOnBothSides",
                        "parameters": [
                            {
                                "in": "path",
                                "name": "childName",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            },
                            {
                                "in": "path",
                                "name": "email",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            },
                            {
                                "in": "path",
                                "name": "parentId",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            },
                            {
                                "in": "path",
                                "name": "parentName",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            }
                        ],
                        "responses": {
                            "200": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "example": {
                                                "jn_grouper": {
                                                    "child": [
                                                        "a1b2..."
                                                    ],
                                                    "childCount": 1,
                                                    "childName": "js_login_session_validation",
                                                    "parentId": "8f3c...",
                                                    "parentJson": {
                                                        "email": "5e2b..."
                                                    },
                                                    "parentName": "jn_login_email"
                                                },
                                                "jn_inactive_grouper": {}
                                            },
                                            "type": "string"
                                        }
                                    }
                                },
                                "description": "The group of each side."
                            },
                            "400": {
                                "description": "Bad Request"
                            },
                            "401": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "No valid login."
                            },
                            "404": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "No group with this primary key on either side."
                            },
                            "405": {
                                "description": "Method Not Allowed"
                            },
                            "422": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "Validation error — a key out of its size."
                            }
                        },
                        "summary": "A group of jn_grouper by its primary key, on both sides at once",
                        "tags": [
                            "Grouper"
                        ]
                    }
                },
                "/login/{email}": {
                    "post": {
                        "description": "When does it occur? Right after the user types their password. What does it do? Authenticates the user and generates a session token to be used in subsequent authenticated requests. The optional query parameter <b>wordsHash</b> can be sent by the frontend: if it matches the backend value, the word list is not returned. Otherwise, the full word list and its new hash are returned and must be stored in application storage (long-term browser storage).<br/><br/><b>Request body fields (JSON):</b><ul><li><b>userAgent</b> – Required. Must be a non-empty string.</li><li><b>ip</b> – Required. String, min 7 / max 45 characters (IPv4 or IPv6 address of the client).</li><li><b>email</b> – Required. Valid email address. Min 7, max 100 characters.</li><li><b>password</b> – Required. Strong password: minimum 8 characters, at least 1 uppercase letter, 1 lowercase letter, 1 digit, and 1 special character.</li></ul>",
                        "operationId": "executeLogin",
                        "parameters": [
                            {
                                "in": "path",
                                "name": "email",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            }
                        ],
                        "requestBody": {
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "additionalProperties": {
                                            "type": "object"
                                        },
                                        "type": "object"
                                    }
                                }
                            },
                            "required": true
                        },
                        "responses": {
                            "200": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "example": {
                                                "sessionToken": "{tokenValue}"
                                            },
                                            "type": "string"
                                        }
                                    }
                                },
                                "description": "User logged in successfully. The frontend should dismiss the login modal and store the 'sessionToken' returned in the JSON."
                            },
                            "201": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "example": {
                                                "sessionToken": "{tokenValue}"
                                            },
                                            "type": "string"
                                        }
                                    }
                                },
                                "description": "Pre-registration data is pending. The frontend should redirect the user to the pre-registration screen."
                            },
                            "202": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "example": {
                                                "sessionToken": "{tokenValue}"
                                            },
                                            "type": "string"
                                        }
                                    }
                                },
                                "description": "Password registration is pending. The frontend should redirect the user to the password registration screen."
                            },
                            "400": {
                                "description": "Invalid email format. The frontend should display a generic system error."
                            },
                            "403": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "Token is locked. The frontend should redirect the user to the token unlock request screen."
                            },
                            "404": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "New user — email not found in the system. The frontend should redirect the user to the email confirmation screen."
                            },
                            "405": {
                                "description": "Method Not Allowed"
                            },
                            "409": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "User already logged in. The frontend should redirect the user to the password change screen."
                            },
                            "422": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "Unprocessable Entity"
                            },
                            "423": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "Password pending unlock. The frontend should redirect the user to the password change screen."
                            },
                            "427": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "Wrong password entered. Still within the allowed attempt limit. The frontend should display an error message with the remaining attempt count."
                            },
                            "429": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "Password just locked — maximum wrong attempts exceeded. The frontend should redirect the user to the password re-registration screen."
                            }
                        },
                        "summary": "Execute login",
                        "tags": [
                            "Login"
                        ]
                    }
                },
                "/login/{email}/erro": {
                    "get": {
                        "operationId": "onlyError",
                        "parameters": [
                            {
                                "in": "path",
                                "name": "email",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            }
                        ],
                        "responses": {
                            "200": {
                                "description": "OK"
                            },
                            "400": {
                                "description": "Bad Request"
                            },
                            "405": {
                                "description": "Method Not Allowed"
                            },
                            "422": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "Unprocessable Entity"
                            }
                        },
                        "tags": [
                            "Login"
                        ]
                    }
                },
                "/login/{email}/password": {
                    "post": {
                        "description": "When does it occur? After the system detects a locked or missing password, or when the user wants to change their password. What does it do? Registers the user's access password using a valid one-time token sent by email. The optional query parameter <b>wordsHash</b> can be sent to avoid re-downloading the full word list; if the hash matches, the word list is not returned.<br/><br/><b>Request body fields (JSON):</b><ul><li><b>userAgent</b> – Required. Must be a non-empty string.</li><li><b>ip</b> – Required. String, min 7 / max 45 characters (IPv4 or IPv6 address of the client).</li><li><b>email</b> – Required. Valid email address. Min 7, max 100 characters.</li><li><b>password</b> – Required. Strong password: minimum 8 characters, at least 1 uppercase letter, 1 lowercase letter, 1 digit, and 1 special character.</li><li><b>token</b> – Optional. The one-time token sent by email. Must be a non-empty string if provided.</li></ul>",
                        "operationId": "savePassword",
                        "parameters": [
                            {
                                "in": "path",
                                "name": "email",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            }
                        ],
                        "requestBody": {
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "additionalProperties": {
                                            "type": "object"
                                        },
                                        "type": "object"
                                    }
                                }
                            },
                            "required": true
                        },
                        "responses": {
                            "200": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "example": {
                                                "sessionToken": "{tokenValue}",
                                                "words": [
                                                    {
                                                        "type": "IT",
                                                        "word": "java"
                                                    }
                                                ],
                                                "wordsHash": "{wordsHash}"
                                            },
                                            "type": "string"
                                        }
                                    }
                                },
                                "description": "Password saved, user has no pending registrations. The frontend should redirect the user to the password entry screen."
                            },
                            "201": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "example": {
                                                "sessionToken": "{tokenValue}",
                                                "words": [
                                                    {
                                                        "type": "IT",
                                                        "word": "java"
                                                    }
                                                ],
                                                "wordsHash": "{wordsHash}"
                                            },
                                            "type": "string"
                                        }
                                    }
                                },
                                "description": "Pre-registration is pending. The frontend should redirect the user to the pre-registration screen."
                            },
                            "400": {
                                "content": {},
                                "description": "Invalid email format. The frontend should display a generic system error."
                            },
                            "403": {
                                "description": "Token is locked. The frontend should redirect the user to the token unlock request screen."
                            },
                            "404": {
                                "description": "Email not found. The frontend should redirect the user to the email confirmation screen."
                            },
                            "405": {
                                "description": "Method Not Allowed"
                            },
                            "422": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "Unprocessable Entity"
                            },
                            "423": {
                                "description": "Weak password: the submitted password does not meet strong-password requirements. The frontend should redirect the user to the weak password confirmation screen."
                            },
                            "427": {
                                "description": "Wrong token entered. Still within the allowed attempt limit. The frontend should display an error with the remaining attempt count."
                            },
                            "429": {
                                "description": "Token just locked — maximum wrong attempts exceeded. The frontend should redirect the user to the token resend screen."
                            }
                        },
                        "summary": "Save password",
                        "tags": [
                            "Login"
                        ]
                    }
                },
                "/login/{email}/pre-registration": {
                    "post": {
                        "description": "When does it occur? Right after the system detects missing pre-registration data during the login flow. What does it do? Records the user's onboarding questionnaire answers.<br/><br/><b>Request body fields (JSON):</b><ul><li><b>userAgent</b> – Required. Must be a non-empty string.</li><li><b>ip</b> – Required. String, min 7 / max 45 characters (IPv4 or IPv6 address of the client).</li><li><b>email</b> – Required. Valid email address. Min 7, max 100 characters.</li><li><b>channel</b> – Required. Accepted values: 'linkedin', 'telegram', 'friends', 'others'.</li><li><b>goal</b> – Required. Accepted values: 'jobs', 'recruiting'.</li></ul>",
                        "operationId": "saveAnswers",
                        "parameters": [
                            {
                                "in": "path",
                                "name": "email",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            }
                        ],
                        "requestBody": {
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "additionalProperties": {
                                            "type": "object"
                                        },
                                        "type": "object"
                                    }
                                }
                            },
                            "required": true
                        },
                        "responses": {
                            "200": {
                                "description": "Answers saved, user has no pending registrations. The frontend should redirect the user to the password entry screen."
                            },
                            "202": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "example": {
                                                "sessionToken": "tokenValue"
                                            },
                                            "type": "string"
                                        }
                                    }
                                },
                                "description": "Password registration is pending. The frontend should redirect the user to the password registration screen."
                            },
                            "400": {
                                "content": {},
                                "description": "Invalid email format. The frontend should display a generic system error."
                            },
                            "403": {
                                "description": "Token is locked. The frontend should redirect the user to the token unlock request screen."
                            },
                            "404": {
                                "description": "Email not found. The frontend should redirect the user to the email confirmation screen."
                            },
                            "405": {
                                "description": "Method Not Allowed"
                            },
                            "409": {
                                "description": "User already logged in. The frontend should redirect the user to the password change screen."
                            },
                            "422": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "Unprocessable Entity"
                            },
                            "423": {
                                "description": "Password pending unlock. The frontend should redirect the user to the password change screen."
                            }
                        },
                        "summary": "Save pre-registration answers",
                        "tags": [
                            "Login"
                        ]
                    }
                },
                "/login/{email}/token": {
                    "head": {
                        "description": "When does it occur? Right after the user shows interest in accessing authenticated resources. What does it do? Checks whether the user exists and whether there are any pending registration steps (password, pre-registration).<br/><br/><b>Request body fields (JSON):</b><ul><li><b>userAgent</b> – Required. Must be a non-empty string.</li><li><b>ip</b> – Required. String, min 7 / max 45 characters (IPv4 or IPv6 address of the client).</li><li><b>email</b> – Required. Valid email address. Min 7, max 100 characters.</li></ul>",
                        "operationId": "existsLoginEmail",
                        "parameters": [
                            {
                                "in": "path",
                                "name": "email",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            }
                        ],
                        "requestBody": {
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "string"
                                    }
                                }
                            },
                            "required": true
                        },
                        "responses": {
                            "200": {
                                "description": "Password registered, no pending registrations. The frontend should redirect the user to the password entry screen."
                            },
                            "201": {
                                "description": "Pre-registration is pending. The frontend should redirect the user to the pre-registration screen."
                            },
                            "202": {
                                "description": "Password registration is pending. The frontend should redirect the user to the password registration screen."
                            },
                            "400": {
                                "description": "Invalid email format. The frontend should display a generic system error."
                            },
                            "403": {
                                "description": "Token is locked. The frontend should redirect the user to the token unlock request screen."
                            },
                            "404": {
                                "description": "New user — email not found. The frontend should redirect the user to the email confirmation screen."
                            },
                            "405": {
                                "description": "Method Not Allowed"
                            },
                            "409": {
                                "description": "User already logged in. The frontend should redirect the user to the password change screen."
                            },
                            "422": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "Unprocessable Entity"
                            },
                            "423": {
                                "description": "Password pending unlock. The frontend should redirect the user to the password change screen."
                            }
                        },
                        "summary": "Check user registration status",
                        "tags": [
                            "Login"
                        ]
                    },
                    "post": {
                        "description": "When does it occur? Right after confirming it is the user's first access and they have confirmed their email. What does it do? Sends a token to the user's email so they can use it to register a password.<br/><br/><b>Request body fields (JSON):</b><ul><li><b>userAgent</b> – Required. Must be a non-empty string.</li><li><b>ip</b> – Required. String, min 7 / max 45 characters (IPv4 or IPv6 address of the client).</li><li><b>email</b> – Required. Valid email address. Min 7, max 100 characters.</li></ul>",
                        "operationId": "createLoginEmail",
                        "parameters": [
                            {
                                "in": "path",
                                "name": "email",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            }
                        ],
                        "requestBody": {
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "additionalProperties": {
                                            "type": "object"
                                        },
                                        "type": "object"
                                    }
                                }
                            },
                            "required": true
                        },
                        "responses": {
                            "200": {
                                "description": "Password already registered, user has no pending registrations. The frontend should redirect the user to the password entry screen."
                            },
                            "201": {
                                "description": "Pre-registration is pending. The frontend should redirect the user to the pre-registration screen."
                            },
                            "202": {
                                "description": "Token for password registration sent to user's email. The frontend should redirect the user to the password registration screen."
                            },
                            "400": {
                                "content": {},
                                "description": "Invalid email format. The frontend should display a generic system error."
                            },
                            "403": {
                                "description": "Token is locked. The frontend should redirect the user to the token unlock request screen."
                            },
                            "405": {
                                "description": "Method Not Allowed"
                            },
                            "409": {
                                "description": "User already logged in. The frontend should redirect the user to the password change screen."
                            },
                            "422": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "Unprocessable Entity"
                            },
                            "423": {
                                "description": "Password pending unlock. The frontend should redirect the user to the password change screen."
                            }
                        },
                        "summary": "Request login token by email",
                        "tags": [
                            "Login"
                        ]
                    }
                },
                "/login/{email}/token/language/{language}": {
                    "post": {
                        "description": "When does it occur? When the user needs a token and wants to receive the email in a specific language. What does it do? Sends a token to the user's email in the requested language so they can register a password.<br/><br/><b>Path variables:</b><ul><li><b>language</b> – Required. Accepted values: 'portuguese', 'english', 'spanish'.</li></ul><b>Request body fields (JSON):</b><ul><li><b>userAgent</b> – Required. Must be a non-empty string.</li><li><b>ip</b> – Required. String, min 7 / max 45 characters (IPv4 or IPv6 address of the client).</li><li><b>email</b> – Required. Valid email address. Min 7, max 100 characters.</li><li><b>language</b> – Required. Accepted values: 'portuguese', 'english', 'spanish'.</li></ul>",
                        "operationId": "createLoginToken",
                        "parameters": [
                            {
                                "in": "path",
                                "name": "email",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            },
                            {
                                "in": "path",
                                "name": "language",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            }
                        ],
                        "requestBody": {
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "additionalProperties": {
                                            "type": "object"
                                        },
                                        "type": "object"
                                    }
                                }
                            },
                            "required": true
                        },
                        "responses": {
                            "200": {
                                "description": "Password already registered, user has no pending registrations. The frontend should redirect the user to the password entry screen."
                            },
                            "201": {
                                "description": "Pre-registration is pending. The frontend should redirect the user to the pre-registration screen."
                            },
                            "202": {
                                "description": "Token sent to user's email. The frontend should redirect the user to the password registration screen."
                            },
                            "400": {
                                "content": {},
                                "description": "Invalid email format. The frontend should display a generic system error."
                            },
                            "403": {
                                "description": "Token is locked. The frontend should redirect the user to the token unlock request screen."
                            },
                            "404": {
                                "description": "Email not registered. The frontend should redirect the user to the email confirmation screen."
                            },
                            "405": {
                                "description": "Method Not Allowed"
                            },
                            "422": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "Unprocessable Entity"
                            }
                        },
                        "summary": "Request login token by email with language preference",
                        "tags": [
                            "Login"
                        ]
                    }
                },
                "/login/{email}/token/request/resending": {
                    "post": {
                        "description": "When does it occur? When the user's token is locked due to too many wrong attempts and they want a new token. What does it do? Registers a resend request for the locked token so a support bot can process it.<br/><br/><b>Request body fields (JSON):</b><ul><li><b>userAgent</b> – Required. Must be a non-empty string.</li><li><b>ip</b> – Required. String, min 7 / max 45 characters (IPv4 or IPv6 address of the client).</li><li><b>email</b> – Required. Valid email address. Min 7, max 100 characters.</li></ul>",
                        "operationId": "resendLoginToken",
                        "parameters": [
                            {
                                "in": "path",
                                "name": "email",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            }
                        ],
                        "requestBody": {
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "additionalProperties": {
                                            "type": "object"
                                        },
                                        "type": "object"
                                    }
                                }
                            },
                            "required": true
                        },
                        "responses": {
                            "200": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "Resend request registered successfully."
                            },
                            "400": {
                                "description": "Bad Request"
                            },
                            "404": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "Token is not locked — resend is not applicable."
                            },
                            "405": {
                                "description": "Method Not Allowed"
                            },
                            "409": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "Resend or unlock request already submitted."
                            },
                            "422": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "Unprocessable Entity"
                            },
                            "429": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "Token has already been resent or unlocked."
                            }
                        },
                        "summary": "Request token resend (unlock flow)",
                        "tags": [
                            "Login"
                        ]
                    }
                },
                "/login/{email}/token/request/unlocking": {
                    "post": {
                        "description": "When does it occur? When the user needs to unlock a previously locked token. What does it do? Registers an unlock request for the locked token so a support bot can process it.<br/><br/><b>Request body fields (JSON):</b><ul><li><b>userAgent</b> – Required. Must be a non-empty string.</li><li><b>ip</b> – Required. String, min 7 / max 45 characters (IPv4 or IPv6 address of the client).</li><li><b>email</b> – Required. Valid email address. Min 7, max 100 characters.</li></ul>",
                        "operationId": "unlockLoginToken",
                        "parameters": [
                            {
                                "in": "path",
                                "name": "email",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            }
                        ],
                        "requestBody": {
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "additionalProperties": {
                                            "type": "object"
                                        },
                                        "type": "object"
                                    }
                                }
                            },
                            "required": true
                        },
                        "responses": {
                            "200": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "Unlock request registered successfully."
                            },
                            "400": {
                                "description": "Bad Request"
                            },
                            "404": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "Token is not locked — unlock is not applicable."
                            },
                            "405": {
                                "description": "Method Not Allowed"
                            },
                            "409": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "Unlock request already submitted."
                            },
                            "422": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "Unprocessable Entity"
                            },
                            "429": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "Token already unlocked or already resent."
                            }
                        },
                        "summary": "Request token unlock",
                        "tags": [
                            "Login"
                        ]
                    }
                },
                "/login/{email}/{sessionToken}": {
                    "delete": {
                        "description": "When does it occur? When the user intentionally ends their session or the frontend needs to disassociate from it. What does it do? Removes the active session so subsequent authenticated requests are rejected.<br/><br/><b>Path variables:</b><ul><li><b>sessionToken</b> – Required. Must be exactly 8 characters.</li></ul><b>Request body fields (JSON):</b><ul><li><b>userAgent</b> – Required. Must be a non-empty string.</li><li><b>ip</b> – Required. String, min 7 / max 45 characters (IPv4 or IPv6 address of the client).</li><li><b>email</b> – Required. Valid email address. Min 7, max 100 characters.</li><li><b>token</b> – Required. The session token to invalidate.</li></ul>",
                        "operationId": "executeLogout",
                        "parameters": [
                            {
                                "in": "path",
                                "name": "email",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            },
                            {
                                "in": "path",
                                "name": "sessionToken",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            }
                        ],
                        "requestBody": {
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "string"
                                    }
                                }
                            },
                            "required": true
                        },
                        "responses": {
                            "200": {
                                "description": "Logout executed successfully. The frontend should close the login modal."
                            },
                            "400": {
                                "content": {},
                                "description": "Invalid email format. The frontend should display a generic system error."
                            },
                            "404": {
                                "description": "User is not logged in. The frontend should close the login modal."
                            },
                            "405": {
                                "description": "Method Not Allowed"
                            },
                            "422": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "Unprocessable Entity"
                            }
                        },
                        "summary": "Execute logout",
                        "tags": [
                            "Login"
                        ]
                    },
                    "get": {
                        "description": "When does it occur? When the frontend needs to confirm that an existing session is still active. What does it do? Verifies the combination of email (path) + session token against the active session registry.<br/><br/><b>Path variables:</b><ul><li><b>email</b> – Required. Valid email address. Format: ^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$. Min 7, max 100 characters.</li><li><b>sessionToken</b> – Required. Must be exactly 8 characters.</li></ul>",
                        "operationId": "validateLogin",
                        "parameters": [
                            {
                                "in": "path",
                                "name": "email",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            },
                            {
                                "in": "path",
                                "name": "sessionToken",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            }
                        ],
                        "responses": {
                            "200": {
                                "description": "Session is valid."
                            },
                            "400": {
                                "description": "Invalid email format. The frontend should display a generic system error."
                            },
                            "401": {
                                "description": "Session token is invalid or expired."
                            },
                            "405": {
                                "description": "Method Not Allowed"
                            },
                            "422": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "Unprocessable Entity"
                            }
                        },
                        "summary": "Validate session token",
                        "tags": [
                            "Login"
                        ]
                    }
                }
            },
            "servers": [
                {
                    "description": "Generated server url",
                    "url": "http://localhost:8082"
                }
            ],
            "tags": [
                {
                    "description": "Tickets the user opens from the contact us modal: bugs, compliments, criticisms, suggestions, comments and questions.",
                    "name": "Contact us"
                },
                {
                    "description": "Read of the groups of jn_grouper by their primary key: parent name, child name and parent id.",
                    "name": "Grouper"
                },
                {
                    "description": "Login controls for token and password registration, pre-registration, and various lock management flows such as: token lock, password lock, and token unlock requests.",
                    "name": "Login"
                }
            ]
        },
        "swaggerUrl": "http://localhost:8082/swagger-ui-custom.html",
        "title": "Swagger do JS"
    },
    {
        "endpoints": 22,
        "spec": {
            "components": {},
            "info": {
                "description": "REST API for the VIS module: resume management, recruiters, companies and skills.",
                "title": "JobsNow VIS API",
                "version": "1.0"
            },
            "openapi": "3.0.1",
            "paths": {
                "/companies/search/autocomplete/{search}": {
                    "get": {
                        "description": "When does it occur? When the user starts typing a company name and the frontend needs autocomplete suggestions. What does it do? Returns, in alphabetical order, the companies whose names start with the given prefix (case-insensitive). A company is the first part of the e-mail domain of a recruiter with a professional domain (a public webmail provider is no company), capitalized.<br/><br/><b>Path variables:</b><ul><li><b>search</b> – Required. Company name prefix. Min 3, max 50 characters. The comparison ignores case; a search with no match comes back as typed.</li></ul>",
                        "operationId": "searchCompaniesByTheirFirstThreeInitials",
                        "parameters": [
                            {
                                "in": "path",
                                "name": "search",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            }
                        ],
                        "responses": {
                            "200": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "example": {
                                                "companies": [
                                                    "Globo",
                                                    "Google"
                                                ]
                                            },
                                            "type": "string"
                                        }
                                    }
                                },
                                "description": "List of companies matching the given prefix. If no matches are found, the list contains the search term itself."
                            },
                            "400": {
                                "description": "Bad Request"
                            },
                            "405": {
                                "description": "Method Not Allowed"
                            },
                            "422": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "Unprocessable Entity"
                            }
                        },
                        "summary": "Search companies by name prefix (autocomplete)",
                        "tags": [
                            "Companies"
                        ]
                    }
                },
                "/recruiter-email-link/alias": {
                    "post": {
                        "description": "When does it occur? When the recruiter, after opening a resume of the e-mail, clicks \"save view\". What does it do? Saves the alias the recruiter gave to the resume: the system does not keep the resume in a readable form, so the next e-mails show the resume by this alias.<br/><br/><b>Request body fields (JSON):</b><ul><li><b>email</b> – Required. The recruiter's e-mail, as in the link.</li><li><b>resumeId</b> – Required. The id of the resume, as in the link.</li><li><b>token</b> – Required. The signature of the link.</li><li><b>alias</b> – Required. The alias of the resume. Min 5, max 200 characters.</li></ul>",
                        "operationId": "saveAlias",
                        "parameters": [],
                        "requestBody": {
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "additionalProperties": {
                                            "type": "object"
                                        },
                                        "type": "object"
                                    }
                                }
                            },
                            "required": true
                        },
                        "responses": {
                            "200": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "Alias saved."
                            },
                            "400": {
                                "description": "Bad Request"
                            },
                            "401": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "The link was not signed for this recruiter and resume."
                            },
                            "404": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "The resume is no longer active."
                            },
                            "405": {
                                "description": "Method Not Allowed"
                            },
                            "422": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "Validation error — one or more required fields are missing or contain invalid values."
                            }
                        },
                        "summary": "Save the alias of a resume of the e-mail",
                        "tags": [
                            "Recruiter Resumes"
                        ]
                    }
                },
                "/recruiter-email-link/unsubscribe": {
                    "post": {
                        "description": "When does it occur? When the recruiter confirms, in the front end, the link \"click here\" of the question about no longer receiving the e-mail. What does it do? Moves the recruiter to the inactive recruiters; a recruiter already inactive gets the same answer.<br/><br/><b>Request body fields (JSON):</b><ul><li><b>email</b> – Required. The recruiter's e-mail, as in the link.</li><li><b>token</b> – Required. The signature of the link.</li></ul>",
                        "operationId": "unsubscribe",
                        "parameters": [],
                        "requestBody": {
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "additionalProperties": {
                                            "type": "object"
                                        },
                                        "type": "object"
                                    }
                                }
                            },
                            "required": true
                        },
                        "responses": {
                            "200": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "The recruiter no longer receives the e-mail."
                            },
                            "400": {
                                "description": "Bad Request"
                            },
                            "401": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "The link was not signed for this recruiter."
                            },
                            "405": {
                                "description": "Method Not Allowed"
                            },
                            "422": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "Validation error — one or more required fields are missing or contain invalid values."
                            }
                        },
                        "summary": "Stop receiving the e-mail of resumes",
                        "tags": [
                            "Recruiter Resumes"
                        ]
                    }
                },
                "/recruiter-email-link/view-resume": {
                    "post": {
                        "description": "When does it occur? When the recruiter confirms, in the front end, that they want to open a resume of the e-mail of resumes (the confirmation keeps the robots of the e-mail providers, which click every link, from counting as a view). What does it do? Saves the view of the resume by the recruiter (the date of the last view comes from its history) with the alias the recruiter already gave to it, or a suggested one, and answers the LinkedIn of the resume, opened by the front end in a new tab, and the alias.<br/><br/><b>Request body fields (JSON):</b><ul><li><b>email</b> – Required. The recruiter's e-mail, as in the link.</li><li><b>resumeId</b> – Required. The id of the resume, as in the link.</li><li><b>token</b> – Required. The signature of the link.</li></ul>",
                        "operationId": "viewResume",
                        "parameters": [],
                        "requestBody": {
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "additionalProperties": {
                                            "type": "object"
                                        },
                                        "type": "object"
                                    }
                                }
                            },
                            "required": true
                        },
                        "responses": {
                            "200": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "example": {
                                                "alias": "JAVA_SPRING_SQL_R$ 9.000,00_São Paulo – SP_12 Anos",
                                                "linkedinAddress": "https://www.linkedin.com/in/someone"
                                            },
                                            "type": "string"
                                        }
                                    }
                                },
                                "description": "View saved."
                            },
                            "400": {
                                "description": "Bad Request"
                            },
                            "401": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "The link was not signed for this recruiter and resume."
                            },
                            "404": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "The resume is no longer active."
                            },
                            "405": {
                                "description": "Method Not Allowed"
                            },
                            "422": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "Validation error — one or more required fields are missing or contain invalid values."
                            }
                        },
                        "summary": "Open a resume of the e-mail",
                        "tags": [
                            "Recruiter Resumes"
                        ]
                    }
                },
                "/recruiter/{email}/resumes-of-the-week": {
                    "get": {
                        "description": "When does it occur? When the logged-in recruiter opens the screen \"see all\" of the e-mail of resumes, which shows only the first 40. What does it do? Answers every resume of the last e-mail of the recruiter, in the order and with the texts of the e-mail. The list is written before the e-mail goes out and kept for a day.<br/><br/><b>Path variables:</b><ul><li><b>email</b> – Required. The logged-in recruiter's e-mail.</li></ul>",
                        "operationId": "getResumesOfTheWeek",
                        "parameters": [
                            {
                                "in": "path",
                                "name": "email",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            }
                        ],
                        "responses": {
                            "200": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "The resumes of the last e-mail."
                            },
                            "400": {
                                "description": "Bad Request"
                            },
                            "401": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "No valid login."
                            },
                            "404": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "No e-mail of resumes for this recruiter in the last day."
                            },
                            "405": {
                                "description": "Method Not Allowed"
                            },
                            "422": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "Unprocessable Entity"
                            }
                        },
                        "summary": "Every resume of the last e-mail",
                        "tags": [
                            "Recruiter Resumes"
                        ]
                    }
                },
                "/recruiter/{email}/viewed-resumes/{month}": {
                    "get": {
                        "description": "When does it occur? When the logged-in recruiter wants to see which resumes they opened in a month. What does it do? Answers, read by id with no query, the list kept by every opening of a resume and every alias given to it: one item per resume, a JSON text (to be parsed by the front end) with the LinkedIn of the resume, the alias and the date and time (dd/MM/yyyy HH:mm:ss) of the last view in that month. A month with no view answers an empty list.<br/><br/><b>Path variables:</b><ul><li><b>email</b> – Required. The logged-in recruiter's e-mail.</li><li><b>month</b> – Required. The month, as yyyyMM (for example, 202610).</li></ul>",
                        "operationId": "getViewedResumesOfTheMonth",
                        "parameters": [
                            {
                                "in": "path",
                                "name": "email",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            },
                            {
                                "in": "path",
                                "name": "month",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            }
                        ],
                        "responses": {
                            "200": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "example": {
                                                "month": "202610",
                                                "viewedResume": [
                                                    "{\"alias\":\"Dev Java sênior\",\"date\":\"21/10/2026 14:05:31\",\"linkedin\":\"https://www.linkedin.com/in/someone\"}"
                                                ]
                                            },
                                            "type": "string"
                                        }
                                    }
                                },
                                "description": "The resumes viewed in the month."
                            },
                            "400": {
                                "description": "Bad Request"
                            },
                            "401": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "No valid login."
                            },
                            "405": {
                                "description": "Method Not Allowed"
                            },
                            "422": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "Validation error — the month is not in the format yyyyMM."
                            }
                        },
                        "summary": "The resumes viewed in a month",
                        "tags": [
                            "Recruiter Resumes"
                        ]
                    }
                },
                "/recruiter/{email}/viewed-resumes/{month}/details": {
                    "post": {
                        "description": "When does it occur? When the logged-in recruiter clicks \"ver detalhes\" in a line of the screen of the resumes viewed in a month. What does it do? Finds, read by id with no query, the e-mails whose resumes use the LinkedIn and answers each active resume as a row of the e-mail of resumes (what matters and regions, languages and skills, role and other information), without the dates of insertion and of last change, which only the history of the resume has. Only resumes the recruiter viewed in that month are answered.<br/><br/><b>Path variables:</b><ul><li><b>email</b> – Required. The logged-in recruiter's e-mail.</li><li><b>month</b> – Required. The month of the view, as yyyyMM (for example, 202610).</li></ul><b>Request body fields (JSON):</b><ul><li><b>linkedin</b> – Required. The LinkedIn of the viewed resume, as the list of the views shows it.</li></ul>",
                        "operationId": "getViewedResumeDetails",
                        "parameters": [
                            {
                                "in": "path",
                                "name": "email",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            },
                            {
                                "in": "path",
                                "name": "month",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            }
                        ],
                        "requestBody": {
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "string"
                                    }
                                }
                            },
                            "required": true
                        },
                        "responses": {
                            "200": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "example": {
                                                "linkedin": "https://www.linkedin.com/in/someone",
                                                "resumes": [
                                                    {
                                                        "defaultAlias": "JAVA_...",
                                                        "job": [
                                                            "Desenvolvedor"
                                                        ],
                                                        "languagesAndSkills": [
                                                            "JAVA"
                                                        ],
                                                        "otherInformation": [
                                                            "PCD: não"
                                                        ],
                                                        "regions": [
                                                            "São Paulo – SP"
                                                        ],
                                                        "resumeId": "...",
                                                        "whatMatters": [
                                                            "CLT: R$ 9.000,00"
                                                        ]
                                                    }
                                                ]
                                            },
                                            "type": "string"
                                        }
                                    }
                                },
                                "description": "The rows of the active resumes that use the LinkedIn (empty when none is active anymore)."
                            },
                            "400": {
                                "description": "Bad Request"
                            },
                            "401": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "No valid login."
                            },
                            "404": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "The LinkedIn is not among the views of the recruiter in the month."
                            },
                            "405": {
                                "description": "Method Not Allowed"
                            },
                            "422": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "Validation error — the month is not in the format yyyyMM or the LinkedIn is not a LinkedIn profile address."
                            }
                        },
                        "summary": "The details of a viewed resume",
                        "tags": [
                            "Recruiter Resumes"
                        ]
                    }
                },
                "/resume/{email}": {
                    "get": {
                        "description": "When does it occur? When the candidate or the system needs to retrieve the candidate's resume. What does it do? Returns the resume data from either the active or inactive entity, whichever has a record.<br/><br/><b>Path variables:</b><ul><li><b>email</b> – Required. Candidate's email address.</li></ul>",
                        "operationId": "getData",
                        "parameters": [
                            {
                                "in": "path",
                                "name": "email",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            }
                        ],
                        "responses": {
                            "200": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "example": {},
                                            "type": "string"
                                        }
                                    }
                                },
                                "description": "Resume data returned successfully."
                            },
                            "400": {
                                "description": "Bad Request"
                            },
                            "404": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "No resume found for the given email."
                            },
                            "405": {
                                "description": "Method Not Allowed"
                            },
                            "422": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "Unprocessable Entity"
                            }
                        },
                        "summary": "Get resume data",
                        "tags": [
                            "Resume"
                        ]
                    }
                },
                "/resume/{email}/language/{language}": {
                    "delete": {
                        "description": "When does it occur? When the candidate wants to permanently remove their resume. What does it do? Deletes every data of the resume for good, whether it is active or inactive, takes it out of the searches and e-mails the candidate.<br/><br/><b>Path variables:</b><ul><li><b>email</b> – Required. Candidate's email address.</li><li><b>language</b> – Required. Language of the resume to delete.</li></ul>",
                        "operationId": "delete",
                        "parameters": [
                            {
                                "in": "path",
                                "name": "email",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            },
                            {
                                "in": "path",
                                "name": "language",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            }
                        ],
                        "requestBody": {
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "additionalProperties": {
                                            "type": "object"
                                        },
                                        "type": "object"
                                    }
                                }
                            },
                            "required": true
                        },
                        "responses": {
                            "200": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "example": {},
                                            "type": "string"
                                        }
                                    }
                                },
                                "description": "Resume deleted successfully."
                            },
                            "400": {
                                "description": "Bad Request"
                            },
                            "405": {
                                "description": "Method Not Allowed"
                            },
                            "422": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "Unprocessable Entity"
                            }
                        },
                        "summary": "Delete a resume",
                        "tags": [
                            "Resume"
                        ]
                    },
                    "post": {
                        "description": "When does it occur? When the candidate creates or updates their resume in the system. What does it do? Persists the resume data, calculates skill hashes, and triggers sending the resume to matching recruiters.<br/><br/><b>Path variables:</b><ul><li><b>email</b> – Required. Candidate's email address. Valid email format, min 7, max 100 characters.</li><li><b>language</b> – Required. Language of the resume content.</li></ul><b>Request body fields (JSON):</b><ul><li><b>disponibility</b> – Required. Non-negative integer, max 30 (days available per month).</li><li><b>ddd</b> – Required array. Brazilian area codes of interest. Min 1, max 67 items. Accepted values: 11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 28, 31–35, 37, 38, 41–49, 51, 53–55, 61–69, 71, 73–75, 77, 79, 81–89, 91–99.</li><li><b>desiredJob</b> – Required. String, min 2, max 50 characters.</li><li><b>experience</b> – Required. Years of professional experience, non-negative integer, max 70 (0 for a first job); it is stored as the year the experience started (current year minus these years).</li><li><b>linkedinAddress</b> – Required. Must be a valid LinkedIn profile URL (format: https://www.linkedin.com/in/username).</li><li><b>resumeType</b> – Required. Non-negative integer. Accepted values: 1, 2, 3, 4.</li><li><b>temporallyJobTime</b> – Required. Non-negative integer, max 12 (months available for temporary work).</li><li><b>pj</b> or <b>clt</b> – At least one is required. Contract type salary expectations, between 1,000 and 100,000; a contract type the candidate does not accept is left out.</li><li><b>btc</b> – Optional. BTC contract value, between 1,000 and 100,000.</li><li><b>skill</b> – Optional array of skill objects. Each skill must contain:<ul>  <li><b>skill</b> – Required. Skill identifier. Min 2, max 50 characters.</li>  <li><b>word</b> – Required. Skill keyword as found in the text. Min 2, max 50 characters.</li>  <li><b>category</b> – Required. The list the skill belongs to: skillsFromText, excludedSkills, parent or discardedSkills.</li>  <li><b>type</b> – Required. skillsFromResume for the category skillsFromText, the same as the category for excludedSkills and parent, or, for discardedSkills, the reason of the discard: isPieceOfOtherWord, isPieceOfOtherSkill or skillAlreadyAdded.</li>  <li><b>parent</b> – Optional array. Parent skill identifiers. Min 2, max 50 characters each.</li>  <li><b>associated</b> – Optional. Associated skill name. Min 2, max 50 characters.</li></ul></li><li><b>spokenLanguage</b> – Optional array of language objects. Each must contain:<ul>  <li><b>name</b> – String, min 3, max 20 characters.</li>  <li><b>level</b> – Non-negative integer. Accepted values: 1 (intermediate), 2 (fluent).</li>  <li><b>id</b> – Ignored: it is dropped before the resume is stored.</li></ul></li><li><b>lastJob</b> – Optional. Last job title. Min 2, max 50 characters.</li><li><b>notAllowedCompany</b> – Optional array. Company names to exclude. Min 2, max 50 characters each.</li><li><b>pcd</b> – Optional. Boolean. True if the candidate has a disability.</li><li><b>negotiableClaim</b> – Optional. Boolean. True if salary is negotiable.</li><li><b>travel</b> – Optional. Boolean. True if the candidate is available to travel.</li></ul>",
                        "operationId": "save",
                        "parameters": [
                            {
                                "in": "path",
                                "name": "email",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            },
                            {
                                "in": "path",
                                "name": "language",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            }
                        ],
                        "requestBody": {
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "additionalProperties": {
                                            "type": "object"
                                        },
                                        "type": "object"
                                    }
                                }
                            },
                            "required": true
                        },
                        "responses": {
                            "200": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "example": {},
                                            "type": "string"
                                        }
                                    }
                                },
                                "description": "Resume saved successfully."
                            },
                            "400": {
                                "description": "Validation error — one or more required fields are missing or contain invalid values."
                            },
                            "405": {
                                "description": "Method Not Allowed"
                            },
                            "422": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "Unprocessable Entity"
                            }
                        },
                        "summary": "Save (create or update) a resume",
                        "tags": [
                            "Resume"
                        ]
                    }
                },
                "/resume/{email}/language/{language}/status": {
                    "delete": {
                        "description": "When does it occur? When the candidate wants to hide their resume for a while, or show it again. What does it do? Toggles the status: an active resume is deactivated (moved to the inactive entity and taken out of the searches) and an inactive one is reactivated (moved back and put in the searches again). The candidate is e-mailed either way.<br/><br/><b>Path variables:</b><ul><li><b>email</b> – Required. Candidate's email address.</li><li><b>language</b> – Required. Language of the resume.</li></ul>",
                        "operationId": "changeStatus",
                        "parameters": [
                            {
                                "in": "path",
                                "name": "email",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            },
                            {
                                "in": "path",
                                "name": "language",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            }
                        ],
                        "requestBody": {
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "additionalProperties": {
                                            "type": "object"
                                        },
                                        "type": "object"
                                    }
                                }
                            },
                            "required": true
                        },
                        "responses": {
                            "200": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "example": {},
                                            "type": "string"
                                        }
                                    }
                                },
                                "description": "Resume deactivated or reactivated successfully."
                            },
                            "400": {
                                "description": "Bad Request"
                            },
                            "404": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "The candidate has no resume, active or inactive."
                            },
                            "405": {
                                "description": "Method Not Allowed"
                            },
                            "422": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "Unprocessable Entity"
                            }
                        },
                        "summary": "Change resume status (deactivate or reactivate)",
                        "tags": [
                            "Resume"
                        ]
                    }
                },
                "/resume/{email}/skills/hierarchy": {
                    "delete": {
                        "description": "When does it occur? When the candidate gives up a suggestion that is still pending review. What does it do? Deletes the candidate's pending suggestion for that parent and type. Fulfiled suggestions are the review history and are not affected.<br/><br/><b>Path variables:</b><ul><li><b>email</b> – Required. Candidate's email address. Valid email address (format: user@domain.ext), min 7, max 100 characters.</li></ul><b>Request body fields (JSON):</b><ul><li><b>parent</b> – Required. The implicit knowledge shown as the accordion title. Min 2, max 50 characters.</li><li><b>type</b> – Required. Accepted values: 'add', 'remove'.</li></ul>",
                        "operationId": "deleteHierarchyFixSuggestion",
                        "parameters": [
                            {
                                "in": "path",
                                "name": "email",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            }
                        ],
                        "requestBody": {
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "additionalProperties": {
                                            "type": "object"
                                        },
                                        "type": "object"
                                    }
                                }
                            },
                            "required": true
                        },
                        "responses": {
                            "200": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "Pending suggestion withdrawn."
                            },
                            "400": {
                                "description": "Bad Request"
                            },
                            "404": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "The candidate has no pending suggestion for this parent and type (it may have been reviewed meanwhile)."
                            },
                            "405": {
                                "description": "Method Not Allowed"
                            },
                            "422": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "Validation error — one or more required fields are missing or contain invalid values."
                            }
                        },
                        "summary": "Withdraw a pending skill hierarchy fix suggestion",
                        "tags": [
                            "Skill Hierarchy Fix"
                        ]
                    },
                    "post": {
                        "description": "When does it occur? When the candidate, reviewing the implicit knowledge inferred from their resume, believes a skill should be added to an implicit knowledge (it depends on it but is not listed) or removed from it (it is listed but does not depend on it). What does it do? Records the suggestion as pending review. Support and the candidate are notified, and, once support reviews it (approving, rejecting or deciding each skill), the suggestion is moved to fulfiled. The suggestion is identified by the candidate's email, the parent and the type: a new suggestion from the same candidate for the same parent and type replaces the previous one.<br/><br/><b>Path variables:</b><ul><li><b>email</b> – Required. Candidate's email address. Valid email address (format: user@domain.ext), min 7, max 100 characters.</li></ul><b>Request body fields (JSON):</b><ul><li><b>parent</b> – Required. The implicit knowledge shown as the accordion title. Min 2, max 50 characters.</li><li><b>skill</b> – Required array. The resume skills to add to or remove from the parent. Min 2, max 50 characters each.</li><li><b>type</b> – Required. Accepted values: 'add', 'remove'.</li><li><b>description</b> – Required. The candidate's explanation for the suggestion. Min 10, max 500 characters.</li></ul>",
                        "operationId": "saveHierarchyFixSuggestion",
                        "parameters": [
                            {
                                "in": "path",
                                "name": "email",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            }
                        ],
                        "requestBody": {
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "additionalProperties": {
                                            "type": "object"
                                        },
                                        "type": "object"
                                    }
                                }
                            },
                            "required": true
                        },
                        "responses": {
                            "200": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "example": {
                                                "description": "Oracle is a relational database queried with SQL.",
                                                "parent": "SQL",
                                                "skill": [
                                                    "ORACLE",
                                                    "MYSQL"
                                                ],
                                                "type": "add"
                                            },
                                            "type": "string"
                                        }
                                    }
                                },
                                "description": "Suggestion saved as pending review."
                            },
                            "208": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "alreadyReviewed — every skill of the suggestion was already reviewed for this parent and type. Nothing stays pending: the request is complete and the candidate is told by e-mail."
                            },
                            "400": {
                                "description": "Bad Request"
                            },
                            "403": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "userNotAllowed — support chose to ignore this candidate's skill hierarchy fix suggestions. The suggestion is not saved and nobody is notified."
                            },
                            "405": {
                                "description": "Method Not Allowed"
                            },
                            "409": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "The candidate already has a pending suggestion for this parent and type."
                            },
                            "422": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "Validation error — one or more required fields are missing or contain invalid values."
                            },
                            "429": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "dailyLimitReached — the candidate already sent a skill hierarchy fix suggestion today. One per day: each one e-mails the candidate and opens a ticket to the support operator."
                            }
                        },
                        "summary": "Suggest a skill hierarchy fix",
                        "tags": [
                            "Skill Hierarchy Fix"
                        ]
                    }
                },
                "/resume/{email}/skills/hierarchy/search": {
                    "post": {
                        "description": "When does it occur? When the candidate opens the add or remove modal of an implicit knowledge. What does it do? Returns the candidate's suggestion for that parent and type, looking first in pending, then in fulfiled, and adds a <b>status</b> field telling where it was found. Fulfiled suggestions also carry the reviewer's <b>explanation</b>. Returns an empty object when the candidate has no suggestion for that parent and type. It is a POST, not a GET, because the session filter only validates the login when the request has a body.<br/><br/><b>Path variables:</b><ul><li><b>email</b> – Required. Candidate's email address. Valid email address (format: user@domain.ext), min 7, max 100 characters.</li></ul><b>Request body fields (JSON):</b><ul><li><b>parent</b> – Required. The implicit knowledge shown as the accordion title. Min 2, max 50 characters.</li><li><b>type</b> – Required. Accepted values: 'add', 'remove'.</li></ul>",
                        "operationId": "getHierarchyFixSuggestion",
                        "parameters": [
                            {
                                "in": "path",
                                "name": "email",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            }
                        ],
                        "requestBody": {
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "additionalProperties": {
                                            "type": "object"
                                        },
                                        "type": "object"
                                    }
                                }
                            },
                            "required": true
                        },
                        "responses": {
                            "200": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "example": {
                                                "description": "Oracle and MySQL are relational databases queried with SQL.",
                                                "email": "candidate@domain.com",
                                                "explanation": "Both depend on SQL.",
                                                "parent": "SQL",
                                                "skill": [
                                                    "ORACLE",
                                                    "MYSQL"
                                                ],
                                                "status": "fulfiled",
                                                "type": "add"
                                            },
                                            "type": "string"
                                        }
                                    }
                                },
                                "description": "The suggestion with its status ('pending' or 'fulfiled'), or an empty object when there is none."
                            },
                            "400": {
                                "description": "Bad Request"
                            },
                            "405": {
                                "description": "Method Not Allowed"
                            },
                            "422": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "Validation error — one or more required fields are missing or contain invalid values."
                            }
                        },
                        "summary": "Get the candidate's skill hierarchy fix suggestion",
                        "tags": [
                            "Skill Hierarchy Fix"
                        ]
                    }
                },
                "/resume/{email}/skills/suggestion": {
                    "delete": {
                        "description": "When does it occur? When the candidate gives up a suggestion that is still pending review. What does it do? Deletes the candidate's pending suggestion of that skill. Reviewed suggestions (approved or rejected) are the review history and are not affected.<br/><br/><b>Path variables:</b><ul><li><b>email</b> – Required. Candidate's email address. Valid email address (format: user@domain.ext), min 7, max 100 characters.</li></ul><b>Request body fields (JSON):</b><ul><li><b>skill</b> – Required. The suggested skill. Min 2, max 50 characters.</li></ul>",
                        "operationId": "deleteSkillSuggestion",
                        "parameters": [
                            {
                                "in": "path",
                                "name": "email",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            }
                        ],
                        "requestBody": {
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "additionalProperties": {
                                            "type": "object"
                                        },
                                        "type": "object"
                                    }
                                }
                            },
                            "required": true
                        },
                        "responses": {
                            "200": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "Pending suggestion withdrawn."
                            },
                            "400": {
                                "description": "Bad Request"
                            },
                            "404": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "The candidate has no pending suggestion of this skill (it may have been reviewed meanwhile)."
                            },
                            "405": {
                                "description": "Method Not Allowed"
                            },
                            "422": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "Validation error — one or more required fields are missing or contain invalid values."
                            }
                        },
                        "summary": "Withdraw a pending skill suggestion",
                        "tags": [
                            "Skill Suggestion"
                        ]
                    },
                    "post": {
                        "description": "When does it occur? When the candidate, reviewing the skills read from their resume, notices that a skill written in the resume was not listed. What does it do? Records the suggestion as pending review. Support and the candidate are notified, and, once support reviews it, the suggestion is moved to approved (the skill starts being recognized in the resumes) or to rejected, always with support's explanation. The suggestion is identified by the candidate's email and the skill.<br/><br/><b>Path variables:</b><ul><li><b>email</b> – Required. Candidate's email address. Valid email address (format: user@domain.ext), min 7, max 100 characters.</li></ul><b>Request body fields (JSON):</b><ul><li><b>skill</b> – Required. The suggested skill. Min 2, max 50 characters.</li><li><b>synonym</b> – Optional array. Other names of the same skill. Min 2, max 50 characters each.</li><li><b>description</b> – Required. The candidate's explanation for the suggestion. Min 10, max 500 characters.</li></ul>",
                        "operationId": "saveSkillSuggestion",
                        "parameters": [
                            {
                                "in": "path",
                                "name": "email",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            }
                        ],
                        "requestBody": {
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "additionalProperties": {
                                            "type": "object"
                                        },
                                        "type": "object"
                                    }
                                }
                            },
                            "required": true
                        },
                        "responses": {
                            "200": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "example": {
                                                "description": "I built two mobile apps with React Native, as written in my experience section.",
                                                "skill": "REACT NATIVE",
                                                "synonym": [
                                                    "REACTNATIVE",
                                                    "RN"
                                                ]
                                            },
                                            "type": "string"
                                        }
                                    }
                                },
                                "description": "Suggestion saved as pending review."
                            },
                            "400": {
                                "description": "Bad Request"
                            },
                            "403": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "userNotAllowed — support chose to ignore this candidate's skill suggestions. The suggestion is not saved and nobody is notified."
                            },
                            "405": {
                                "description": "Method Not Allowed"
                            },
                            "409": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "The candidate already has a pending suggestion of this skill."
                            },
                            "410": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "alreadyRejected — support already rejected this skill suggested by this candidate; the rejection is final. alreadyReviewed — support already approved or rejected this skill suggested by another candidate; the decision holds for everyone and is returned by the search."
                            },
                            "412": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "skillAlreadyExists — the system already knows this skill, by its name or as a synonym of another skill."
                            },
                            "422": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "Validation error — one or more required fields are missing or contain invalid values."
                            },
                            "429": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "dailyLimitReached — the candidate already suggested a skill today. One suggestion per day: each one e-mails the candidate and opens a ticket to the support operator."
                            }
                        },
                        "summary": "Suggest a skill",
                        "tags": [
                            "Skill Suggestion"
                        ]
                    }
                },
                "/resume/{email}/skills/suggestion/search": {
                    "post": {
                        "description": "When does it occur? When the candidate types, in the suggestion modal, a skill they may have suggested before. What does it do? Returns the candidate's suggestion of that skill, looking first in pending, then in approved and in rejected, and adds a <b>status</b> field telling where it was found. Reviewed suggestions also carry support's <b>explanation</b>. When the candidate has no suggestion of that skill, returns the decision support took on the same skill suggested by another candidate (skill, synonym, status and explanation only). Returns an empty object when nobody suggested that skill. It is a POST, not a GET, because the session filter only validates the login when the request has a body.<br/><br/><b>Path variables:</b><ul><li><b>email</b> – Required. Candidate's email address. Valid email address (format: user@domain.ext), min 7, max 100 characters.</li></ul><b>Request body fields (JSON):</b><ul><li><b>skill</b> – Required. The suggested skill. Min 2, max 50 characters.</li></ul>",
                        "operationId": "getSkillSuggestion",
                        "parameters": [
                            {
                                "in": "path",
                                "name": "email",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            }
                        ],
                        "requestBody": {
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "additionalProperties": {
                                            "type": "object"
                                        },
                                        "type": "object"
                                    }
                                }
                            },
                            "required": true
                        },
                        "responses": {
                            "200": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "example": {
                                                "description": "I built two mobile apps with React Native, as written in my experience section.",
                                                "email": "candidate@domain.com",
                                                "explanation": "React Native is a widely used mobile framework.",
                                                "skill": "REACT NATIVE",
                                                "status": "approved",
                                                "synonym": [
                                                    "REACTNATIVE",
                                                    "RN"
                                                ]
                                            },
                                            "type": "string"
                                        }
                                    }
                                },
                                "description": "The suggestion with its status ('pending', 'approved' or 'rejected'), or an empty object when there is none."
                            },
                            "400": {
                                "description": "Bad Request"
                            },
                            "405": {
                                "description": "Method Not Allowed"
                            },
                            "422": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "Validation error — one or more required fields are missing or contain invalid values."
                            }
                        },
                        "summary": "Get the candidate's suggestion of a skill",
                        "tags": [
                            "Skill Suggestion"
                        ]
                    }
                },
                "/resume/{email}/viewers/{month}": {
                    "get": {
                        "description": "When does it occur? When the logged-in candidate opens the screen \"Quem me viu\" and chooses a month (the current one by default). What does it do? Answers, read by id with no query, the domain of the e-mail of each recruiter who viewed the resume for the first time in that month, with how many recruiters of the domain did it, from the most viewed to the least. Each recruiter counts once per resume, in the month of the first view. A month with no view answers an empty list.<br/><br/><b>Path variables:</b><ul><li><b>email</b> – Required. The logged-in candidate's e-mail.</li><li><b>month</b> – Required. The month, as yyyyMM (for example, 202610).</li></ul>",
                        "operationId": "getViewersOfTheMonth",
                        "parameters": [
                            {
                                "in": "path",
                                "name": "email",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            },
                            {
                                "in": "path",
                                "name": "month",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            }
                        ],
                        "responses": {
                            "200": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "example": {
                                                "month": "202610",
                                                "viewers": [
                                                    {
                                                        "domain": "empresa.com.br",
                                                        "views": 2
                                                    },
                                                    {
                                                        "domain": "consultoria.com",
                                                        "views": 1
                                                    }
                                                ]
                                            },
                                            "type": "string"
                                        }
                                    }
                                },
                                "description": "The domains that viewed the resume in the month."
                            },
                            "400": {
                                "description": "Bad Request"
                            },
                            "401": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "No valid login."
                            },
                            "405": {
                                "description": "Method Not Allowed"
                            },
                            "422": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "Validation error — the month is not in the format yyyyMM."
                            }
                        },
                        "summary": "The domains that viewed the resume in a month",
                        "tags": [
                            "Resume"
                        ]
                    }
                },
                "/skills/fromText": {
                    "post": {
                        "description": "When does it occur? When the frontend needs to identify relevant skills from a block of text (e.g., a job description or resume summary). What does it do? Parses the text and returns a list of recognized skills along with discarded matches.<br/><br/><b>Request body fields (JSON):</b><ul><li><b>text</b> – Required. The text to extract skills from. Allows empty string. Max 5,000,000 characters.</li><li><b>excludedSkill</b> – Optional array. Skills to exclude from the result. Each item must contain:<ul>  <li><b>skill</b> – Required. Skill identifier. Min 2, max 50 characters.</li>  <li><b>word</b> – Required. Word as found in text. Min 2, max 50 characters.</li></ul></li></ul>",
                        "operationId": "getSkillsFromText",
                        "parameters": [],
                        "requestBody": {
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "additionalProperties": {
                                            "type": "object"
                                        },
                                        "type": "object"
                                    }
                                }
                            },
                            "required": true
                        },
                        "responses": {
                            "200": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "example": {
                                                "discardedSkills": {},
                                                "excludedSkill": [],
                                                "skill": [
                                                    {
                                                        "label": "Java",
                                                        "parent": [],
                                                        "skill": "Java",
                                                        "word": "Java"
                                                    }
                                                ]
                                            },
                                            "type": "string"
                                        }
                                    }
                                },
                                "description": "Skills extracted successfully. Returns matched skills, discarded matches, and the excluded list."
                            },
                            "400": {
                                "description": "Bad Request"
                            },
                            "405": {
                                "description": "Method Not Allowed"
                            },
                            "422": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "Unprocessable Entity"
                            }
                        },
                        "summary": "Extract skills from free text",
                        "tags": [
                            "Skills"
                        ]
                    }
                },
                "/statistics/skills/telegramGroups": {
                    "get": {
                        "description": "When does it occur? When the user opens the list of searched groups in the screen of statistics of the skills. What does it do? Returns the links of the Telegram groups whose positions feed the statistics. It takes no parameter and no login is needed.",
                        "operationId": "getTelegramGroups",
                        "parameters": [],
                        "responses": {
                            "200": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "example": {
                                                "groups": [
                                                    "https://t.me/empregossp"
                                                ]
                                            },
                                            "type": "string"
                                        }
                                    }
                                },
                                "description": "The links of the groups."
                            },
                            "400": {
                                "description": "Bad Request"
                            },
                            "405": {
                                "description": "Method Not Allowed"
                            },
                            "422": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "Unprocessable Entity"
                            }
                        },
                        "summary": "The links of the Telegram groups",
                        "tags": [
                            "Skill statistics"
                        ]
                    }
                },
                "/statistics/skills/{seniority}/{ddd}/months": {
                    "get": {
                        "description": "When does it occur? When the user expands a skill in the screen of statistics of the skills. What does it do? Returns the months that have positions with the skill, each one as a JSON text with its total. No login is needed.<br/><br/><b>Path variables:</b><ul><li><b>seniority</b> – Required. One of estag, junior, pleno, senior, especialista or unknown.</li><li><b>ddd</b> – Required. The region: a DDD, 10 for home office or 0 for no DDD.</li></ul><b>Query parameters:</b><ul><li><b>skill</b> – Required. The skill, which goes here because a name may have characters that a path does not accept.</li></ul>",
                        "operationId": "getMonthsOfTheSkill",
                        "parameters": [
                            {
                                "in": "path",
                                "name": "ddd",
                                "required": true,
                                "schema": {
                                    "format": "int32",
                                    "type": "integer"
                                }
                            },
                            {
                                "in": "path",
                                "name": "seniority",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            },
                            {
                                "in": "query",
                                "name": "skill",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            }
                        ],
                        "responses": {
                            "200": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "example": {
                                                "months": [
                                                    "{\"total\":5,\"yearMonth\":\"202201\"}"
                                                ]
                                            },
                                            "type": "string"
                                        }
                                    }
                                },
                                "description": "The months of the skill. With no position, the list is empty."
                            },
                            "400": {
                                "description": "A parameter is not valid."
                            },
                            "405": {
                                "description": "Method Not Allowed"
                            },
                            "422": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "Unprocessable Entity"
                            }
                        },
                        "summary": "The months of a skill in a region and seniority",
                        "tags": [
                            "Skill statistics"
                        ]
                    }
                },
                "/statistics/skills/{yearMonth}/{seniority}/{ddd}": {
                    "get": {
                        "description": "When does it occur? When the user searches the screen of statistics of the skills. What does it do? Returns how many positions the combination has (each position counted once) and the skills they ask for, each one as a JSON text with its total. No login is needed.<br/><br/><b>Path variables:</b><ul><li><b>yearMonth</b> – Required. The month, as yyyyMM.</li><li><b>seniority</b> – Required. One of estag, junior, pleno, senior, especialista or unknown.</li><li><b>ddd</b> – Required. The region: a DDD, 10 for home office or 0 for no DDD.</li></ul>",
                        "operationId": "getSkillsOfTheMonth",
                        "parameters": [
                            {
                                "in": "path",
                                "name": "ddd",
                                "required": true,
                                "schema": {
                                    "format": "int32",
                                    "type": "integer"
                                }
                            },
                            {
                                "in": "path",
                                "name": "seniority",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            },
                            {
                                "in": "path",
                                "name": "yearMonth",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            }
                        ],
                        "responses": {
                            "200": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "example": {
                                                "skills": [
                                                    "{\"skill\":\"JAVA\",\"total\":5}"
                                                ],
                                                "total": 12
                                            },
                                            "type": "string"
                                        }
                                    }
                                },
                                "description": "The total and the skills. With no position, the total is 0 and the list is empty."
                            },
                            "400": {
                                "description": "A path variable is not valid."
                            },
                            "405": {
                                "description": "Method Not Allowed"
                            },
                            "422": {
                                "content": {
                                    "*/*": {
                                        "schema": {
                                            "additionalProperties": {
                                                "type": "object"
                                            },
                                            "type": "object"
                                        }
                                    }
                                },
                                "description": "Unprocessable Entity"
                            }
                        },
                        "summary": "The skills of a month, region and seniority",
                        "tags": [
                            "Skill statistics"
                        ]
                    }
                }
            },
            "servers": [
                {
                    "description": "Generated server url",
                    "url": "http://localhost:8081"
                }
            ],
            "tags": [
                {
                    "description": "Operations for searching and managing companies in the VIS module.",
                    "name": "Companies"
                },
                {
                    "description": "The daily e-mail of resumes to the recruiters: opening a resume, giving it an alias, unsubscribing and seeing every resume of the last e-mail.",
                    "name": "Recruiter Resumes"
                },
                {
                    "description": "Operations for managing candidate resumes: save, delete, status change, and data retrieval.",
                    "name": "Resume"
                },
                {
                    "description": "Suggestions from candidates to add or remove skills from the implicit knowledge they depend on.",
                    "name": "Skill Hierarchy Fix"
                },
                {
                    "description": "Suggestions from candidates of skills that are in their resumes and that the system does not know yet.",
                    "name": "Skill Suggestion"
                },
                {
                    "description": "How many positions announced in Telegram ask for each skill.",
                    "name": "Skill statistics"
                },
                {
                    "description": "Operations for managing professional skills: extraction from text and creation requests.",
                    "name": "Skills"
                }
            ]
        },
        "swaggerUrl": "http://localhost:8081/swagger-ui.html",
        "title": "Swagger do VIS"
    }
];
