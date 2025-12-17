import IconInfoCircle from '@/presentation/icons/icon-info-circle';
import Tippy from '@tippyjs/react';
import useFiltroCandidatoStore from '../../../infra/store/filtro-candidato-store';
import { Estados } from '@/domain/models/view-vagas-model';

export const FiltroCandidatos =({register, errors}: any) => {
    const {
        isRemoto, toggleRemoto,
        isHibrido, toggleHibrido,
        isPresencial, togglePresencial,
        isPcd, togglePcd,
        isClt, toggleClt,
        isPj, togglePj,
        isBtc, toggleBtc,
        estadoSelecionadoId, setEstadoSelecionadoId,
        estados
    } = useFiltroCandidatoStore();

    return (
        <div>
            <div className="mb-5">
                <label htmlFor="web" className="font-bold">
                    Sistema da vaga
                </label>
                <div className="mb-5 flex flex-row gap-6">
                    <div>
                        <span className="relative text-white-dark checked:bg-none">Remoto</span>
                        <div className="relative h-6 w-12">
                            <input
                                type="checkbox"
                                checked={isRemoto}
                                onChange={toggleRemoto}
                                className="custom_switch peer absolute z-10 h-full w-full cursor-pointer opacity-0"
                                id="custom_switch_checkbox1"
                            />
                            <span className="block h-full rounded-full bg-[#ebedf2] before:absolute before:bottom-1 before:left-1 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-all before:duration-300 peer-checked:bg-primary peer-checked:before:left-7 dark:bg-dark dark:before:bg-white-dark dark:peer-checked:before:bg-white"></span>
                        </div>
                    </div>
                    <div>
                        <span className="relative text-white-dark checked:bg-none">Híbrido</span>
                        <div className="relative h-6 w-12">
                            <input
                                type="checkbox"
                                checked={isHibrido}
                                onChange={toggleHibrido}
                                className="custom_switch peer absolute z-10 h-full w-full cursor-pointer opacity-0"
                                id="custom_switch_checkbox1"
                            />
                            <span className="block h-full rounded-full bg-[#ebedf2] before:absolute before:bottom-1 before:left-1 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-all before:duration-300 peer-checked:bg-primary peer-checked:before:left-7 dark:bg-dark dark:before:bg-white-dark dark:peer-checked:before:bg-white"></span>
                        </div>
                    </div>

                    <div>
                        <span className="relative text-white-dark checked:bg-none">Presencial</span>
                        <div className="relative h-6 w-12">
                            <input
                                type="checkbox"
                                checked={isPresencial}
                                onChange={togglePresencial}
                                className="custom_switch peer absolute z-10 h-full w-full cursor-pointer opacity-0"
                                id="custom_switch_checkbox1"
                            />
                            <span className="block h-full rounded-full bg-[#ebedf2] before:absolute before:bottom-1 before:left-1 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-all before:duration-300 peer-checked:bg-primary peer-checked:before:left-7 dark:bg-dark dark:before:bg-white-dark dark:peer-checked:before:bg-white"></span>
                        </div>
                    </div>
                </div>
                <label htmlFor="estados">Selecione a região da Vaga anunciada</label>
                    <select id="estados" value={estadoSelecionadoId} onChange={(e) => setEstadoSelecionadoId(e.target.value)}  disabled={isRemoto} className="form-select text-white-dark" name="estados">
                        {estados.map((estado: Estados) => (
                            <option key={estado.id} value={estado.id} selected={estado.selected}>
                                {estado.nome}
                            </option>
                        ))}
                    </select>
            </div>
            <div className="mb-5">
                <div className="mb-5">
                    <label className="relative mb-2 font-bold checked:bg-none">Vaga exclusiva (PCD)</label>
                    <div className="relative h-6 w-12">
                        <input
                            type="checkbox"
                            checked={isPcd}
                            onChange={togglePcd}
                            className="custom_switch peer absolute z-10 h-full w-full cursor-pointer opacity-0"
                            id="custom_switch_checkbox1"
                        />
                        <span className="block h-full rounded-full bg-[#ebedf2] before:absolute before:bottom-1 before:left-1 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-all before:duration-300 peer-checked:bg-primary peer-checked:before:left-7 dark:bg-dark dark:before:bg-white-dark dark:peer-checked:before:bg-white"></span>
                    </div>
                </div>
            </div>
            <div className="mb-5">
                <label className="relative mb-2 font-bold checked:bg-none">Tipo de Contrato</label>
                <div className="flex flex-row gap-8">
                    <div className="mb-5 text-center">
                        <span className="relative text-center text-white-dark checked:bg-none">CLT</span>
                        <div className="relative h-6 w-12">
                            <input
                                checked={isClt}
                                onChange={toggleClt}
                                type="checkbox"
                                className="custom_switch peer absolute z-10 h-full w-full cursor-pointer opacity-0"
                                id="custom_switch_checkbox1"
                            />
                            <span className="block h-full rounded-full bg-[#ebedf2] before:absolute before:bottom-1 before:left-1 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-all before:duration-300 peer-checked:bg-primary peer-checked:before:left-7 dark:bg-dark dark:before:bg-white-dark dark:peer-checked:before:bg-white"></span>
                        </div>
                    </div>
                    <div className="mb-5 text-center">
                        <span className="relative text-white-dark checked:bg-none">PJ</span>
                        <div className="relative h-6 w-12">
                            <input
                                checked={isPj}
                                onChange={togglePj}
                                type="checkbox"
                                className="custom_switch peer absolute z-10 h-full w-full cursor-pointer opacity-0"
                                id="custom_switch_checkbox1"
                            />
                            <span className="block h-full rounded-full bg-[#ebedf2] before:absolute before:bottom-1 before:left-1 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-all before:duration-300 peer-checked:bg-primary peer-checked:before:left-7 dark:bg-dark dark:before:bg-white-dark dark:peer-checked:before:bg-white"></span>
                        </div>
                    </div>
                </div>
                <div className="mb-5">
                    <div className="mb-2 flex flex-row items-center gap-2">
                        Pretensão PJ
                        <Tippy content="Esse campo é opcional, caso deixe em branco é entendido que o valor será à combinar." theme="primary">
                            <button>
                                <IconInfoCircle className="h-5 w-5" />
                            </button>
                        </Tippy>
                    </div>
                    <input {...register('pagamentopj')} name="pagamentopj" type="text" placeholder="Ex. R$15.000,00" className="form-input" />
                    {errors.pagamentopj && <p>{errors.pagamentopj.message}</p>}
                </div>

                <div className="mb-5">
                    <div className="mb-2 flex flex-row items-center gap-2">
                        Pretensão CLT
                        <Tippy content="Esse campo é opcional, caso deixe em branco é entendido que o valor será à combinar." theme="primary">
                            <button>
                                <IconInfoCircle className="h-5 w-5" />
                            </button>
                        </Tippy>
                    </div>
                    <input {...register('pagamentoclt')} name="pagamentoclt" type="number" placeholder="Ex. R$10.000,00" className="form-input" />
                </div>
            </div>
            <div className="mb-5">
                <div className="flex flex-row items-center gap-2">
                    <p className="font-bold">Deseja pagar em Bitcoin?</p>
                    <Tippy
                        content={
                            <>
                                A Lightning Network é uma rede de pagamentos instantâneos construída sobre o Bitcoin, permitindo transações mais rápidas e baratas.
                                <a href="https://lightning.network/lightning-network-summary.pdf" target="_blank" rel="noopener noreferrer" className="ml-1 text-blue-500 hover:underline">
                                    Saiba mais
                                </a>
                            </>
                        }
                        theme="primary"
                        interactive={true}
                    >
                        <button>
                            <IconInfoCircle className="h-5 w-5" />
                        </button>
                    </Tippy>
                </div>
                <div className="mb-5 flex flex-row gap-2">
                    <div className="relative h-6 w-12">
                        <input
                            checked={isBtc}
                            onChange={toggleBtc}
                            type="checkbox"
                            className="custom_switch peer absolute z-10 h-full w-full cursor-pointer opacity-0"
                            id="custom_switch_checkbox1"
                        />
                        <span className="block h-full rounded-full bg-[#ebedf2] before:absolute before:bottom-1 before:left-1 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-all before:duration-300 peer-checked:bg-primary peer-checked:before:left-7 dark:bg-dark dark:before:bg-white-dark dark:peer-checked:before:bg-white"></span>
                    </div>
                </div>
                <div className="mb-5">
                    <input {...register('pagamentobtc')} name="pagamentobtc" type="text" placeholder="Ex. 0,039฿ " className="form-input" />
                </div>
            </div>
        </div>
    );
};
