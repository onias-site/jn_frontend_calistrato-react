export const serverRequests = (state: any) => {
    const notifyAboutLoginConflict = () =>
        state.showModal(
            'SavePassword',
            'Desbloqueie seu login',
            null,
            'Já há um login corrente em sua conta, pode ser que você não tenha feito a saída em seu último login, ou se trata de algum acesso concorrente em sua conta em outra estação de trabalho. De qualquer forma, preencha os campos deste formulário para desfazer o outro login corrente'
        );

    const notifyAboutLockedPassword = () =>
        state.showModal(
            'SavePassword',
            'Desbloqueie a sua senha',
            null,
            'Devido a tentativas de acessos suspeitos, sua senha foi preventivamente bloqueada. Preencha os campos acima, para desbloqueá-la.'
        );
    const notifyAboutAlreadySentToken = (response: any) => {
        state.setLockedToken(false);
        state.setInvalid(false);
        state.showModal(
            'SavePassword',
           state.title,
            null,
           state.detailMessage ?
           `${state.detailMessage}. Seu token foi enviado ao e-mail '${state.email}' no dia ${response.dateItWasSaved} e expirará no dia ${response.expirationDate}.`
           :  `Seu token foi enviado ao e-mail '${state.email}' no dia ${response.dateItWasSaved} e expirará no dia ${response.expirationDate}.`
        );
    };
    const unlockTokenRequestAlreadySolved = (response: any) =>
        state.setDetailMessage(
            `A solicitação de desbloqueio do token para o e-mail '${state.email}' já foi resolvida na data ${response.dateItWasSaved}, se necessário, poderá ser refeita na data ${response.expirationDate}`
        );
    const resendTokenRequestAlreadySolved = (response: any) =>
        state.setDetailMessage(
            `A solicitação de reenvio do token para o e-mail '${state.email}' já foi resolvida na data ${response.dateItWasSaved}, se necessário, poderá ser refeita na data ${response.expirationDate}`
        );
    const unlockTokenRequestAlreadyAsked = (response: any) =>
        state.setDetailMessage(
            `A solicitação de desbloqueio do token para o e-mail '${state.email}' já foi feita na data ${response.dateItWasSaved}, se necessário, poderá ser refeita na data ${response.expirationDate}`
        );
    const resendTokenRequestAlreadyAsked = (response: any) =>
        state.setDetailMessage(
            `A solicitação de reenvio do token para o e-mail '${state.email}' já foi feita na data ${response.dateItWasSaved}, se necessário, poderá ser refeita na data ${response.expirationDate}`
        );
    const notifyAboutWrongPassword = (response: any) =>
        state.setDetailMessage(`A senha informada está incorreta, você ainda tem direito a ${3 - response.attempts} tentativa(s)`) || state.setContextField('password', '');
    const notifyAboutWrongToken = (response: any) =>
        state.setDetailMessage(`O token informado está incorreto, você ainda pode tentar mais ${3 - response.attempts} vez(es)`) || state.setContextField('token', '');
    const notifyAboutLoginNotFound = () => state.showModal('RequestEmail', '', null, 'O seu login não foi encontrado, por favor, informe um e-mail');
    const notifyAboutInvalidEmail = () => state.setDetailMessage(`O e-mail '${state.email}' informado é inválido, por favor, informe um e-mail válido`);
    const executeRetryAfterAuthentication = (response: any) => state.executeRetryAfterAuthentication(response);
    const setDetailMessage = (detailMessage: string) => () => state.setDetailMessage(detailMessage);
    const requestFirstPassword = () => state.showModal('SavePassword', '');
    const openModal = (selectedScreen: string) => () => state.showModal(selectedScreen, '');
    const setAttempts = (fieldName: string) => () => {
        state.setDetailMessage('');
        state.context.attempts = state.context.attempts || [];
        const attempt = state.context[fieldName]
        state.context.attempts.push(attempt);
        state.setContextField('attempts', state.context.attempts);
    };
    const lockToken = () => state.setLockedToken(true);
    const notifyAboutNotLockedToken = () => {
        state.setDetailMessage(`O token informado não está bloqueado`);
        state.setLockedToken(false);
        state.setInvalid(false);
    };




    const response = {
        checkEmail: {
            url: `login/${state.email}/token`,
            getBody: () => ({}),
            mappedStatus: {
                tokenRecentlyBlocked: 403,
                nothingIsMissing: 200,
                answersMissing: 201,
                passwordMissing: 202,
                invalidEmail: 400,
                tokenBlocked: 403,
                emailMissing: 404,
                currentLogin: 409,
                passwordBlocked: 427,
                passwordRecentlyBlocked: 427,
            },
            callbacks: {},
            cached: {
                '200': openModal('RequestPassword'),
                '201': openModal('RequestAnswers'),
                '404': openModal('ConfirmEmail'),
                '427': notifyAboutLockedPassword,
                '409': notifyAboutLoginConflict,
                '400': notifyAboutInvalidEmail,
                '202': requestFirstPassword,
                '403': lockToken,
            },
            mustInterruptRequest: () => {},
            method: 'HEAD',
        },
        confirmEmail: {
            url: `login/${state.email}/token`,
            getBody: () => ({}),
            mappedStatus: {
                tokenRecentlyBlocked: 403,
                nothingIsMissing: 200,
                answersMissing: 201,
                passwordMissing: 202,
                invalidEmail: 400,
                tokenBlocked: 403,
                currentLogin: 409,
                passwordBlocked: 427,
                passwordRecentlyBlocked: 427,
            },
            callbacks: {},
            cached: {
                '200': openModal('RequestPassword'),
                '201': openModal('RequestAnswers'),
                '427': notifyAboutLockedPassword,
                '409': notifyAboutLoginConflict,
                '400': notifyAboutInvalidEmail,
                '202': requestFirstPassword,
                '403': lockToken,
            },
            mustInterruptRequest: () => {},
            method: 'POST',
        },
        requestPassword: {
            url: `login/${state.email}`,
            getBody: () => state.context,
            mappedStatus: {
                nothingIsMissing: 200,
                answersMissing: 201,
                passwordMissing: 202,
                invalidEmail: 400,
                tokenBlocked: 403,
                emailMissing: 404,
                currentLogin: 409,
                passwordBlocked: 427,
                passwordRecentlyBlocked: 429,
                tokenRecentlyBlocked: 403,
            },

            callbacks: {
                '200': executeRetryAfterAuthentication,
                '429': notifyAboutLockedPassword,
                '427': notifyAboutWrongPassword,
            },
            cached: {
                '201': openModal('RequestAnswers'),
                '423': notifyAboutLockedPassword,
                '404': notifyAboutLoginNotFound,
                '409': notifyAboutLoginConflict,
                '400': notifyAboutInvalidEmail,
                '202': requestFirstPassword,
                '403': lockToken,
            },
            mustInterruptRequest: setAttempts('password'),
            method: 'POST',
        },
        requestAnswers: {
            url: `login/${state.email}/pre-registration`,
            getBody: () => state.context,
            mappedStatus: {
                tokenRecentlyBlocked: 403,
                passwordMissing: 202,
                invalidEmail: 400,
                tokenBlocked: 403,
                emailMissing: 404,
                currentLogin: 409,
                passwordBlocked: 427,
                nothingIsMissing: 999,
                answersMissing: 999,
            },
            callbacks: {
                '200': openModal('RequestPassword'),
            },
            cached: {
                '427': notifyAboutLockedPassword,
                '404': notifyAboutLoginNotFound,
                '409': notifyAboutLoginConflict,
                '400': notifyAboutInvalidEmail,
                '202': requestFirstPassword,
                '403': lockToken,
            },
            mustInterruptRequest: () => {},
            method: 'POST',
        },
        savePassword: {
            url: `login/${state.email}/password`,
            getBody: () => state.context,
            mappedStatus: {
                tokenRecentlyBlocked: 429,
                nothingIsMissing: 200,
                passwordMissing: 999,
                answersMissing: 201,
                invalidEmail: 400,
                tokenBlocked: 403,
                emailMissing: 404,
            },
            callbacks: {
                '200': executeRetryAfterAuthentication,
                '427': notifyAboutWrongToken,
                '429': lockToken,
            },
            cached: {
                '201': openModal('RequestAnswers'),
                '404': notifyAboutLoginNotFound,
                '400': notifyAboutInvalidEmail,
                '403': lockToken,
                '429': lockToken,
            },
            mustInterruptRequest: setAttempts('token'),
            method: 'POST',
        },
        sendToken: {
            url: `login/${state.email}/token/language/portuguese`,
            getBody: () => {
                return {};
            },

            mappedStatus: {
                invalidEmail: 400,
                tokenBlocked: 403,
                emailMissing: 404,
                tokenAlreadyRequested: 409,
            },

            callbacks: {
                '200': setDetailMessage(
                    `Seu token está sendo enviado ao e-mail '${state.email}' nos próximos minutos. Por favor, verifique sua caixa de entrada e sua caixa de spam / lixo eletrônico.`
                ),
                '404': notifyAboutLoginNotFound,
            },
            cached: {
                '409': notifyAboutAlreadySentToken,
                '403': lockToken,
            },
            mustInterruptRequest: () => state.setDetailMessage(state.detailMessage),
            method: 'POST',
        },
        requestUnlockToken: {
            url: `login/${state.email}/token/request/unlocking`,
            getBody: () => {
                return {};
            },
            mappedStatus: {
                nothingIsMissing: 999,
                passwordMissing: 429,
                tokenNotLocked: 404,
                invalidEmail: 400,
            },
            callbacks: {
                '409': unlockTokenRequestAlreadyAsked,
                '200': setDetailMessage(
                    `A solicitação de desbloqueio do token para o e-mail '${state.email}' foi efetuada com sucesso, por favor, verifique a caixa de entrada, spam / lixo eletrônico deste e-mail para localizar o token que enviamos. Caso não o encontre, por favor, clique no link de reenvio de token, que reenviaremos o token a este e-mail.`
                ),
            },
            cached: {
                '429': unlockTokenRequestAlreadySolved,
                '404': notifyAboutNotLockedToken,
            },
            mustInterruptRequest: () => {},
            method: 'POST',
        },
        requestResendToken: {
            url: `login/${state.email}/token/request/resending`,
            getBody: () => {
                return {};
            },
            mappedStatus: {
                nothingIsMissing: 999,
                passwordMissing: 429,
                invalidEmail: 400,
            },
            callbacks: {
                '200': setDetailMessage(
                    `A solicitação de reenvio do token para o e-mail '${state.email}' foi efetuada com sucesso, por favor, verifique a caixa de entrada, spam / lixo eletrônico deste e-mail para localizar o token que enviamos.`
                ),
                '409': resendTokenRequestAlreadyAsked,
            },
            cached: {
                '429': resendTokenRequestAlreadySolved,
            },
            mustInterruptRequest: () => {},
            method: 'POST',
        },
    };

    return response;
};
