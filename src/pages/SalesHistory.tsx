import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Printer, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SalesHistory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const session = JSON.parse(localStorage.getItem("currentSession") || '{"sales": []}');
  const sales = session.sales || [];

  const filteredSales = sales.filter((sale: any) =>
    sale.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleReprint = (sale: any) => {
    const ticket = `
================================
       TICKET DE CAISSE
================================

N° ${sale.id}
${new Date(sale.date).toLocaleString("fr-FR")}
Caissier: ${session.cashier}

--------------------------------
ARTICLES
--------------------------------
${sale.items.map((item: any) => 
  `${item.name}
${item.quantity} x ${item.price.toFixed(2)} € = ${(item.quantity * item.price).toFixed(2)} €`
).join('\n\n')}

--------------------------------
TOTAL
--------------------------------
Sous-total: ${sale.subtotal.toFixed(2)} €
TVA (0%): ${sale.tax.toFixed(2)} €
TOTAL: ${sale.total.toFixed(2)} €

Paiement: ${sale.paymentMethod}

Merci de votre visite !
================================
    `;

    console.log(ticket);
    toast({
      title: "Ticket réimprimé",
      description: `Ticket ${sale.id}`,
    });
  };

  const handleRefund = (sale: any) => {
    toast({
      title: "Remboursement",
      description: "Fonction de remboursement en développement",
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/pos")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au POS
          </Button>
          <h1 className="text-3xl font-bold">Historique des ventes</h1>
          <p className="text-muted-foreground">
            Session en cours - {sales.length} vente(s)
          </p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher par numéro de ticket..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredSales.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Aucune vente trouvée</p>
            </Card>
          ) : (
            filteredSales.map((sale: any) => (
              <Card key={sale.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg">Ticket #{sale.id}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(sale.date).toLocaleString("fr-FR")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary">{sale.paymentMethod}</Badge>
                    <Badge className="bg-success text-white">
                      {sale.total.toFixed(2)} €
                    </Badge>
                  </div>
                </div>

                <div className="border-t pt-4 mb-4">
                  <div className="space-y-2">
                    {sale.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>
                          {item.quantity}x {item.name}
                        </span>
                        <span className="font-semibold">
                          {(item.quantity * item.price).toFixed(2)} €
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReprint(sale)}
                    className="flex-1"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Réimprimer
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRefund(sale)}
                    className="flex-1"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Rembourser
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesHistory;