import { z } from "zod";

export const emailSchema = z
  .object({
    email: z.string().min(1, "O campo email é obrigatório"),
  })
  .transform((field) => ({
    email: field.email,
  }));

export const passwordSchema = z
  .object({
    password: z.string()
    .min(1, "O campo de senha é obrigatório")
    .min(8, "A senha deve ter no mínimo 8 caracteres"),
  })
  .transform((field) => ({
    password: field.password,
  }));


export const tokenPasswordSchema = z.object({
    token: z.string()
        .length(8, "O token deve ter exatamente 8 caracteres"),
    password: z.string()
        .min(1, "O campo de senha é obrigatório"),
    confirmPassword: z.string()
        .min(8, "A confirmação de senha deve ter no mínimo 8 caracteres")
}).refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
})
  .transform((field) => ({
    token: field.token,
    password: field.password,
    confirmPassword: field.confirmPassword,
  }));
