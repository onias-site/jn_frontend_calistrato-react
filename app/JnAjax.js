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

    static doAnAjaxRequest(uri, callbacks = {}, type = 'HEAD', requestBody = {}, headers = {}, enviroment = JnAjax.deafultEnviroment, contentType = 'application/json', dataType = 'json') {
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

        const data = requestBody ? JSON.stringify(requestBody) : null;

        const complete = (a) => {
            try {
                callbacks['setNotLoading'] = callbacks['setNotLoading'] || JnAjax.setNotLoading();

                callbacks['setNotLoading']();

                callbacks[420] = callbacks[420] || JnAjax.getHandler420();

                callbacks[403] = callbacks[403] || JnAjax.getHandler403(uri);

                callbacks[410] = callbacks[410] || JnAjax.getHandler410(uri);

                const afterHttpRequest = callbacks['afterHttpRequest'] || (() => {});

                const responseBody = JnAjax.parseToObject(a.responseText);

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

    static getHandler422 = (response, status) => {
        return () => PubSub.publish('httpStatus422', response);
    };

    static getHandler401 = (retryAfterAuthentication) => {
        return () => PubSub.publish('httpStatus401', retryAfterAuthentication);
    };

    static getHandler420 = () => {
        let resultado = () => {
            window.location.href = '#/login?mensagem=foraDoHorario';
        };

        return resultado;
    };

    static getHandler403 = (uri) => {
        let resultado = (reason) => {
            const email = uri.split('/')[1];
            if (!email) {
                return;
            }

            sessionStorage.removeItem('sessao');
            const queryParameters = `?email=${email}&msgType=danger&msgValue=${reason}`;
            window.location.href = '#/tokenToSetPassword' + queryParameters;
        };

        return resultado;
    };

    static getHandler410 = (uri) => {
        let resultado = () => {
            const email = uri.split('/')[1];
            if (!email) {
                return;
            }

            sessionStorage.removeItem('sessao');
            window.location.href = `#/blockedToken?email=${email}`;
        };

        return resultado;
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

    static removeLogin(email) {
        try {
            const array = localStorage.getItem('logins');
            const logins = JSON.parse(array);
            delete logins[email];
            localStorage.setItem('logins', JSON.stringify(logins));
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
        try {
            const array = localStorage.getItem('logins');
            const logins = JSON.parse(array);
            recoveredLogin = logins[response.email];
        } catch (error) {
            recoveredLogin = {};
        }
        const loginToSessionStorage = {
            email: response.email,
            sessionToken: response.sessionToken,
            timestamp: response.timestamp || recoveredLogin.timestamp,
            expirationDate: response.expirationDate || recoveredLogin.expirationDate,
            dateItWasSaved: response.dateItWasSaved || recoveredLogin.dateItWasSaved,
            };



        sessionStorage.setItem('login', JSON.stringify(loginToSessionStorage));

        const { timestamp, expirationDate, dateItWasSaved } = loginToSessionStorage;

        const loginToLocalStorage = { timestamp, expirationDate, dateItWasSaved };

        const logins = recoveredLogin;

        logins[response.email] = loginToLocalStorage;
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

        JnAjax.doAnAjaxRequest(mappedRequest.url, callbacks, mappedRequest.method, mappedRequest.getBody(), {}, 'http://localhost:8080');
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
