import { z } from "zod";

export const credentialsSchema = z.object({
  email: z.string().email("כתובת אימייל לא תקינה"),
  password: z.string().min(8, "הסיסמה חייבת להכיל לפחות 8 תווים"),
});

export const registerSchema = credentialsSchema
  .extend({
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "הסיסמאות אינן תואמות",
    path: ["confirmPassword"],
  });

export type CredentialsInput = z.infer<typeof credentialsSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export const characterNameSchema = z
  .string()
  .trim()
  .min(2, "השם חייב להכיל לפחות 2 תווים")
  .max(16, "השם יכול להכיל עד 16 תווים")
  .regex(
    /^[א-תa-zA-Z0-9 ]+$/,
    "השם יכול להכיל אותיות עברית או אנגלית, ספרות ורווחים בלבד",
  );

export const createClanSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "שם השבט חייב להכיל לפחות 3 תווים")
    .max(24, "שם השבט יכול להכיל עד 24 תווים")
    .regex(/^[א-תa-zA-Z0-9 ]+$/, "שם השבט מכיל תווים לא חוקיים"),
  tag: z
    .string()
    .trim()
    .min(2, "התג חייב להכיל לפחות 2 תווים")
    .max(4, "התג יכול להכיל עד 4 תווים")
    .regex(/^[א-תa-zA-Z0-9]+$/, "התג מכיל תווים לא חוקיים"),
  description: z.string().trim().max(200, "התיאור ארוך מדי").optional(),
});

export type CreateClanInput = z.infer<typeof createClanSchema>;

export const createCharacterSchema = z.object({
  name: characterNameSchema,
  gender: z.enum(["MALE", "FEMALE"]),
  avatarKey: z.string().min(1),
});

export type CreateCharacterInput = z.infer<typeof createCharacterSchema>;
