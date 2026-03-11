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

        const token = this.getToken();
        if (!headers) {
            headers = {};
        }

        if (token && token.token) {
            headers['token'] = token.token;
            headers['email'] = token.email;
        }
        const url = `${path}/${uri}`;
        const data = JSON.stringify(requestBody);

        const complete = (a) => {
            try {

                callbacks['setNotLoading'] = callbacks['setNotLoading'] || JnAjax.setNotLoading();

                callbacks['setNotLoading']();

                const retryAfterAuthentication = callbacks['retryAfterAuthentication'] || (() => {});

                callbacks[401] = callbacks[401] || JnAjax.getHandler401(retryAfterAuthentication);

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
        console.log('retryAfterAuthentication', retryAfterAuthentication);
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

    static getToken() {
        const sessao = sessionStorage.getItem('sessao');

        try {
            const sessaoObj = JSON.parse(sessao);
            return { ...sessaoObj };
        } catch (error) {
            return {};
        }
    }
}
