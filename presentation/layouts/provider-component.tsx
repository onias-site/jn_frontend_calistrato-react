'use client';
import App from '@/App';
import store from '@/store';
import { Provider } from 'react-redux';
import React, { ReactNode, Suspense, useEffect } from 'react';
// import { appWithI18Next } from 'ni18n';
// import { ni18nConfig } from 'ni18n.config.ts';
import Loading from '@/presentation/layouts/loading';

import { VagasProvider } from '../contexts/vagasContex';
import { useStore } from '@/presentation/Login/store/useStore';
import { getCurrentAccountAdapter } from '@/main/adapters';


interface IProps {
    children?: ReactNode;
}

const ProviderComponent = ({ children }: IProps) => {

    const setUser = useStore(state => state.setUserState);

    useEffect(() => {
        const storedAccount = getCurrentAccountAdapter();
        if (storedAccount && storedAccount.user) {
            setUser(storedAccount.user);
        }
    }, [setUser]);

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




