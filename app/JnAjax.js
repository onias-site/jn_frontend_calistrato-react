import PubSub from 'pubsub-js';

export default class JnAjax {
    static PRODUCAO = 'producao';
    static DESENVOLVIMENTO = 'desenvolvimento';

    static SAME = 'same';

    static deafultEnviroment = JnAjax.PRODUCAO;
    //    static deafultEnviroment = JnAjax.DESENVOLVIMENTO;

    static setLoading = () => () => JnAjax.ajaxLoading(true);

    static setNotLoading = () => () => JnAjax.ajaxLoading(false);

    // a API grava a sessão depois de responder ao login: logo em seguida, uma requisição com a sessão nova pode levar 401
    static RETRY_401_AFTER_LOGIN_WINDOW = 15000;
    static RETRY_401_AFTER_LOGIN_DELAY = 1000;
    static RETRY_401_AFTER_LOGIN_ATTEMPTS = 5;
    static lastLoginTime = 0;

    static isRecentLogin = () => new Date().getTime() - JnAjax.lastLoginTime < JnAjax.RETRY_401_AFTER_LOGIN_WINDOW;

    static doAnAjaxRequest(uri, callbacks = {}, type = 'HEAD', requestBody = {}, headers = {}, enviroment = JnAjax.deafultEnviroment, contentType = 'application/json', dataType = 'json', attempt = 1) {
        const originalHeaders = headers;
        const path = JnAjax.getUrlBackEnd(enviroment);
        callbacks['setLoading'] = callbacks['setLoading'] || JnAjax.setLoading();
        callbacks['setLoading']();
        callbacks['getLogin'] = callbacks['getLogin'] || this.getLogin;
        const login = callbacks['getLogin']();
        const { sessionToken, email } = login;
        headers = headers || {};
        // rotas públicas atrás do CDN (estatísticas, política de privacidade): sem cabeçalho próprio nem Content-Type, o GET é
        // uma requisição simples do CORS, sem o OPTIONS de preflight que sempre chegaria ao backend
        const withoutSession = callbacks['withoutSession'] == true;
        headers = withoutSession ? headers : { ...headers, sessionToken, email };
        contentType = withoutSession ? false : contentType;

        const retryAfterAuthentication = callbacks['retryAfterAuthentication'] || (() => {});

        callbacks[401] = callbacks[401] || JnAjax.getHandler401(retryAfterAuthentication);

        const url2 = `${path}/${uri}`;

        if (!login.email && url2.includes('{email}')) {
            callbacks[401]();
            return;
        }

        const url = url2.replace('{email}', login.email);

        // GET e HEAD não têm corpo
        const requestWithoutBody = type == 'GET' || type == 'HEAD';
        const data = requestBody && !requestWithoutBody ? JSON.stringify(requestBody) : null;

        const complete = (a) => {
            // 401 da sessão que acabou de ser criada: espera a gravação e refaz, em vez de pedir o login de novo
            const sessionNotWrittenYet = a.status == 401 && sessionToken && JnAjax.isRecentLogin() && attempt < JnAjax.RETRY_401_AFTER_LOGIN_ATTEMPTS;
            if (sessionNotWrittenYet) {
                const retry = () => JnAjax.doAnAjaxRequest(uri, callbacks, type, requestBody, originalHeaders, enviroment, contentType, dataType, attempt + 1);
                setTimeout(retry, JnAjax.RETRY_401_AFTER_LOGIN_DELAY);
                return;
            }
            try {
                callbacks['setNotLoading'] = callbacks['setNotLoading'] || JnAjax.setNotLoading();

                callbacks['setNotLoading']();

                const afterHttpRequest = callbacks['afterHttpRequest'] || (() => {});

                const responseBody = JnAjax.parseToObject(a.responseText);

                JnAjax.forgetWhatThisWriteChanged(uri, type, a.status);

                callbacks[422] = callbacks[422] || JnAjax.getHandler422(responseBody);

                const callback =
                    callbacks[a.status] || callbacks['onUnexpectedHttpStatus'] || ((responseBody, httpStatus) => console.log('resposta' + responseBody, 'status imprevisto: ' + httpStatus));

                callback(responseBody, a.status);

                afterHttpRequest(responseBody, a.status);
            } catch (error) {
                callbacks['setNotLoading'] = JnAjax['setNotLoading'] || JnAjax.setNotLoading();
                callbacks['setNotLoading']();
                console.error(error);
            }
        };

        JnAjax.sendHttpRequest({ url, type, headers, contentType, data, complete });
    }

