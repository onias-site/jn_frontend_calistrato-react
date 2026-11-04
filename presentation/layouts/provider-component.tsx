'use client';
import App from '@/App';
import store, { IRootState } from '@/store';
import { Provider, useSelector } from 'react-redux';
import React, { ReactNode, Suspense } from 'react';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import Loading from '@/presentation/layouts/loading';
import { mantineTheme } from '@/presentation/theme/mantine-theme';

import { VagasProvider } from '../contexts/vagasContex';

interface IProps {
    children?: ReactNode;
}

// o Mantine segue o tema claro/escuro escolhido no header (guardado no Redux pelo template)
const MantineThemeProvider = ({ children }: IProps) => {
    const isDarkMode = useSelector((state: IRootState) => state.themeConfig.isDarkMode);
    return (
        <MantineProvider theme={mantineTheme} forceColorScheme={isDarkMode ? 'dark' : 'light'}>
            <Notifications position="top-right" zIndex={1000} />
            {children}
        </MantineProvider>
    );
};

const ProviderComponent = ({ children }: IProps) => {
    return (
        <Provider store={store}>
            <MantineThemeProvider>
                <Suspense fallback={<Loading />}>
                    <VagasProvider>
                        <App>{children} </App>
                    </VagasProvider>
                </Suspense>
            </MantineThemeProvider>
        </Provider>
    );
};

export default ProviderComponent;
