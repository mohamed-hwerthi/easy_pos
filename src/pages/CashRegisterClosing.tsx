import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Download, ArrowLeft } from "lucide-react";
import { cashierSessionService } from "@/services/cahier-session.service";

const CashRegisterClosing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [actualCash, setActualCash] = useState("");
  const session = JSON.parse(localStorage.getItem("currentSession") || "{}");

  const expectedCash = session.totalCash || 0;
  const difference = actualCash ? parseFloat(actualCash) - expectedCash : 0;

  const handleCloseRegister = async () => {
    if (!actualCash) {
      toast({
        title: "Erreur",
        description: "Veuillez compter les espèces",
        variant: "destructive",
      });
      return;
    }

    try {
      // Call the API to close the session
      const closedSession = await cashierSessionService.closeSession(
        session.id,
        parseFloat(actualCash)
      );

      // Update local storage
      const sessions = JSON.parse(localStorage.getItem("sessions") || "[]");
      const updatedSession = {
        ...session,
        ...closedSession,
        actualCash: parseFloat(actualCash),
        cashDifference: difference,
        status: "closed",
      };

      sessions.push(updatedSession);
      localStorage.setItem("sessions", JSON.stringify(sessions));
      localStorage.removeItem("currentSession");

      toast({
        title: "Caisse clôturée avec succès",
        description:
          difference === 0
            ? "Pas d'écart de caisse"
            : `Écart: ${difference.toFixed(2)} €`,
        variant: difference === 0 ? "default" : "destructive",
      });

      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      console.error("Error closing cashier session:", error);
      toast({
        title: "Erreur",
        description:
          "Une erreur est survenue lors de la fermeture de la caisse",
        variant: "destructive",
      });
    }
  };
  const generateReport = () => {
    const report = `
=================================
    RAPPORT DE CLÔTURE DE CAISSE
=================================

Caissier: ${session.cashier}
Date d'ouverture: ${new Date(session.openedAt).toLocaleString("fr-FR")}
Date de clôture: ${new Date().toLocaleString("fr-FR")}

---------------------------------
FOND DE CAISSE
---------------------------------
Fond initial: ${session.initialAmount?.toFixed(2)} €

---------------------------------
VENTES
---------------------------------
Nombre de ventes: ${session.sales?.length || 0}
Total des ventes: ${session.totalSales?.toFixed(2)} €

---------------------------------
ENCAISSEMENTS
---------------------------------
Espèces: ${session.totalCash?.toFixed(2)} €
Carte bancaire: ${session.totalCard?.toFixed(2)} €
Chèque: ${session.totalCheck?.toFixed(2)} €
Virement: ${session.totalTransfer?.toFixed(2)} €

---------------------------------
ESPÈCES ATTENDUES
---------------------------------
Attendu: ${expectedCash.toFixed(2)} €
Compté: ${actualCash || "0.00"} €
Écart: ${difference.toFixed(2)} €

=================================
    `;

    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rapport-caisse-${new Date().toISOString().split("T")[0]}.txt`;
    a.click();

    toast({
      title: "Rapport généré",
      description: "Le rapport a été téléchargé",
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/pos")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-3xl font-bold">Clôture de caisse</h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleString("fr-FR")}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Résumé de la journée</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Caissier:</span>
                <span className="font-semibold">{session.cashier}</span>
              </div>
              <div className="flex justify-between">
                <span>Ouverture:</span>
                <span className="font-semibold">
                  {new Date(session.openedAt).toLocaleTimeString("fr-FR")}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Fond initial:</span>
                <span className="font-semibold">
                  {session.initialAmount?.toFixed(2)} €
                </span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold">
                  <span>Nombre de ventes:</span>
                  <span>{session.sales?.length || 0}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Encaissements</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Espèces:</span>
                <span className="font-semibold">
                  {session.totalCash?.toFixed(2)} €
                </span>
              </div>
              <div className="flex justify-between">
                <span>Carte bancaire:</span>
                <span className="font-semibold">
                  {session.totalCard?.toFixed(2)} €
                </span>
              </div>
              <div className="flex justify-between">
                <span>Chèque:</span>
                <span className="font-semibold">
                  {session.totalCheck?.toFixed(2)} €
                </span>
              </div>
              <div className="flex justify-between">
                <span>Virement:</span>
                <span className="font-semibold">
                  {session.totalTransfer?.toFixed(2)} €
                </span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-success">
                    {session.totalSales?.toFixed(2)} €
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 md:col-span-2">
            <h2 className="text-xl font-bold mb-4">Comptage des espèces</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="actualCash">
                  Montant total compté en espèces (€)
                </Label>
                <Input
                  id="actualCash"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={actualCash}
                  onChange={(e) => setActualCash(e.target.value)}
                  className="mt-2 text-lg h-12"
                  autoFocus
                />
              </div>

              {actualCash && (
                <Card className="bg-secondary/30 p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Espèces attendues:</span>
                      <span className="font-semibold">
                        {expectedCash.toFixed(2)} €
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Espèces comptées:</span>
                      <span className="font-semibold">
                        {parseFloat(actualCash).toFixed(2)} €
                      </span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Écart:</span>
                        <span
                          className={
                            difference === 0
                              ? "text-success"
                              : "text-destructive"
                          }
                        >
                          {difference > 0 ? "+" : ""}
                          {difference.toFixed(2)} €
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              <div className="flex gap-4">
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1"
                  onClick={generateReport}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger le rapport
                </Button>
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={handleCloseRegister}
                  disabled={!actualCash}
                >
                  Clôturer la caisse
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CashRegisterClosing;
