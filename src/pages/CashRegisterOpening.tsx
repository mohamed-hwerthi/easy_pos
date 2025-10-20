import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, DollarSign } from "lucide-react";
import { cashierSessionService } from "@/services/cahier-session.service";

const CashRegisterOpening = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [initialAmount, setInitialAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const cashier = JSON.parse(localStorage.getItem("cashier") || "{}");

  const handleOpenRegister = async () => {
    if (!initialAmount || parseFloat(initialAmount) < 0) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un montant valide",
        variant: "destructive",
      });
      return;
    }

    if (!cashier.id) {
      toast({
        title: "Erreur",
        description: "Informations du caissier manquantes",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    setIsLoading(true);

    try {
      // Create session on the backend
      const sessionResponse = await cashierSessionService.createSession({
        cashierId: cashier.id,
        openingBalance: parseFloat(initialAmount),
        isClosed: false,
      });

      // Store session data in localStorage for quick access
      const session = {
        id: sessionResponse.id,
        sessionNumber: sessionResponse.sessionNumber,
        cashier: cashier.name,
        cashierId: cashier.id,
        openedAt: sessionResponse.startTime,
        initialAmount: sessionResponse.openingBalance,
        totalSales: sessionResponse.totalSales,
        totalCash: sessionResponse.openingBalance,
        totalCard: 0,
        totalCheck: 0,
        totalTransfer: 0,
        cashMovements: [],
        sales: [],
        status: "open",
      };

      localStorage.setItem("currentSession", JSON.stringify(session));

      toast({
        title: "Caisse ouverte",
        description: `Session ${sessionResponse.sessionNumber} - Fond de caisse: ${parseFloat(initialAmount).toFixed(2)} €`,
      });

      navigate("/pos");
    } catch (error: any) {
      console.error("Error creating session:", error);
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Impossible d'ouvrir la caisse. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8">
        <div className="mb-6 text-center">
          <DollarSign className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h1 className="text-3xl font-bold mb-2">Ouverture de caisse</h1>
          <p className="text-muted-foreground">Bienvenue {cashier.name}</p>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("fr-FR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <Label htmlFor="initialAmount" className="text-base">
              Fond de caisse initial (€)
            </Label>
            <Input
              id="initialAmount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={initialAmount}
              onChange={(e) => setInitialAmount(e.target.value)}
              className="mt-2 text-lg h-12"
              autoFocus
            />
            <p className="text-sm text-muted-foreground mt-2">
              Montant en espèces disponible en début de journée
            </p>
          </div>

          <Button
            size="lg"
            className="w-full"
            onClick={handleOpenRegister}
            disabled={!initialAmount || isLoading}
          >
            {isLoading ? "Ouverture en cours..." : "Ouvrir la caisse"}
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => navigate("/login")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CashRegisterOpening;
