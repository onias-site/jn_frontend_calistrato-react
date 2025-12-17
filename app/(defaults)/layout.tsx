import ContentAnimation from '@/presentation/layouts/content-animation';
import Footer from '@/presentation/layouts/footer';
import Header from '@/presentation/layouts/header';
import MainContainer from '@/presentation/layouts/main-container';
import Overlay from '@/presentation/layouts/overlay';
import ScrollToTop from '@/presentation/layouts/scroll-to-top';
import Setting from '@/presentation/layouts/setting';
import Sidebar from '@/presentation/layouts/sidebar';


export default function DefaultLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <div className="relative">
                <Overlay />
                <ScrollToTop />
                <Setting />
                <MainContainer>
                    <Sidebar />
                    <div className="main-content flex flex-col min-h-screen">
                        <Header />
                        <ContentAnimation>{children}</ContentAnimation>
                        <Footer />
                    </div>
                </MainContainer>
            </div>
        </>
    );
}
