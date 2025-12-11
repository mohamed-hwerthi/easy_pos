import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { z } from "zod";

const tableSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Le nom est requis")
    .max(50, "Max 50 caractères"),
  number: z
    .number()
    .int()
    .min(1, "Numéro minimum: 1")
    .max(999, "Numéro maximum: 999"),
});

interface AddTableDialogProps {
  onAddTable: (name: string, number: number) => void;
}

export function AddTableDialog({ onAddTable }: AddTableDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("Table");
  const [number, setNumber] = useState("");
  const [errors, setErrors] = useState<{ name?: string; number?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = tableSchema.safeParse({
      name: name.trim(),
      number: parseInt(number, 10) || 0,
    });

    if (!result.success) {
      const fieldErrors: { name?: string; number?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === "name") fieldErrors.name = err.message;
        if (err.path[0] === "number") fieldErrors.number = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    onAddTable(result.data.name, result.data.number);
    setName("Table");
    setNumber("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Ajouter une table
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouvelle table</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="table-name">Nom de la zone</Label>
            <Input
              id="table-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Table, Terrasse, Bar, VIP..."
              maxLength={50}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="table-number">Numéro</Label>
            <Input
              id="table-number"
              type="number"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="1"
              min={1}
              max={999}
            />
            {errors.number && (
              <p className="text-sm text-destructive">{errors.number}</p>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Annuler
            </Button>
            <Button type="submit">Créer la table</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
