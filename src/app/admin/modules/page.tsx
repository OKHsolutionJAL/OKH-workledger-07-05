import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/admin/auth";
import { toggleModuleAccess } from "@/lib/admin/actions";
import type { Profile, UserModuleAccess } from "@/lib/database.types";

const modules: UserModuleAccess["module_name"][] = [
  "work_entries",
  "clients",
  "reports",
  "japan_documents",
  "australia_documents",
  "expenses",
  "materials",
  "tax_export",
  "support",
  "courses",
  "admin_access"
];

export default async function AdminModulesPage() {
  const { supabase } = await requireAdmin();
  const [{ data: users }, { data: accessRows }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("user_module_access").select("*")
  ]);

  const accessMap = new Map((accessRows ?? []).map((row) => [`${row.user_id}:${row.module_name}`, row as UserModuleAccess]));

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-semibold text-jade-700">Admin</p>
        <h2 className="page-title">Modulos</h2>
        <p className="mt-2 text-sm text-zinc-600">Ligue ou desligue modulos por usuario usando a tabela user_module_access.</p>
      </div>

      <section className="section-panel">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Modulos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {((users ?? []) as Profile[]).map((user) => (
                <tr key={user.id}>
                  <td>
                    <span className="font-semibold text-ink">{user.full_name || user.owner_name || user.email || user.id}</span>
                    <span className="block text-xs text-zinc-500">{user.role}</span>
                  </td>
                  <td>
                    <div className="grid gap-2 md:grid-cols-3">
                      {modules.map((moduleName) => {
                        const row = accessMap.get(`${user.id}:${moduleName}`);
                        const enabled = row?.is_enabled ?? true;
                        return (
                          <form action={toggleModuleAccess} className="flex items-center justify-between gap-2 rounded-md border border-line bg-white px-3 py-2" key={moduleName}>
                            <input name="user_id" type="hidden" value={user.id} />
                            <input name="module_name" type="hidden" value={moduleName} />
                            <input name="is_enabled" type="hidden" value={enabled ? "false" : "true"} />
                            <span className="text-xs font-medium text-zinc-700">{moduleName}</span>
                            <Button type="submit" variant={enabled ? "secondary" : "danger"}>
                              {enabled ? "ON" : "OFF"}
                            </Button>
                          </form>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
