'use client';

import IconGithub from '@/presentation/icons/icon-github';
import IconPencilPaper from '@/presentation/icons/icon-pencil-paper';
import IconPrinter from '@/presentation/icons/icon-printer';
import Modal from '@/presentation/modules/MeusDados/SobreMim/application/components/modal-composition';
import Tippy from '@tippyjs/react';
import { useState } from 'react';

const PreviewCandidatoComponent = () => {
    const exportTable = () => {
        window.print();
    };

    const [range1, setRange1] = useState<any>('0');

    const [modalOpen, setModalOpen] = useState(false);

    const handleAvaliaCandidato = () => {
        setModalOpen(!modalOpen);
    };

    return (
        <div>
            <div className="mb-6 flex flex-wrap items-center justify-center gap-4 lg:justify-end">
                <button type="button" className="btn btn-primary gap-2" onClick={() => exportTable()}>
                    <IconPrinter />
                    Download Currículo
                </button>
            </div>
            <div className="panel">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2 px-4">
                        <h2 className="text-2xl font-semibold uppercase">Daniel Calistrato</h2>
                        <h2 className="text-2xl font-semibold uppercase">Desenvolvedor Front-End</h2>
                        <Tippy content="Favoritar Candidato" theme="warning" className="rounded px-1 py-1">
                        </Tippy>
                    </div>
                    <div className="ml-4 flex flex-row justify-between gap-4">
                        <div className="flex flex-row gap-4 self-end">
                            <button className="btn btn-dark flex h-10 w-10 items-center justify-center rounded-full p-0">
                                <IconGithub />
                            </button>
                        </div>

                        <button type="button" className="btn btn-primary gap-2" onClick={() => handleAvaliaCandidato()}>
                            <IconPencilPaper />
                            Avaliar
                        </button>
                    </div>
                </div>
                <hr className="my-6 border-white-light dark:border-[#1b2e4b]" />
                <div className="flex flex-col flex-wrap justify-between gap-6 lg:flex-row">
                    <div className="flex-1">
                        <div className="space-y-1 text-white-dark">
                            <div>
                                E-mail: <span className="font-semibold text-black dark:text-white">dan@teste.com.br</span>
                            </div>
                            <div>
                                Sistema de trabalho Preferido: <span className="font-semibold text-black dark:text-white">Remoto</span>
                            </div>
                            <div>
                                Experiência: <span className="font-semibold text-black dark:text-white">2 anos</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col justify-between gap-6 sm:flex-row lg:w-2/3">
                        <div className="xl:1/3 sm:w-1/2 lg:w-2/5">
                            <div className="mb-2 flex w-full items-center justify-between">
                                <div className="text-white-dark">Pretensão Pagamento PJ:</div>
                                <div>R$15.000,00</div>
                            </div>
                            <div className="mb-2 flex w-full items-center justify-between">
                                <div className="text-white-dark">Pretensão Pagamento CLT:</div>
                                <div>à combinar</div>
                            </div>
                            <div className="mb-2 flex w-full items-center justify-between">
                                <div className="text-white-dark">Pretenção Pagamento BTC:</div>
                                <div>à combinar</div>
                            </div>
                        </div>
                    </div>
                </div>
                <hr className="my-6 border-white-light dark:border-[#1b2e4b]" />
                <div className="mb-5 flex flex-wrap gap-6 md:gap-48">
                    <div>
                        <div>
                            <h2 className="font-semibold">Requisitos Obrigatórios Compatíveis com a vaga</h2>
                            <div className="flex flex-wrap items-center  gap-3">
                                <span className="badge badge-outline-success">React</span>
                                <span className="badge badge-outline-success">Javascript</span>
                                <span className="badge badge-outline-success">Typescript</span>
                                <span className="badge badge-outline-success">Solid</span>
                                <span className="badge badge-outline-success">Git</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div>
                            <h2 className="font-semibold">Requisitos Desejáveis Compatíveis com a vaga</h2>
                            <div className="flex flex-wrap items-center  gap-3">
                                <span className="badge badge-outline-success">Saas</span>
                                <span className="badge badge-outline-success">Tailwind</span>
                                <span className="badge badge-outline-success">Material Ui</span>
                                <span className="badge badge-outline-success">Aws</span>
                            </div>
                        </div>
                    </div>
                </div>
                <hr className="my-6 border-white-light dark:border-[#1b2e4b]" />
                <div className="mt-6">
                    <h2 className="font-semibold"> Sobre o Candidato</h2>

                    <textarea rows={4} disabled className="form-textarea h-[250px] ltr:rounded-l-none rtl:rounded-r-none">
                        Sou um desenvolvedor de software altamente motivado e confiável, com formação em tecnologias da informação e mais de 8 anos de vasta experiência em desenvolvimento front-end e
                        diversas linguagens e tecnologias de programação. Minha experiência reside no desenvolvimento de aplicações web escaláveis ​​e de alto desempenho usando as mais recentes
                        ferramentas e metodologias. Com profundo conhecimento em HTML, CSS e JavaScript, tenho experiência em aproveitar frameworks como Bootstrap e Zurb. Minha experiência se estende
                        a bibliotecas e estruturas JavaScript avançadas, principalmente ReactJS, Angular e NextJS. Tenho habilidade em priorizar clientes e ajustar minha agenda para ser eficiente e
                        atender às necessidades do cliente. Tenho uma forte ética de trabalho, organização, comunicação e habilidades de resolução de problemas. Além disso, sou cofundador de um
                        estúdio de web design. Então se precisar de ajuda com seu site fique à vontade para conferir nossa página e entrar em contato conosco 2mwebstudio.com. Minhas habilidades entre
                        outras: 1) JavaScript 2) Angular 3) Reaja 4) Texto datilografado 5) HTML5 6) CSS3 7) Atrevido 8)jQuery 9) Jasmim 10) Git Além de tudo isso, sou criador de conteúdo (Code with
                        Sloba) e consegui construir uma grande comunidade de desenvolvedores em três mídias sociais (+200K). Investi uma década da minha vida para me tornar um desenvolvedor sênior e
                        agora estou ajudando desenvolvedores juniores a se tornarem um desenvolvedor sênior em meses. Canal do Youtube: https://youtube.com/c/codewithsloba Site:
                        https://codewithsloba.com Instagram: https://www.instagram.com/codewithsloba/ Portfólio: https://bobangajicsm.github.io/portfolio/ Se você quiser se conectar e saber mais,
                        fique à vontade para me seguir! Como tenho no máximo 30k conexões
                    </textarea>
                </div>
            </div>

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(!modalOpen)} title="Avaliar Candidato">
                <div className="mb-5 pt-5">
                    <div className="flex flex-row items-center gap-2 font-bold">
                        <h2>Comportamental</h2>
                        <div>
                            <span className="inline-block rounded border border-white-light px-2 py-1 text-primary dark:border-dark">{range1}</span>
                            <span>%</span>
                        </div>
                    </div>
                    <input type="range" className="w-full py-2.5" value={range1} min={0} max={100} onChange={(e) => setRange1(e.target.value)} />
                </div>
                <div className="mb-5 pt-5">
                    <div className="flex flex-row items-center gap-2 font-bold">
                        <h2>Habilidades técnicas</h2>
                        <div>
                            <span className="inline-block rounded border border-white-light px-2 py-1 text-primary dark:border-dark">{range1}</span>
                            <span>%</span>
                        </div>
                    </div>
                    <input type="range" className="w-full py-2.5" value={range1} min={0} max={100} onChange={(e) => setRange1(e.target.value)} />
                </div>
                <div className="mb-5 pt-5">
                    <div className="flex flex-row items-center gap-2 font-bold">
                        <h2>Experiência prévia</h2>
                        <div>
                            <span className="inline-block rounded border border-white-light px-2 py-1 text-primary dark:border-dark">{range1}</span>
                            <span>%</span>
                        </div>
                    </div>
                    <input type="range" className="w-full py-2.5" value={range1} min={0} max={100} onChange={(e) => setRange1(e.target.value)} />
                </div>
                <div className="mb-5 pt-5">
                    <div className="flex flex-row items-center gap-2 font-bold">
                        <h2>Comunicação</h2>
                        <div>
                            <span className="inline-block rounded border border-white-light px-2 py-1 text-primary dark:border-dark">{range1}</span>
                            <span>%</span>
                        </div>
                    </div>
                    <input type="range" className="w-full py-2.5" value={range1} min={0} max={100} onChange={(e) => setRange1(e.target.value)} />
                </div>

                <div className="mb-5 pt-5">
                    <div className="flex flex-row items-center gap-2 font-bold">
                        <h2>Média Avaliação:</h2>
                        <div>
                            <span className="inline-block rounded border border-white-light px-2 py-1 text-primary dark:border-dark">{range1}</span>
                            <span>%</span>
                        </div>
                    </div>
                </div>
                <div className='flex justify-end'>
                    <button type="button" className="btn btn-primary gap-2" onClick={() => handleAvaliaCandidato()}>
                        <IconPencilPaper />
                        Salvar Avaliação
                    </button>
                    </div>
            </Modal>
        </div>
    );
};

export default PreviewCandidatoComponent;
