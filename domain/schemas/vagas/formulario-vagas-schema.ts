import { z } from "zod";


export const schema = z.object({
    vaga: z.string().min(5, 'Vaga deve ter no mínimo 5 caracteres'),
    datelimite: z.string(),
    descricao: z.string().min(100, 'Descrição deve ter no mínimo 100 caracteres'),
    status: z.string(),
    pagamentopj: z.string().optional(),
    pagamentoclt: z.string().optional(),
    pagamentobtc: z.string().optional(),
});
export type FormData = z.infer<typeof schema> & {
    obrigatorios: any[];
    desejaveis: any[];
    sortable: any[];
};
