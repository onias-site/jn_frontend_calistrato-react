'use client';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { toggleSidebar } from '@/store/themeConfigSlice';
import AnimateHeight from 'react-animate-height';
import { IRootState } from '@/store';
import { useState, useEffect } from 'react';
import IconCaretsDown from '@/presentation/icons/icon-carets-down';
import IconCaretDown from '@/presentation/icons/icon-caret-down';
import IconMenuUsers from '@/presentation/icons/menu/icon-menu-users';
import IconMenuAuthentication from '@/presentation/icons/menu/icon-menu-authentication';
import { usePathname } from 'next/navigation';
import { getTranslation } from '@/i18n';
import { LoginView } from '../Login/login.view';
import { useStore } from '@/presentation/Login/store/useStore';

const Sidebar = () => {
    const dispatch = useDispatch();
    const { t } = getTranslation();
    const pathname = usePathname();
    const [currentMenu, setCurrentMenu] = useState<string>('');
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const semidark = useSelector((state: IRootState) => state.themeConfig.semidark);
    const toggleMenu = (value: string) => {
        setCurrentMenu((oldValue) => {
            return oldValue === value ? '' : value;
        });
    };

    const setModal = useStore(state => state.setModalState);
    const accessToken = useStore(state => state.accessTokenState);
    const handleOpenModal = () => {
        if (!accessToken) {
            setModal('login');
        }
      };

    useEffect(() => {
        const selector = document.querySelector('.sidebar ul a[href="' + window.location.pathname + '"]');
        if (selector) {
            selector.classList.add('active');
            const ul: any = selector.closest('ul.sub-menu');
            if (ul) {
                let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link') || [];
                if (ele.length) {
                    ele = ele[0];
                    setTimeout(() => {
                        ele.click();
                    });
                }
            }
        }
    }, []);

    useEffect(() => {
        setActiveRoute();
        if (window.innerWidth < 1024 && themeConfig.sidebar) {
            dispatch(toggleSidebar());
        }
    }, [pathname]);

    const setActiveRoute = () => {
        let allLinks = document.querySelectorAll('.sidebar ul a.active');
        for (let i = 0; i < allLinks.length; i++) {
            const element = allLinks[i];
            element?.classList.remove('active');
        }
        const selector = document.querySelector('.sidebar ul a[href="' + window.location.pathname + '"]');
        selector?.classList.add('active');
    };

    return (
        <div className={semidark ? 'dark' : ''}>
            <nav
                className={`sidebar fixed bottom-0 top-0 z-50 h-full min-h-screen w-[260px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-all duration-300 ${semidark ? 'text-white-dark' : ''}`}
            >
                <div className="h-full bg-white dark:bg-black">
                    <div className="flex items-center justify-between px-4 py-3">
                        <Link href="/" className="main-logo flex shrink-0 items-center">
                            {/* <img className="ml-[5px] w-8 flex-none" src="/assets/images/logo.svg" alt="logo" /> */}
                            <span className="align-middle text-2xl font-semibold dark:text-white-light lg:inline ltr:ml-1.5 rtl:mr-1.5">JOBSNOW</span>
                        </Link>

                        <button
                            type="button"
                            className="collapse-icon flex h-8 w-8 items-center rounded-full transition duration-300 hover:bg-gray-500/10 dark:text-white-light dark:hover:bg-dark-light/10 rtl:rotate-180"
                            onClick={() => dispatch(toggleSidebar())}
                        >
                            <IconCaretsDown className="m-auto rotate-90" />
                        </button>
                    </div>
                    <PerfectScrollbar className="relative h-[calc(100vh-80px)]">
                        <ul className="relative space-y-0.5 p-4 py-0 font-semibold">
                            <li className="menu nav-item">
                                <button type="button" className={`${currentMenu === 'users' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('users')}>
                                    <div className="flex items-center">
                                        <IconMenuUsers className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">{t('My Data')}</span>
                                    </div>

                                    <div className={currentMenu !== 'users' ? '-rotate-90 rtl:rotate-90' : ''}>
                                        <IconCaretDown />
                                    </div>
                                </button>

                                <AnimateHeight duration={300} height={currentMenu === 'users' ? 'auto' : 0}>
                                    <ul className="sub-menu text-gray-500">
                                        <li>
                                            <Link href="/meus-dados/sobre-mim">{t('about_me')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/maintenence">{t('Me x Market')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/maintenence">{t('My Reputation')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/maintenence">{t('My Applications')}</Link>
                                        </li>
                                    </ul>
                                </AnimateHeight>
                            </li>

                            {/* <li className="menu nav-item">
                                <button type="button" className={`${currentMenu === 'page' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('page')}>
                                    <div className="flex items-center">
                                        <IconMenuPages className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">{t('Ninjas')}</span>
                                    </div>

                                    <div className={currentMenu !== 'page' ? '-rotate-90 rtl:rotate-90' : ''}>
                                        <IconCaretDown />
                                    </div>
                                </button>

                                <AnimateHeight duration={300} height={currentMenu === 'page' ? 'auto' : 0}>
                                    <ul className="sub-menu text-gray-500">
                                        <li>
                                            <Link href="/maintenence">{t('Seja um Ninja')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/maintenence">{t('Contrate um Ninja')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/maintenence">{t('Conflitos')}</Link>
                                        </li>
                                    </ul>
                                </AnimateHeight>
                            </li> */}

                            <li className="menu nav-item">
                                <button type="button" className={`${currentMenu === 'auth' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('auth')}>
                                    <div className="flex items-center">
                                        <IconMenuAuthentication className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">{t('Meu Recrutamento')}</span>
                                    </div>

                                    <div className={currentMenu !== 'auth' ? '-rotate-90 rtl:rotate-90' : ''}>
                                        <IconCaretDown />
                                    </div>
                                </button>

                                <AnimateHeight duration={300} height={currentMenu === 'auth' ? 'auto' : 0}>
                                    <ul className="sub-menu text-gray-500">
                                        <li>
                                            <Link href="/maintenence">{t('Buscar currículos')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/meu-recrutamento/curriculos-visualizados">{t('Cvs visualizados')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/maintenence">{t('Comentários')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/meu-recrutamento/minhas-vagas">{t('Minhas vagas')}</Link>
                                        </li>
                                    </ul>
                                </AnimateHeight>
                            </li>
                        </ul>
                        <div className="flex flex-col items-center justify-center">
                            <div className="m-3 w-full max-w-md rounded p-4">
                                <div className="w-full">
                                    <button
                                        onClick={
                                            () => handleOpenModal()
                                        }
                                        className="btn btn-primary mb-3 w-full"
                                    >
                                        Ganhe Dinheiro Conosco
                                    </button>
                                </div>
                                <div className="w-full">
                                    <button className="btn btn-secondary mb-3 w-full">Ganhe Indicando</button>
                                </div>
                                <div className="w-full">
                                    <button className="btn btn-info mb-3 w-full">Seja nosso sócio</button>
                                </div>
                                <div className="w-full">
                                    <button className="btn btn-warning w-full">Skills que mais pagam</button>
                                </div>
                            </div>
                        </div>
                    </PerfectScrollbar>
                </div>
            </nav>
            <LoginView />
            {/* <AuthenticationManager /> */}
        </div>
    );
};

export default Sidebar;