    /**
     * A requisição em si, com o fetch do navegador. O complete recebe { status, responseText }, como o xhr do jQuery
     * recebia até 2026-11-04: todo o tratamento acima (callbacks por status HTTP, retry do 401, cache) depende só disso.
     * Falha de rede (API fora, CORS, DNS) chega como status 0, que cai no onUnexpectedHttpStatus da tela.
     */
    static sendHttpRequest({ url, type, headers, contentType, data, complete }) {
        const requestHeaders = { ...headers };
        // sem sessão (withoutSession) o contentType vem false: sem Content-Type a requisição não exige preflight de CORS
        if (data != null && typeof contentType == 'string') {
            requestHeaders['Content-Type'] = contentType;
        }
        // os cabeçalhos undefined (sem login não há sessionToken nem email) não podem ir: o fetch recusa valores inválidos
        Object.keys(requestHeaders).forEach((name) => requestHeaders[name] == null && delete requestHeaders[name]);
        fetch(url, { method: type, headers: requestHeaders, body: data })
            .then((response) => response.text().then((responseText) => complete({ status: response.status, responseText })))
            .catch((error) => {
                console.warn(`Sem resposta de ${url}: ${error.message}`);
                complete({ status: 0, responseText: '' });
            });
    }

    // respostas das telas que carregam ao nascer, guardadas em memória: valem até o navegador recarregar a página (ou o
    // logout), então voltar a uma tela ou a um item de combobox já carregado não vai de novo ao backend
    static screenCache = new Map();

    static CACHED_STATUSES = [200, 404];

    static clearScreenCache(uriPart = '') {
        for (const key of [...JnAjax.screenCache.keys()]) {
            if (key.includes(uriPart)) JnAjax.screenCache.delete(key);
        }
    }

    // escritas que criam ou desfazem chamados: depois delas, a lista guardada daquele tipo de chamado (o childName no
    // caminho do grouper) fica velha e é descartada. Chave terminada em '/' casa pelo começo do caminho; as outras, inteiras
    static TICKET_WRITES = {
        'contact-us/': 'js_contact_us',
        'resume/{email}/skills/hierarchy': 'vis_skill_fix_hierarchy_pending',
        'resume/{email}/skills/suggestion': 'vis_skill_pending',
    };

    static forgetWhatThisWriteChanged(uri, type, status) {
        const succeeded = status >= 200 && status < 300;
        if (type == 'GET' || !succeeded) return;
        for (const [write, childName] of Object.entries(JnAjax.TICKET_WRITES)) {
            const matches = write.endsWith('/') ? uri.startsWith(write) : uri == write;
            if (matches) JnAjax.clearScreenCache(`/${childName}/`);
        }
    }

    // como o doAnAjaxRequest, mas responde da memória quando a mesma requisição (do mesmo usuário) já foi respondida
    // com um dos CACHED_STATUSES
    static doACachedRequest(uri, callbacks = {}, type = 'GET', requestBody = {}, headers = {}, enviroment = JnAjax.deafultEnviroment) {
        const getLogin = callbacks['getLogin'] || this.getLogin;
        const login = getLogin() || {};
        const key = [enviroment, type, uri.replace('{email}', login.email), JSON.stringify(requestBody)].join(' ');
        const cached = JnAjax.screenCache.get(key);
        if (cached) {
            const callback = callbacks[cached.status] || (() => {});
            callback(cached.responseBody, cached.status);
            const afterHttpRequest = callbacks['afterHttpRequest'] || (() => {});
            afterHttpRequest(cached.responseBody, cached.status);
            return;
        }
        for (const status of JnAjax.CACHED_STATUSES) {
            const original = callbacks[status];
            if (!original) continue;
            callbacks[status] = (responseBody, httpStatus) => {
                JnAjax.screenCache.set(key, { responseBody, status: httpStatus });
                original(responseBody, httpStatus);
            };
        }
        JnAjax.doAnAjaxRequest(uri, callbacks, type, requestBody, headers, enviroment);
    }

