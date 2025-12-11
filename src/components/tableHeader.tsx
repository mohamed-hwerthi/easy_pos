import { LayoutGrid } from "lucide-react";
import { AddTableDialog } from "./AddTableDialog";

interface TableHeaderProps {
  onAddTable: (name: string, number: number) => void;
}

export function TableHeader({ onAddTable }: TableHeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
          <LayoutGrid className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Gestion des Tables
          </h1>
          <p className="text-sm text-muted-foreground">
            Visualisez et gérez les tables du restaurant
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <AddTableDialog onAddTable={onAddTable} />
      </div>
    </header>
  );
}
