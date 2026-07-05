import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/database.types";

export type UserRole = Profile["role"];

export async function getCurrentUserRole() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    return data?.role ?? "client";
  } catch {
    return null;
  }
}

export async function isAdmin() {
  return (await getCurrentUserRole()) === "admin";
}

export async function requireAdmin() {
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
    const { data } = await supabase
      .from("profiles")
      .select("id, role, full_name, owner_name, business_name, email, account_status, subscription_status")
      .eq("id", user.id)
      .maybeSingle();
    profile = data;
  } catch {
    redirect("/dashboard");
  }

  if (profile?.role !== "admin") redirect("/dashboard");

  return { supabase, user, profile };
}
