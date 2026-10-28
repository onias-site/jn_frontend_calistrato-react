'use client';
import App from '@/App';
import store from '@/store';
import { Provider } from 'react-redux';
import React, { ReactNode, Suspense } from 'react';
// import { appWithI18Next } from 'ni18n';
// import { ni18nConfig } from 'ni18n.config.ts';
import Loading from '@/presentation/layouts/loading';

import { VagasProvider } from '../contexts/vagasContex';


interface IProps {
    children?: ReactNode;
}

const ProviderComponent = ({ children }: IProps) => {

    return (
        <Provider store={store}>
            <Suspense fallback={<Loading />}>

                    <VagasProvider>
                        <App>{children} </App>
                    </VagasProvider>

            </Suspense>
        </Provider>
    );
};

export default ProviderComponent;
// todo
// export default appWithI18Next(ProviderComponent, ni18nConfig);




