import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AuthForm } from "../AuthForm";
import { loginAction } from "../actions";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/character");
  }
  return <AuthForm mode="login" action={loginAction} />;
}
