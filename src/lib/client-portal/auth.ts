import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function requirePortalSession() {
  let supabase;
  let user = null;

  try {
    supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    redirect("/login");
  }

  if (!user) redirect("/login");

  let profile = null;
  try {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
    profile = data;
  } catch {
    redirect("/login");
  }

  if (!profile) redirect("/login");

  return { supabase, user, profile };
}

export async function requireWorker() {
  const session = await requirePortalSession();
  if (session.profile.role !== "admin" && session.profile.user_type === "client_company") {
    redirect("/client-portal/dashboard");
  }
  return session;
}

export async function requireClientCompany() {
  const session = await requirePortalSession();
  if (session.profile.role !== "admin" && session.profile.user_type !== "client_company" && session.profile.user_type !== "both") {
    redirect("/dashboard");
  }
  return session;
}
