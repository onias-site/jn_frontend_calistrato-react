export const serverRequests = (state: any) => {
    const openModal = (selectedScreen: string) => state.showModal(selectedScreen, '');
    const response = {
        checkEmail: {
            url: `login/${state.email}/token`,
            getBody: () => ({}),
            callbacks: {
                '202': state.requestFirstPassword,
                '404': () => openModal('ConfirmEmail'),
                '201': () => openModal('RequestAnswers'),
                '427': () =>
                    state.showModal(
                        'SavePassword',
                        'Desbloqueie a sua senha',
                        null,
                        'Devido a tentativas de acessos suspeitos, sua senha foi preventivamente bloqueada. Preencha os campos acima, para desbloqueá-la.'
                    ),
                '409': () =>
                    state.showModal(
                        'SavePassword',
                        'Desbloqueie seu login',
                        null,
                        'Já há um login corrente em sua conta, pode ser que você não tenha feito a saída em seu último login, ou se trata de algum acesso concorrente em sua conta em outra estação de trabalho. De qualquer forma, preencha os campos deste formulário para desfazer o outro login corrente'
                    ),
            },
            cached: {
                '200': () => openModal('RequestPassword'),
            },
            mustInterruptRequest: () => {},
            method: 'HEAD',
        },
        confirmEmail: {
            url: `login/${state.email}/token`,
            getBody: () => ({}),
            callbacks: {
                '202': state.requestFirstPassword,
                '201': () => openModal('RequestAnswers'),
                '200': () => openModal('RequestPassword')
            },
            cached: {},
            mustInterruptRequest: () => {},
            method: 'POST',
        },
        requestPassword: {
            url: `login/${state.email}`,
            getBody: () => state.context,
            callbacks: {
                '202': state.requestFirstPassword,
                '201': () => openModal('RequestAnswers'),
                '404': () => state.notifyAboutLoginNotFound(),
                '200': (response: any) => state.executeRetryAfterAuthentication(response),
                '409': () =>
                    state.showModal(
                        'SavePassword',
                        'Desbloqueie seu login',
                        null,
                        'Já há um login corrente em sua conta, pode ser que você não tenha feito a saída em seu último login, ou se trata de algum acesso concorrente em sua conta em outra estação de trabalho. De qualquer forma, preencha os campos deste formulário para desfazer o outro login corrente'
                    ),
                '427': (response: any) => {
                    state.setError(`Sua senha está incorreta!!! Você ainda tem direito a ${3 - response.attempts} tentativa(s)`);
                    state.setContextField('password', '');
                },
                '423': () =>
                    state.showModal(
                        'SavePassword',
                        'Crie uma nova senha',
                        null,
                        'Devido a tentativas de acessos suspeitos, sua senha foi preventivamente bloqueada. Preencha os campos acima, para desbloqueá-la.'
                    ),
                '429': () =>
                    state.showModal(
                        'SavePassword',
                        'Crie uma nova senha',
                        null,
                        'Devido a tentativas de acessos suspeitos, sua senha foi preventivamente bloqueada. Preencha os campos acima, para desbloqueá-la.'
                    ),
            },
            cached: {},
            mustInterruptRequest: () => {},
            method: 'POST',
        },
        requestAnswers: {
            url: `login/${state.email}/pre-registration`,
            getBody: () => state.context,
            callbacks: {
                '202': state.requestFirstPassword,
                '200': () => openModal('RequestPassword'),
                '404': () => state.notifyAboutLoginNotFound(),
                '409': () =>
                    state.showModal(
                        'SavePassword',
                        'Desbloqueie seu login',
                        null,
                        'Já há um login corrente em sua conta, pode ser que você não tenha feito a saída em seu último login, ou se trata de algum acesso concorrente em sua conta em outra estação de trabalho. De qualquer forma, preencha os campos deste formulário para desfazer o outro login corrente'
                    ),
                    '427': () =>
                    state.showModal(
                        'SavePassword',
                        'Desbloqueie a sua senha',
                        null,
                        'Devido a tentativas de acessos suspeitos, sua senha foi preventivamente bloqueada. Preencha os campos acima, para desbloqueá-la.'
                    ),
           },
            cached: {},
            mustInterruptRequest: () => {},
            method: 'POST',
        },
        savePassword: {
            url: `login/${state.email}/password`,
            getBody: () => state.context,
            callbacks: {
                '427': (response: any) => {
                    state.setError(`O token informado está incorreto, você ainda pode tentar mais ${3 - response.attempts} vez(es)`);
                    state.setContextField('token', '');
                },
                '200': (response: any) => state.executeRetryAfterAuthentication(response),
                '404': () => state.notifyAboutLoginNotFound(),
                '201': () => openModal('RequestAnswers'),
                '429': () => state.setLockedToken(true),
            },
            cached: {},
            mustInterruptRequest: () => state.setError(''),
            method: 'POST',
        },
        requestResendToken: {
            url: `login/${state.email}/token/request/resending`,
            getBody: () => {
                return {};
            },
            callbacks: {
                '200': () =>
                    state.setError(
                        `A solicitação de reenvio do token para o e-mail '${state.email}' foi efetuada com sucesso, por favor, verifique a caixa de entrada, spam / lixo eletrônico deste e-mail para localizar o token que enviamos.`
                    ),
                    '404': () => state.setError(`Seu token não não existe`),
          },
            cached: {
                '409': (response: any) =>
                    state.setError(
                        `A solicitação de reenvio do token para o e-mail '${state.email}' já foi feita na data ${response.dateItWasSaved}, se necessário, poderá ser refeita na data ${response.expirationDate}. Assim que possível, será enviado em e-mail neste mesmo endereço de e-mail.`
                    ),
                '429': (response: any) =>
                    state.setError(
                        `A solicitação de reenvio do token para o e-mail '${state.email}' já foi atendida na data ${response.dateItWasSaved}, se necessário, poderá ser refeita na data ${response.expirationDate}`
                    ),
            },
            mustInterruptRequest: () => {},
            method: 'POST',
        },

        sendToken: {
            url: `login/${state.email}/token/language/portuguese`,
            getBody: () => {
                return {};
            },
            callbacks: {
                '200': () =>
                    state.setError(`Seu token está sendo enviado ao e-mail '${state.email}' nos próximos minutos. Por favor, verifique sua caixa de entrada e sua caixa de spam / lixo eletrônico.`),
                '404': () => state.notifyAboutLoginNotFound(),
            },
            cached: {
                '409': (response: any) =>
                    !state.error &&
                    state.setError(
                        `Seu token já foi previamente enviado ao e-mail '${state.email}' no dia ${response.dateItWasSaved} e expirará no dia ${response.expirationDate}. Por favor, verifique sua caixa de entrada e sua caixa de spam / lixo eletrônico. Caso não tenha recebido o token, clique abaixo para reenviarmos.`
                    ),
                '403': () => state.setError('Seu token está bloqueado, por favor, solicite o desbloqueio no link mais abaixo'),
            },
            mustInterruptRequest: () => state.setError(state.error),
            method: 'POST',
        },
        requestUnlockToken: {
            url: `login/${state.email}/token/request/unlocking`,
            getBody: () => {
                return {};
            },
            callbacks: {
                '200': () =>
                    state.setError(
                        `A solicitação de desbloqueio do token para o e-mail '${state.email}' foi efetuada com sucesso, por favor, verifique a caixa de entrada, spam / lixo eletrônico deste e-mail para localizar o token que enviamos. Caso não o encontre, por favor, clique no link de reenvio de token, que reenviaremos o token a este e-mail.`
                    ),
                '404': () =>
                    state.setError(
                        `Seu token não está bloqueado, por favor, verifique a caixa de entrada, spam / lixo eletrônico do e-mail '${state.email}' para localizar o token que enviamos. Caso não o encontre, por favor, clique no link de reenvio de token, que reenviaremos o token a este e-mail.`
                    ),
            },
            cached: {
                '409': (response: any) =>
                    state.setError(
                        `A solicitação de desbloqueio do token para o e-mail '${state.email}' já foi feita na data ${response.dateItWasSaved}, se necessário, poderá ser refeita na data ${response.expirationDate}. Assim que possível, será enviado em e-mail neste mesmo endereço de e-mail`
                    ),
                '429': (response: any) =>
                    state.setError(
                        `A solicitação de desbloqueio do token para o e-mail '${state.email}' já foi atendida na data ${response.dateItWasSaved}, se necessário, poderá ser refeita na data ${response.expirationDate}`
                    ),
            },
            mustInterruptRequest: () => {},
            method: 'POST',
        },
    };

    return response;
};
