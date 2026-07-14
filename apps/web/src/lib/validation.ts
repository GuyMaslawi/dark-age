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

export const createCharacterSchema = z.object({
  name: characterNameSchema,
  gender: z.enum(["MALE", "FEMALE"]),
  avatarKey: z.string().min(1),
});

export type CreateCharacterInput = z.infer<typeof createCharacterSchema>;
