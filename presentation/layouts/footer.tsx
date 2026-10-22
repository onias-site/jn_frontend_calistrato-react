import Link from 'next/link';

const Footer = () => {
    return (
            // flex-wrap: numa tela estreita os itens descem para a linha de baixo em vez de passar da largura da tela
            <footer className="mt-auto flex w-full flex-wrap justify-center gap-x-12 gap-y-2 px-5 py-6">
            <div className="text-center dark:text-white-dark">© {new Date().getFullYear()}. JobsNow.</div>
            <Link href="#" className="text-center hover:text-primary hover:underline dark:text-white-dark">Os donos do sistema</Link>
            <Link href="#" className="text-center hover:text-primary hover:underline dark:text-white-dark">História do JobsNow</Link>
            <Link href="/nosso-backend" className="text-center hover:text-primary hover:underline dark:text-white-dark">Nosso Backend</Link>
            {/* <div className="p-6 pt-0 mt-auto text-center dark:text-white-dark ltr:sm:text-left rtl:sm:text-right">Tarifas e recompensas</div> */}

            </footer>
    );
};

export default Footer;
