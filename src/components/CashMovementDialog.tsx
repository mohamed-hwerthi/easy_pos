import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ArrowDown, ArrowUp } from "lucide-react";

interface CashMovementDialogProps {
  type: "in" | "out";
  onMovement: (movement: any) => void;
}

const CashMovementDialog = ({ type, onMovement }: CashMovementDialogProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un montant valide",
        variant: "destructive",
      });
      return;
    }

    if (!reason.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez indiquer un motif",
        variant: "destructive",
      });
      return;
    }

    const movement = {
      id: Date.now().toString(),
      type,
      amount: parseFloat(amount),
      reason: reason.trim(),
      date: new Date().toISOString(),
    };

    onMovement(movement);

    toast({
      title: type === "in" ? "Entrée enregistrée" : "Sortie enregistrée",
      description: `${parseFloat(amount).toFixed(2)} € - ${reason}`,
    });

    setAmount("");
    setReason("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {type === "in" ? (
            <ArrowDown className="h-4 w-4 mr-2 text-success" />
          ) : (
            <ArrowUp className="h-4 w-4 mr-2 text-destructive" />
          )}
          {type === "in" ? "Entrée" : "Sortie"} d'espèces
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {type === "in" ? "Entrée" : "Sortie"} d'espèces
          </DialogTitle>
          <DialogDescription>
            Enregistrez une {type === "in" ? "entrée" : "sortie"} d'espèces avec justificatif
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="amount">Montant (€)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="reason">Motif</Label>
            <Textarea
              id="reason"
              placeholder="Indiquez la raison de cette opération..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-2"
              rows={4}
            />
          </div>

          <Button className="w-full" onClick={handleSubmit}>
            Valider
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CashMovementDialog;