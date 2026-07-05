import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/admin/auth";
import { updateSupportTicket } from "@/lib/admin/actions";
import type { Profile, SupportTicket } from "@/lib/database.types";

const ticketStatuses: SupportTicket["status"][] = ["open", "in_review", "answered", "resolved", "closed"];
const priorities: SupportTicket["priority"][] = ["low", "medium", "high", "urgent"];

export default async function AdminSupportPage() {
  const { supabase } = await requireAdmin();
  const [{ data: tickets }, { data: users }] = await Promise.all([
    supabase.from("support_tickets").select("*").order("created_at", { ascending: false }),
    supabase.from("profiles").select("id, email, full_name, owner_name, business_name")
  ]);
  const userMap = new Map(
    ((users ?? []) as Pick<Profile, "id" | "email" | "full_name" | "owner_name" | "business_name">[]).map((user) => [user.id, user])
  );

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-semibold text-jade-700">Admin</p>
        <h2 className="page-title">Suporte</h2>
        <p className="mt-2 text-sm text-zinc-600">Liste tickets, responda clientes, altere prioridade e feche atendimentos.</p>
      </div>

      <section className="grid gap-4">
        {((tickets ?? []) as SupportTicket[]).map((ticket) => {
          const user = userMap.get(ticket.user_id);
          return (
            <form action={updateSupportTicket} className="section-panel grid gap-4" key={ticket.id}>
              <input name="ticket_id" type="hidden" value={ticket.id} />
              <input name="user_id" type="hidden" value={ticket.user_id} />
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                <div>
                  <p className="text-sm text-zinc-500">{user?.full_name || user?.owner_name || user?.email || ticket.user_id}</p>
                  <h3 className="text-lg font-semibold text-ink">{ticket.subject}</h3>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-600">{ticket.message}</p>
                </div>
                <div className="grid gap-2 md:min-w-56">
                  <select className="rounded-md border border-line px-3 py-2" defaultValue={ticket.status} name="status">
                    {ticketStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <select className="rounded-md border border-line px-3 py-2" defaultValue={ticket.priority} name="priority">
                    {priorities.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <textarea className="min-h-28 rounded-md border border-line px-3 py-2" defaultValue={ticket.admin_response ?? ""} name="admin_response" placeholder="Resposta do administrador" />
              <div className="flex justify-end">
                <Button type="submit">Salvar resposta</Button>
              </div>
            </form>
          );
        })}
        {(tickets ?? []).length === 0 ? <div className="section-panel text-sm text-zinc-600">Nenhum ticket encontrado.</div> : null}
      </section>
    </div>
  );
}
