import { Check, Clock, Users, Circle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { calculateTotalDue, RestaurantTable, TableStatus } from "@/lib/table";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
  }
> = {
  paid: {
    icon: Check,
    label: "Payée",
    bgClass: "bg-status-paid-bg",
    textClass: "text-status-paid",
    borderClass: "border-status-paid/30",
  },
  unpaid: {
    icon: Clock,
    label: "Non payée",
    bgClass: "bg-status-unpaid-bg",
    textClass: "text-status-unpaid",
    borderClass: "border-status-unpaid/30",
  },
  partial: {
    icon: AlertCircle,
    label: "Partiel",
    bgClass: "bg-status-partial-bg",
    textClass: "text-status-partial",
    borderClass: "border-status-partial/30",
  },
  empty: {
    icon: Circle,
    label: "Libre",
    bgClass: "bg-status-empty-bg",
    textClass: "text-status-empty",
    borderClass: "border-status-empty/30",
  },
};

export function TableCard({ table, onClick, isAnimating }: TableCardProps) {
  const config = statusConfig[table.status];
  const StatusIcon = config.icon;
  const totalDue = calculateTotalDue(table.guests);
  const paidCount = table.guests.filter((g) => g.paid).length;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: table.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(table)}
      className={cn(
        "w-full p-4 rounded-lg border-2 bg-card shadow-card transition-all duration-200 cursor-grab",
        "hover:shadow-card-hover hover:scale-[1.02] active:scale-[0.98]",
        "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2",
        config.borderClass,
        isAnimating && "animate-status-change",
        isDragging && "opacity-50 cursor-grabbing shadow-lg scale-105 z-50"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="text-left">
          <h3 className="font-semibold text-foreground text-lg">
            {table.name} {table.number}
          </h3>
          {table.guests.length > 0 && (
            <div className="flex items-center gap-1.5 text-muted-foreground text-sm mt-0.5">
              <Users className="w-3.5 h-3.5" />
              <span>
                {table.guests.length}{" "}
                {table.guests.length > 1 ? "clients" : "client"}
              </span>
              {table.status === "partial" && (
                <span className="text-status-partial">
                  ({paidCount}/{table.guests.length} payé)
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

      {(table.status === "unpaid" || table.status === "partial") &&
        totalDue > 0 && (
          <div className="text-left pt-2 border-t border-border">
            <span className="text-xs text-muted-foreground">Montant dû</span>
            <p className="text-xl font-bold text-foreground">
              {totalDue.toFixed(2)} €
            </p>
          </div>
        )}

      {table.status === "empty" && (
        <div className="text-left pt-2 border-t border-border">
          <span className="text-sm text-muted-foreground">
            Table disponible
          </span>
        </div>
      )}

      {table.status === "paid" && (
        <div className="text-left pt-2 border-t border-border">
          <span className="text-sm text-status-paid font-medium">✓ Réglée</span>
        </div>
      )}
    </div>
  );
}
