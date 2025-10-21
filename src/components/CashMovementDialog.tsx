import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CashMovement } from "@/models/cash-mouvement.model";
import { cashMovementService } from "@/services/cash-mouvment.service";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useState } from "react";

interface CashMovementDialogProps {
  type: "IN" | "OUT";
  sessionId: string;
  cashierId: string;
  onMovementCreated: (movement: any) => void;
}

const CashMovementDialog = ({
  type,
  sessionId,
  onMovementCreated,
  cashierId,
}: CashMovementDialogProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
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

    const movementRequest: CashMovement = {
      cashierSessionId: sessionId,
      type,
      amount: parseFloat(amount),
      reason: reason.trim(),
      cashierId: cashierId,
    };

    try {
      setLoading(true);
      const createdMovement = await cashMovementService.create(movementRequest);
      onMovementCreated(createdMovement);

      toast({
        title: type === "IN" ? "Entrée enregistrée" : "Sortie enregistrée",
        description: `${createdMovement.amount.toFixed(2)} € - ${
          createdMovement.reason
        }`,
      });

      setAmount("");
      setReason("");
      setOpen(false);
    } catch (error: any) {
      console.error("Erreur lors de l'enregistrement du mouvement:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer le mouvement de caisse.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={!sessionId}>
          {type === "IN" ? (
            <ArrowDown className="h-4 w-4 mr-2 text-success" />
          ) : (
            <ArrowUp className="h-4 w-4 mr-2 text-destructive" />
          )}
          {type === "IN" ? "Entrée" : "Sortie"} d'espèces
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {type === "IN" ? "Entrée" : "Sortie"} d'espèces
          </DialogTitle>
          <DialogDescription>
            Enregistrez une {type === "IN" ? "entrée" : "sortie"} d'espèces avec
            justificatif
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
              disabled={loading}
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
              disabled={loading}
            />
          </div>

          <Button className="w-full" onClick={handleSubmit} disabled={loading}>
            {loading ? "Enregistrement..." : "Valider"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CashMovementDialog;
