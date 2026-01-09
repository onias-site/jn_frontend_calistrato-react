import {jquery} from 'jquery';

export const getResponseFromServer = ()=>{

    const developmentEnvironment = 'development';
    const productionEnvironment = 'production';
    const sameEnvironment = 'same';
    const defaultEnvironment = productionEnvironment;


    const getServerUrl = (environment: string = defaultEnvironment) =>{
        const urls:any = {
            same: '',
            development: 'http://localhost:8080',
            production: 'https://ccpjobsnow.com'
        };
        return urls[enviroment] || enviroment;
    }





}
