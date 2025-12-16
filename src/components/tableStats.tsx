// src/components/TableStats.tsx
import { RestaurantTable } from "@/models/restaurant-table.model";
import { TableStatus } from "@/models/table-status.model";
import { Check, Clock, Circle, Euro, AlertCircle } from "lucide-react";

interface TableStatsProps {
  tables: RestaurantTable[];
}

export function TableStats({ tables }: TableStatsProps) {
  const paidCount = tables.filter((t) => t.status === TableStatus.PAID).length;
  const unpaidCount = tables.filter(
    (t) => t.status === TableStatus.OCCUPIED
  ).length;
  const partialCount = tables.filter(
    (t) => t.status === TableStatus.PARTIALLY_PAID
  ).length;
  const emptyCount = tables.filter((t) => t.status === TableStatus.FREE).length;

  const totalDue = tables.reduce((sum, t) => sum + (t.remainingAmount || 0), 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      <div className="p-4 rounded-xl bg-status-paid-bg border border-status-paid/20">
        <div className="flex items-center gap-2 mb-1">
          <Check className="w-4 h-4 text-status-paid" />
          <span className="text-sm text-status-paid font-medium">Payées</span>
        </div>
        <p className="text-2xl font-bold text-status-paid">{paidCount}</p>
      </div>

      <div className="p-4 rounded-xl bg-status-unpaid-bg border border-status-unpaid/20">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="w-4 h-4 text-status-unpaid" />
          <span className="text-sm text-status-unpaid font-medium">
            Non payées
          </span>
        </div>
        <p className="text-2xl font-bold text-status-unpaid">{unpaidCount}</p>
      </div>

      <div className="p-4 rounded-xl bg-status-partial-bg border border-status-partial/20">
        <div className="flex items-center gap-2 mb-1">
          <AlertCircle className="w-4 h-4 text-status-partial" />
          <span className="text-sm text-status-partial font-medium">
            Partielles
          </span>
        </div>
        <p className="text-2xl font-bold text-status-partial">{partialCount}</p>
      </div>

      <div className="p-4 rounded-xl bg-status-empty-bg border border-status-empty/20">
        <div className="flex items-center gap-2 mb-1">
          <Circle className="w-4 h-4 text-status-empty" />
          <span className="text-sm text-status-empty font-medium">Libres</span>
        </div>
        <p className="text-2xl font-bold text-status-empty">{emptyCount}</p>
      </div>

      <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 col-span-2 lg:col-span-1">
        <div className="flex items-center gap-2 mb-1">
          <Euro className="w-4 h-4 text-primary" />
          <span className="text-sm text-primary font-medium">À encaisser</span>
        </div>
        <p className="text-2xl font-bold text-primary">
          {totalDue.toFixed(2)} €
        </p>
      </div>
    </div>
  );
}
