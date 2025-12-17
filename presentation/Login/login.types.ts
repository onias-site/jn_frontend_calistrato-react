import { z } from "zod";
import { emailSchema, passwordSchema, tokenPasswordSchema } from "./login.schema";

export type TFormData = z.infer<typeof emailSchema>;

export type TFormDataPassword = z.infer<typeof passwordSchema>;

export type TFormTokenPassword = z.infer<typeof tokenPasswordSchema>;