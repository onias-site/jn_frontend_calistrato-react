import IconHome from "@/presentation/icons/icon-home";
import IconUser from "@/presentation/icons/icon-user";
import { IconListCheck, IconNotesEdit } from "@/presentation/icons";
import IconDollarSignCircle from "@/presentation/icons/icon-dollar-sign-circle";

export const NextStepper = ({stepper, nextStep}: {stepper: number, nextStep: () => void}) => {

    const widthMap = {
        1: 'w-[10%]',
        2: 'w-[30%]',
        3: 'w-[50%]',
        4: 'w-[70%]',
        default: 'w-[90%]',
    };

    const width = widthMap[stepper as keyof typeof widthMap] || widthMap.default;
    return (
        <div className="relative z-[1] overflow-x-auto">
                        <div className={`${width} absolute top-[30px] -z-[1] m-auto h-1 w-[15%] bg-primary transition-[width] ltr:left-0 rtl:right-0`}></div>
                        <ul className="mb-5 grid min-w-[500px] grid-cols-5">
                            <li className="mx-auto flex flex-col items-center">
                                <button
                                    type="button"
                                    className={`${stepper === 1 ? '!border-primary !bg-primary text-white' : ''}
                    flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-[#f3f2ee] bg-white dark:border-[#1b2e4b] dark:bg-[#253b5c]`}
                                    onClick={nextStep}
                                >
                                    <IconHome />
                                </button>
                                <span className={`${stepper === 1 ? 'text-primary ' : ''}text-center mt-2 block`}>Dados Básicos</span>
                            </li>
                            <li className="mx-auto flex flex-col items-center">
                                <button
                                    type="button"
                                    className={`${stepper === 2 ? '!border-primary !bg-primary text-white' : ''}
                                                flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-[#f3f2ee] bg-white dark:border-[#1b2e4b] dark:bg-[#253b5c]`}
                                    onClick={nextStep}
                                >
                                    <IconUser className="h-5 w-5" />
                                </button>
                                <span className={`${stepper === 2 ? 'text-primary ' : ''}text-center mt-2 block`}>Filtrar candidatos</span>
                            </li>
                            <li className="mx-auto flex flex-col items-center">
                                <button
                                    type="button"
                                    className={`${stepper === 3 ? '!border-primary !bg-primary text-white' : ''}
                                                flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-[#f3f2ee] bg-white dark:border-[#1b2e4b] dark:bg-[#253b5c]`}
                                    onClick={nextStep}
                                >
                                    <IconListCheck className="h-5 w-5" />
                                </button>
                                <span className={`${stepper === 3 ? 'text-primary ' : ''}text-center mt-2 block`}>Filtrar requisitos</span>
                            </li>
                            <li className="mx-auto flex flex-col items-center">
                                <button
                                    type="button"
                                    className={`${stepper === 4 ? '!border-primary !bg-primary text-white' : ''}
                            flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-[#f3f2ee] bg-white dark:border-[#1b2e4b] dark:bg-[#253b5c]`}
                                    onClick={nextStep}
                                >
                                    <IconNotesEdit className="h-5 w-5" />
                                </button>
                                <span className={`${stepper === 4 ? 'text-primary ' : ''}text-center mt-2 block`}>Ordenar candidatos</span>
                            </li>
                            <li className="mx-auto flex flex-col items-center">
                                <button
                                    type="button"
                                    className={`${stepper === 5 ? '!border-primary !bg-primary text-white' : ''}
                            flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-[#f3f2ee] bg-white dark:border-[#1b2e4b] dark:bg-[#253b5c]`}
                                    onClick={nextStep}
                                >
                                    <IconDollarSignCircle className="h-5 w-5" />
                                </button>
                                <span className={`${stepper === 5 ? 'text-primary ' : ''}text-center mt-2 block`}>Serviços Extras</span>
                            </li>
                        </ul>
                    </div>
    )
};
