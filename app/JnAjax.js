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
        const login =  callbacks['getLogin']();
        const {sessionToken, email} = login;
        headers = (headers || {});
        headers = {...headers, sessionToken, email};

        const retryAfterAuthentication = callbacks['retryAfterAuthentication'] || (() => {});

        callbacks[401] = callbacks[401] || JnAjax.getHandler401(retryAfterAuthentication);

        const url2 = `${path}/${uri}`;

        if(!login.email && url2.includes('{email}')){
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

                const callback = callbacks[a.status] || callbacks['onUnexpectedHttpStatus'] || ((responseBody, httpStatus) => console.log('resposta' + responseBody, 'status imprevisto: ' + httpStatus));

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
            complete
        });
    }

    static getHandler422 = (response, status) => {
        return () => PubSub.publish('httpStatus422', response);
    }

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

    static hasLogin(){
        const login = this.getLogin();
        return login && login.sessionToken && login.email && true;
    }

    static removeStageOvercomeFromLogin(email, stage){
        try {
            const array = localStorage.getItem('logins');
            const logins = JSON.parse(array);
            const login = logins[email] || {};
            login.stagesOvercome = login.stagesOvercome || [];
            login.stagesOvercome = login.stagesOvercome.filter(x => x != stage);
            logins[email] = login;
            localStorage.setItem('logins', JSON.stringify(logins));
        } catch (error) {

        }
    }

    static addStageOvercomeToLogin(email, stage){
        try {
            const array = localStorage.getItem('logins');
            const logins = JSON.parse(array) || {};
            const login = logins[email] || {};
            login.stagesOvercome = login.stagesOvercome || [];
            const set = new Set(login.stagesOvercome);
            set.add(stage);
            login.stagesOvercome = [...set];
            logins[email] = login;
            localStorage.setItem('logins', JSON.stringify(logins));
        } catch (error) {

        }
    }

    static hasThisStageBeenOvercome(email, stage){
       const defaultValidator = login => {
            return login && login.stagesOvercome && login.stagesOvercome.includes(stage);
       };
       const stageValidators = {token: login => login.timestamp > new Date().getTime()};
       const stageValidator = stageValidators[stage] || defaultValidator;

        try {
            const array = localStorage.getItem('logins');
            const logins = JSON.parse(array);
            const login = logins[email];
            return stageValidator(login);
        } catch (error) {
           return false;
        }
    }
    static getLogin() {
        const sessao = sessionStorage.getItem('login');
        let login = {};
        try {
            const sessaoObj = JSON.parse(sessao);
            const {sessionToken, email} = sessaoObj;
            login = {sessionToken, email};
        } catch (error) {
            return {};
        }

        try {
            const array = localStorage.getItem('logins');
            const logins = JSON.parse(array);
            const data = logins[login.email];

            if(!data){
                return login;
            }

            const {timestamp, expirationDate, dateItWasSaved} = data;
            const localFields = {timestamp, expirationDate, dateItWasSaved};
            login = {...login, ...localFields};
            return login;
        } catch (error) {
            return login;
        }
    }
}
