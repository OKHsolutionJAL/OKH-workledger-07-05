import { Badge } from "@/components/ui/badge";

type BadgeTone = "neutral" | "green" | "amber" | "red" | "blue";

export function StatusBadge({ status }: { status: string | boolean }) {
  if (typeof status === "boolean") {
    return <Badge tone={status ? "green" : "neutral"}>{status ? "Ativo" : "Inativo"}</Badge>;
  }

  const tone: BadgeTone =
    status === "ACTIVE" || status === "COMPLETED" || status === "DONE" || status === "CONFIRMED"
      ? "green"
      : status === "PENDING" || status === "IN_PROGRESS" || status === "SENT"
        ? "amber"
        : status === "CANCELLED" || status === "INACTIVE"
          ? "red"
          : "neutral";

  const labels: Record<string, string> = {
    ACTIVE: "Ativo",
    INACTIVE: "Inativo",
    PENDING: "Pendente",
    CONFIRMED: "Confirmado",
    IN_PROGRESS: "Em andamento",
    COMPLETED: "Concluido",
    CANCELLED: "Cancelado",
    SENT: "Enviado",
    DONE: "Feito",
    PAST_DUE: "Em atraso",
  };

  return <Badge tone={tone}>{labels[status] ?? status}</Badge>;
}
