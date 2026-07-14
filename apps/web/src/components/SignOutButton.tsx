import { signOut } from "@/auth";

export function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/login" });
      }}
    >
      <button
        type="submit"
        className="rounded-md border border-void-edge px-3 py-1.5 text-xs text-neutral-300 transition-colors hover:border-blood/60 hover:text-red-300"
      >
        יציאה
      </button>
    </form>
  );
}