    // respostas públicas e caras de refazer (as estatísticas, a política de privacidade), guardadas no localStorage:
    // sobrevivem a recarregar a página e a fechar o navegador, e vencem no prazo de cada uma (24 horas por padrão; as
    // estatísticas, um ano)
    static PERSISTED_REQUEST_PREFIX = 'persistedRequest ';
    static PERSISTED_REQUEST_LIFETIME = 24 * 60 * 60 * 1000;
    static PERSISTED_REQUEST_ONE_YEAR = 365 * JnAjax.PERSISTED_REQUEST_LIFETIME;

    static clearPersistedRequests() {
        try {
            const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index));
            for (const key of keys) {
                if (key.startsWith(JnAjax.PERSISTED_REQUEST_PREFIX)) localStorage.removeItem(key);
            }
        } catch (error) {}
    }

    static readPersistedRequest(key) {
        try {
            const persisted = JSON.parse(localStorage.getItem(key));
            if (persisted && persisted.expiresAt > new Date().getTime()) return persisted;
            localStorage.removeItem(key);
        } catch (error) {}
        return null;
    }

    // sem espaço no localStorage, descarta o que está guardado e tenta uma vez; se ainda falhar, só deixa de guardar
    static savePersistedRequest(key, responseBody, lifetime = JnAjax.PERSISTED_REQUEST_LIFETIME) {
        const expiresAt = new Date().getTime() + lifetime;
        const persisted = JSON.stringify({ responseBody, expiresAt });
        try {
            localStorage.setItem(key, persisted);
        } catch (error) {
            JnAjax.clearPersistedRequests();
            try {
                localStorage.setItem(key, persisted);
            } catch (secondError) {}
        }
    }

    // GET cuja resposta 200 fica no localStorage: a mesma pesquisa não volta ao backend enquanto a resposta valer. Os dados
    // não são de um usuário, por isso a chave não leva o e-mail. O prazo (lifetime, em milissegundos) é de 24 horas quando
    // não informado
    static doAPersistedRequest(uri, callbacks = {}, enviroment = JnAjax.deafultEnviroment, lifetime = JnAjax.PERSISTED_REQUEST_LIFETIME) {
        const key = `${JnAjax.PERSISTED_REQUEST_PREFIX}${enviroment} ${uri}`;
        const original = callbacks[200];
        const persisted = JnAjax.readPersistedRequest(key);
        if (persisted) {
            original(persisted.responseBody, 200);
            return;
        }
        callbacks[200] = (responseBody, httpStatus) => {
            JnAjax.savePersistedRequest(key, responseBody, lifetime);
            original(responseBody, httpStatus);
        };
        JnAjax.doAnAjaxRequest(uri, callbacks, 'GET', null, {}, enviroment);
    }

    static getHandler422 = (response, status) => {
        return () => PubSub.publish('httpStatus422', response);
    };

    static getHandler404 = (summary, detail) => {
        return () => PubSub.publish('showMessage', { summary, detail, severity: 'error' });
    };

    static getHandler401 = (retryAfterAuthentication) => {
        return () => PubSub.publish('httpStatus401', retryAfterAuthentication);
    };


    static getEmailFromUrl = () => {
        alert(window.location.href);
        const x = window.location.href.split('?')[1];
        if (!x) {
            return '';
        }

        const array = x.split('&');

        const email = array.filter((y) => y.startsWith('email='));
        if (!email) {
            return '';
        }
        return email;
    };

    static parseToObject = (res) => {
        try {
            res = JSON.parse(res);
            return res;
        } catch (error) {
            return res;
        }
    };

    static ajaxLoading(x) {
        document.getElementById('cover').style.display = x ? 'block' : 'none';
    }

    static getUrlBackEnd(enviroment = JnAjax.deafultEnviroment) {
        const urls = {
            same: '',
            desenvolvimento: 'http://localhost:8080',
            producao: process.env.NEXT_PUBLIC_VIS_API_URL ?? 'https://ccpjobsnow.com',
            // the screens name the local APIs; a production build translates them here, in one place
            'http://localhost:8081': process.env.NEXT_PUBLIC_VIS_API_URL ?? 'http://localhost:8081',
            'http://localhost:8082': process.env.NEXT_PUBLIC_LOGIN_API_URL ?? 'http://localhost:8082',
        };
        return urls[enviroment] || enviroment;
    }

    static hasLogin() {
        const login = this.getLogin();
        return login && login.sessionToken && login.email && true;
    }

    static hasPastLogin(email) {
        try {
            const array = localStorage.getItem('logins');
            const logins = JSON.parse(array);
            return logins[email];
        } catch (error) {}
    }


    static isCachedStatus(email, property, status) {
        try {
            const array = localStorage.getItem('logins');
            const logins = JSON.parse(array);
            const login = logins[email];
            const responses = login[property];
            const response = responses[status];
            return !!response;
        } catch (error) {}
    }

    static removeAllCachedRequests(email, property) {
        try {
            const array = localStorage.getItem('logins');
            const logins = JSON.parse(array);
            const login = logins[email];
            delete login[property];
            logins[email] = login;
            localStorage.setItem('logins', JSON.stringify(logins));
        } catch (error) {}
    }

    static removeAllCachedStatus(status) {
        try {
            const array = localStorage.getItem('logins');

            if (!array) {
                return;
            }

            const logins = JSON.parse(array);

            if (!logins) {
                return;
            }

            const removeStatus = (node) => {
                if (!node || typeof node !== 'object') {
                    return;
                }
                delete node[status];
                for (let key in node) {
                    removeStatus(node[key]);
                }
            };

            removeStatus(logins);

            localStorage.setItem('logins', JSON.stringify(logins));
        } catch (error) {}
    }

    static addCachedRequest(email, informationType, status, response) {
        try {
            const array = localStorage.getItem('logins');
            const logins = JSON.parse(array) || {};
            const login = logins[email] || {};
            const data = login[informationType] || {};
            data[status] = response || {};
            login[informationType] = data;
            logins[email] = login;
            localStorage.setItem('logins', JSON.stringify(logins));
        } catch (error) {}
    }

    static getCachedRequest(email, property, callbacks) {
        try {
            const array = localStorage.getItem('logins');

            if (!array) {
                return;
            }

            const logins = JSON.parse(array);

            if (!logins) {
                return;
            }

            const login = logins[email];

            if (!login) {
                return;
            }

            const responses = login[property];

            if (!responses) {
                return;
            }
            for (let status in callbacks) {
                const response = responses[status];

                if (!response) {
                    continue;
                }

                const expiredTimeStamp = response.timestamp && response.timestamp < new Date().getTime();

                if (expiredTimeStamp) {
                    return;
                }

                const callback = callbacks[status];
                callback(response);
                return response;
            }
        } catch (e) {}
    }
    static saveLogin(response){
        let recoveredLogin;
        let logins;
        try {
            const array = localStorage.getItem('logins');
            logins = JSON.parse(array);
            recoveredLogin = logins[response.email];
        } catch (error) {
            recoveredLogin = {};
            logins = {};
        }
        const loginToSessionStorage = {
            email: response.email,
            sessionToken: response.sessionToken,
            timestamp: response.timestamp || recoveredLogin.timestamp,
            expirationDate: response.expirationDate || recoveredLogin.expirationDate,
            dateItWasSaved: response.dateItWasSaved || recoveredLogin.dateItWasSaved,
            };

        localStorage.setItem(JnAjax.LOGIN_KEY, JSON.stringify(loginToSessionStorage));

        JnAjax.lastLoginTime = new Date().getTime();

        const { timestamp, expirationDate, dateItWasSaved } = loginToSessionStorage;

        const loginToLocalStorage = { timestamp, expirationDate, dateItWasSaved };

        logins[response.email] = loginToLocalStorage;

        logins[response.email] = {...recoveredLogin, ...loginToLocalStorage};

        localStorage.setItem('logins', JSON.stringify(logins));

        return loginToSessionStorage;
    }

    // a sessão fica no localStorage, que todas as abas do site enxergam: o login feito numa aba vale nas outras (até
    // 2026-11-09 ficava no sessionStorage, que é de uma aba só, e cada aba nova pedia o login de novo)
    static LOGIN_KEY = 'login';

    static readStoredLogin() {
        try {
            const stored = localStorage.getItem(JnAjax.LOGIN_KEY);
            if (stored) {
                return stored;
            }
            // a aba que já estava logada pelo sessionStorage passa o login para o localStorage
            const fromThisTab = sessionStorage.getItem(JnAjax.LOGIN_KEY);
            if (!fromThisTab) {
                return null;
            }
            localStorage.setItem(JnAjax.LOGIN_KEY, fromThisTab);
            sessionStorage.removeItem(JnAjax.LOGIN_KEY);
            return fromThisTab;
        } catch (error) {
            return null;
        }
    }

    static removeLogin() {
        try {
            localStorage.removeItem(JnAjax.LOGIN_KEY);
            sessionStorage.removeItem(JnAjax.LOGIN_KEY);
        } catch (error) {}
    }

    // avisa quando outra aba entra, sai ou troca de usuário (o evento storage só chega às outras abas, nunca à que
    // gravou; key null é o localStorage.clear()); devolve a função que para de escutar
    static onLoginChangedInAnotherTab(listener) {
        const handler = (event) => (event.key == JnAjax.LOGIN_KEY || event.key == null) && listener();
        window.addEventListener('storage', handler);
        return () => window.removeEventListener('storage', handler);
    }

    static getLogin() {
        const sessao = JnAjax.readStoredLogin();
        let login = {};
        try {
            const sessaoObj = JSON.parse(sessao);
            const { sessionToken, email } = sessaoObj;
            login = { sessionToken, email };
        } catch (error) {
            return {};
        }

        try {
            const array = localStorage.getItem('logins');
            const logins = JSON.parse(array);
            const data = logins[login.email];

            if (!data) {
                return login;
            }

            const { timestamp, expirationDate, dateItWasSaved } = data;
            const localFields = { timestamp, expirationDate, dateItWasSaved };
            login = { ...login, ...localFields };
            return login;
        } catch (error) {
            return login;
        }
    }
    static getOnUnexpectedHttpStatusCallback = (mappedRequest, allMappedRequests, email) => {
        const onUnexpectedHttpStatusCallback =  (response, status) => {

            const cachedRequests = mappedRequest.cached;
            const callbacks = mappedRequest.callbacks;

            const callback =
                callbacks[status] ||
                cachedRequests[status] ||
                ((r, s) => {
                    console.log('resposta', r, 'status imprevisto: ', s);
                });

            callback(response, status);

            const statusName = JnAjax.getStatusName(mappedRequest, status);

            const notMappedStatusName = !statusName;

            if (notMappedStatusName) {
                return;
            }

            for (let requestName in allMappedRequests) {
                const otherMappedRequest = allMappedRequests[requestName];
                const statusNumber = otherMappedRequest.mappedStatus[statusName];

                const notMappedStatus = !statusNumber;

                if (notMappedStatus) {
                    continue;
                }

                JnAjax.removeAllCachedRequests(email, requestName);

                const notCachedStatus = !otherMappedRequest.cached[statusNumber];

                if (notCachedStatus) {
                    continue;
                }
                const {timestamp, expirationDate, dateItWasSaved} = response;
                const responseToCache = {timestamp, expirationDate, dateItWasSaved};
                JnAjax.addCachedRequest(email, requestName, statusNumber, responseToCache);
            }
        };
        return onUnexpectedHttpStatusCallback;
    }
    static executeLoginRequest(state, requestName, getAllMappedRequests) {

        const { email, callbacks } = state;
        const allMappedRequests = getAllMappedRequests(state);

        const mappedRequest = allMappedRequests[requestName];

        if (mappedRequest.mustInterruptRequest() === true) {
            return;
        }

        const alreadyCachedRequest = JnAjax.getCachedRequest(email, requestName, mappedRequest.cached);

        if (alreadyCachedRequest) {
            return;
        }

        callbacks.onUnexpectedHttpStatus = JnAjax.getOnUnexpectedHttpStatusCallback(mappedRequest, allMappedRequests, email);

        JnAjax.doAnAjaxRequest(mappedRequest.url, callbacks, mappedRequest.method, mappedRequest.getBody(), {}, 'http://localhost:8082');
    }

    static getStatusName(othermappedRequest, status) {
        for (let feedback in othermappedRequest.mappedStatus) {
            const otherStatus = othermappedRequest.mappedStatus[feedback];
            if (otherStatus == status) {
                return feedback;
            }
        }

        return '';
    }
}
