

export const DadosBasicos = ({register, errors}: any) => {
    // const { register, formState: { errors }, watch } = useFormOn();
    const today = new Date();
    const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;


    return (
        <div>
        <div className="mt-2">
            <label htmlFor="vaga" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Título da Vaga
            </label>
            <input
                {...register('vaga')}
                type="text"
                name="vaga"
                id="vaga"
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-600 focus:ring-blue-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                placeholder="Vaga para Desenvolvedor Full Stack"
                required
            />
            {errors.vaga && <p className="mt-1 text-red-500">{errors.vaga.message}</p>}
        </div>
        <div className="mt-2">
            <label htmlFor="datelimite" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Data limite da vaga
            </label>
            <input
                {...register('datelimite')}
                type="date"
                name="datelimite"
                id="datelimite"
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-600 focus:ring-blue-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                placeholder="name@company.com"
                defaultValue={date}
                required
            />
        </div>
        <div className="mt-2">
            <label htmlFor="descricao" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Descrição da vaga
            </label>
            <textarea
                {...register('descricao')}
                name="descricao"
                id="descricao"
                className="block h-[250px] w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-600 focus:ring-blue-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                placeholder="Escreva as informações sobre a vaga...."
                required
            />
            {errors.descricao && <p className="mt-1 text-red-500">{errors.descricao.message}</p>}
        </div>
    </div>
    )
}
