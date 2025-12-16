// src/components/tableCard.tsx
import { Check, Clock, Users, Circle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { RestaurantTable } from "@/models/restaurant-table.model";
import { TableStatus } from "@/models/table-status.model";

interface TableCardProps {
  table: RestaurantTable;
  onClick: (table: RestaurantTable) => void;
  isAnimating?: boolean;
}

const statusConfig: Record<
  TableStatus,
  {
    icon: typeof Check;
    label: string;
    bgClass: string;
    textClass: string;
    borderClass: string;
    iconClass?: string;
  }
> = {
  [TableStatus.PAID]: {
    icon: Check,
    label: "Payée",
    bgClass: "bg-green-100 dark:bg-green-900/20",
    textClass: "text-green-700 dark:text-green-400",
    borderClass: "border-green-300 dark:border-green-800",
    iconClass: "text-green-600",
  },
  [TableStatus.OCCUPIED]: {
    icon: Clock,
    label: "Occupée",
    bgClass: "bg-orange-100 dark:bg-orange-900/20",
    textClass: "text-orange-700 dark:text-orange-400",
    borderClass: "border-orange-300 dark:border-orange-800",
    iconClass: "text-orange-600",
  },
  [TableStatus.PARTIALLY_PAID]: {
    icon: AlertCircle,
    label: "Partiellement payée",
    bgClass: "bg-yellow-100 dark:bg-yellow-900/20",
    textClass: "text-yellow-700 dark:text-yellow-400",
    borderClass: "border-yellow-300 dark:border-yellow-800",
    iconClass: "text-yellow-600",
  },
  [TableStatus.FREE]: {
    icon: Circle,
    label: "Libre",
    bgClass: "bg-gray-100 dark:bg-gray-800",
    textClass: "text-gray-700 dark:text-gray-400",
    borderClass: "border-gray-300 dark:border-gray-700",
    iconClass: "text-gray-500",
  },
};

export function TableCard({ table, onClick, isAnimating }: TableCardProps) {
  const config = statusConfig[table.status];
  const StatusIcon = config.icon;
  const clientCount = table.clientIds?.length || 0;

  // Calcul des statistiques
  const getPaidCount = () => {
    if (table.status === TableStatus.PAID) return clientCount;
    if (table.status === TableStatus.PARTIALLY_PAID) {
      return Math.floor(clientCount / 2);
    }
    return 0;
  };

  const paidCount = getPaidCount();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(table);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "w-full p-4 rounded-lg border-2 bg-white dark:bg-gray-900",
        "shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer",
        "hover:scale-[1.02] active:scale-[0.98]",
        "focus:outline-none focus:ring-2 focus:ring-primary/30",
        config.borderClass,
        isAnimating && "animate-pulse"
      )}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick(table)}
    >
      {/* En-tête avec numéro et statut */}
      <div className="flex items-start justify-between mb-3">
        <div className="text-left">
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
            {table.tableNumber}
          </h3>
          {clientCount > 0 && (
            <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 text-sm mt-0.5">
              <Users className="w-3.5 h-3.5" />
              <span>
                {clientCount} {clientCount > 1 ? "clients" : "client"}
              </span>
              {table.status === TableStatus.PARTIALLY_PAID && (
                <span className={config.textClass}>
                  ({paidCount}/{clientCount} payé)
                </span>
              )}
            </div>
          )}
        </div>
        <div
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
            config.bgClass,
            config.textClass
          )}
        >
          <StatusIcon className="w-3.5 h-3.5" />
          <span>{config.label}</span>
        </div>
      </div>

      {/* Montant dû (si applicable) */}
      {(table.status === TableStatus.OCCUPIED ||
        table.status === TableStatus.PARTIALLY_PAID) &&
        table.remainingAmount > 0 && (
          <div className="text-left pt-3 border-t border-gray-200 dark:border-gray-700">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Montant dû
            </span>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {table.remainingAmount.toFixed(2)} €
            </p>
          </div>
        )}

      {/* État de la table */}
      {table.status === TableStatus.FREE && (
        <div className="text-left pt-3 border-t border-gray-200 dark:border-gray-700">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Table disponible
          </span>
        </div>
      )}

      {table.status === TableStatus.PAID && (
        <div className="text-left pt-3 border-t border-gray-200 dark:border-gray-700">
          <span className={cn("text-sm font-medium", config.textClass)}>
            ✓ Réglée
          </span>
        </div>
      )}
    </div>
  );
}

export default TableCard; // Make sure to export as default
