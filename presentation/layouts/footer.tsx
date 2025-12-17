const Footer = () => {
    return (
            <footer className="flex flex-row w-ful justify-center py-6 px-5 mt-auto">
            <div className="p-6 pt-0 mt-auto text-center dark:text-white-dark ltr:sm:text-left rtl:sm:text-right">© {new Date().getFullYear()}. JobsNow.</div>
            <div className="p-6 pt-0 mt-auto text-center dark:text-white-dark ltr:sm:text-left rtl:sm:text-right">Sobre Nós</div>
            <div className="p-6 pt-0 mt-auto text-center dark:text-white-dark ltr:sm:text-left rtl:sm:text-right">Linkedin FrontEnd</div>
            {/* <div className="p-6 pt-0 mt-auto text-center dark:text-white-dark ltr:sm:text-left rtl:sm:text-right">Tarifas e recompensas</div> */}

            </footer>
    );
};

export default Footer;
