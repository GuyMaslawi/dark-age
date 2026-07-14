import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AuthForm } from "../AuthForm";
import { registerAction } from "../actions";

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/character");
  }
  return <AuthForm mode="register" action={registerAction} />;
}
