import { TableClient } from "@/models/table-client.model";

export const calculateTableStatus = (clients: TableClient[]) => {
  if (clients.length === 0) {
    return "FREE";
  }

  const totalClients = clients.length;
  const paidClients = clients.filter((client) => client.amountDue === 0).length;

  if (paidClients === 0) return "OCCUPIED";
  if (paidClients === totalClients) return "PAID";
  return "PARTIALLY_PAID";
};

export const calculateTotalAmount = (clients: TableClient[]) => {
  return clients.reduce((sum, client) => sum + (client.amountDue || 0), 0);
};

export const getStatusConfig = (status: string) => {
  const configs = {
    PAID: {
      icon: "Check",
      label: "Payée",
      bgClass: "bg-status-paid-bg",
      textClass: "text-status-paid",
    },
    OCCUPIED: {
      icon: "Clock",
      label: "Occupée",
      bgClass: "bg-status-unpaid-bg",
      textClass: "text-status-unpaid",
    },
    PARTIALLY_PAID: {
      icon: "AlertCircle",
      label: "Partiel",
      bgClass: "bg-status-partial-bg",
      textClass: "text-status-partial",
    },
    FREE: {
      icon: "Circle",
      label: "Libre",
      bgClass: "bg-status-empty-bg",
      textClass: "text-status-empty",
    },
  };

  return configs[status as keyof typeof configs] || configs.FREE;
};
