import { z } from "zod";

export const candidatoSchema = z.object({
    sobreMim: z.string().min(1, 'Descrição deve ter no mínimo 100 caracteres'),
    empresasExcluidas: z.string().optional(),
    vagaExclusivaPCD: z.boolean().optional(),
    cargoRecenteAtual: z.string().optional(),
    cargoDesejado: z.string().optional(),
    experiencia: z.string().optional(),
    remoto: z.boolean().optional(),
    hibrido: z.boolean().optional(),
    presencial: z.boolean().optional(),
    clt: z.boolean().optional(),
    pj: z.boolean().optional(),
    btc: z.boolean().optional(),
    pcd: z.boolean().optional(),
    pagamentopj: z.string().optional(),
    pagamentoclt: z.string().optional(),
    pagamentobtc: z.string().optional(),
    pretensaoPJ: z.string().optional(),
    pretensaoCLT: z.string().optional(),
    estadoSelecionadoId: z.string().optional(),
});
export type FormData = z.infer<typeof candidatoSchema>;
