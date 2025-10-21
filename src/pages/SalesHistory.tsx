import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Printer, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ClientOrder } from "@/models/client/client-order.model";
import { clientOrderService } from "@/services/client/client-order.service";

const SalesHistory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [sales, setSales] = useState<ClientOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const session = JSON.parse(localStorage.getItem("currentSession") || "{}");
  const sessionId = session?.id;

  useEffect(() => {
    const fetchSales = async () => {
      if (!sessionId) {
        toast({
          title: "Erreur",
          description: "Aucune session de caisse active trouvée.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await clientOrderService.getBySessionId(sessionId, {
          page: 0,
          size: 50,
        });
        setSales(response.items || []);
      } catch (error: any) {
        console.error("Erreur lors du chargement des ventes:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les ventes depuis le serveur.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, [sessionId]);

  const filteredSales = sales.filter((sale) =>
    sale.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleReprint = (sale: ClientOrder) => {
    const ticket = `
================================
       TICKET DE CAISSE
================================

N° ${sale.orderNumber}
${new Date(sale.createdAt || "").toLocaleString("fr-FR")}
Caissier: ${session.cashier || "N/A"}

--------------------------------
ARTICLES
--------------------------------
${sale.orderItems
  .map(
    (item) =>
      `${item.productName}\n${item.quantity} x ${item.unitPrice.toFixed(
        2
      )} € = ${(item.quantity * item.unitPrice).toFixed(2)} €`
  )
  .join("\n\n")}

--------------------------------
TOTAL
--------------------------------
Sous-total: ${sale.subTotal?.toFixed(2)} €
TOTAL: ${sale.total?.toFixed(2)} €

Paiement: Espèces

Merci de votre visite !
================================
    `;

    console.log(ticket);
    toast({
      title: "Ticket réimprimé",
      description: `Ticket ${sale.orderNumber}`,
    });
  };

  const handleRefund = (sale: ClientOrder) => {
    toast({
      title: "Remboursement",
      description: `Remboursement du ticket ${sale.orderNumber} (en développement)`,
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

        {loading ? (
          <Card className="p-8 text-center">
            <p>Chargement des ventes...</p>
          </Card>
        ) : filteredSales.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Aucune vente trouvée</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredSales.map((sale) => (
              <Card key={sale.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg">
                      Ticket #{sale.orderNumber}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(sale.createdAt || "").toLocaleString("fr-FR")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary">
                      {sale.status || "Inconnu"}
                    </Badge>
                    <Badge className="bg-success text-white">
                      {sale.total?.toFixed(2)} €
                    </Badge>
                  </div>
                </div>

                <div className="border-t pt-4 mb-4">
                  <div className="space-y-2">
                    {sale.orderItems.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>
                          {item.quantity}x {item.productName}
                        </span>
                        <span className="font-semibold">
                          {(item.quantity * item.unitPrice).toFixed(2)} €
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesHistory;
