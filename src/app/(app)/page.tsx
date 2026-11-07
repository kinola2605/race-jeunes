import { redirect } from "next/navigation";
import { requireUser } from "@/server/auth/session";

export default async function Home() {
  const user = await requireUser();
  redirect(user.role === "ADMIN" ? "/admin" : "/accueil");
}
