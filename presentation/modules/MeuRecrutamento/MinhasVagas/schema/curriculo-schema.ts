import { z } from "zod";

export type FormData = z.infer<typeof schema>;

export const schema = z.object({
    vaga: z.string().min(5, 'Vaga deve ter no mínimo 5 caracteres'),
    datelimite: z.string(),
    descricao: z.string().min(100, 'Descrição deve ter no mínimo 100 caracteres'),
    pagamentopj: z.string().nullable(),
    pagamentoclt: z.string().nullable(),
    pagamentobtc: z.string().nullable(),
    homeoffice: z.boolean(),
    estado_id: z.string().nullable().optional(),
    pcd: z.boolean(),
    deficiencia_id: z.string().nullable().optional(),
    contato: z.string().nullable(),
});
