import $ from 'jquery';
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
        headers = { ...headers, sessionToken, email };

        const retryAfterAuthentication = callbacks['retryAfterAuthentication'] || (() => {});

        callbacks[401] = callbacks[401] || JnAjax.getHandler401(retryAfterAuthentication);

        const url2 = `${path}/${uri}`;

        if (!login.email && url2.includes('{email}')) {
            callbacks[401]();
            return;
        }

        const url = url2.replace('{email}', login.email);

        // GET e HEAD não têm corpo: o jQuery poria o JSON na URL ("...?{}"); até 2026-10-26 cada chamada passava null
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

        $.ajax({
            data,
            headers,
            url,
            contentType,
            type,
            dataType,
            complete,
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
            producao: 'https://ccpjobsnow.com',
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

        sessionStorage.setItem('login', JSON.stringify(loginToSessionStorage));

        JnAjax.lastLoginTime = new Date().getTime();

        const { timestamp, expirationDate, dateItWasSaved } = loginToSessionStorage;

        const loginToLocalStorage = { timestamp, expirationDate, dateItWasSaved };

        logins[response.email] = loginToLocalStorage;

        logins[response.email] = {...recoveredLogin, ...loginToLocalStorage};

        localStorage.setItem('logins', JSON.stringify(logins));

        return loginToSessionStorage;
    }

    static getLogin() {
        const sessao = sessionStorage.getItem('login');
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
