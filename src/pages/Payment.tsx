import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  CreditCard,
  Smartphone,
  Gift,
  Banknote,
  ContactRound,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { clientOrderService } from "@/services/client/client-order.service";
import { ClientOrderItem } from "@/models/client/client-order-item.model";
import { CartItem } from "@/redux/slices/cartSlice";
import { clearCart } from "@/redux/slices/cartSlice";

type PaymentMethod = "card" | "mobile" | "cash" | "gift" | "contactless";

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { total, subtotal, tax } = location.state || {
    total: 0,
    subtotal: 0,
    tax: 0,
  };

  const dispatch = useDispatch();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    null
  );
  const [cashReceived, setCashReceived] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods = [
    { id: "card" as PaymentMethod, label: "Carte bancaire", icon: CreditCard },
    { id: "mobile" as PaymentMethod, label: "Mobile Pay", icon: Smartphone },
    {
      id: "contactless" as PaymentMethod,
      label: "Sans contact",
      icon: ContactRound,
    },
    { id: "cash" as PaymentMethod, label: "Espèces", icon: Banknote },
    { id: "gift" as PaymentMethod, label: "Carte cadeau", icon: Gift },
  ];

  const handlePayment = async () => {
    if (!selectedMethod) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une méthode de paiement",
        variant: "destructive",
      });
      return;
    }

    if (selectedMethod === "cash" && parseFloat(cashReceived) < total) {
      toast({
        title: "Montant insuffisant",
        description: "Le montant reçu est inférieur au total",
        variant: "destructive",
      });
      return;
    }

    // Get current session from localStorage
    const currentSession = JSON.parse(
      localStorage.getItem("currentSession") || "{}"
    );

    if (!currentSession.id) {
      toast({
        title: "Erreur",
        description: "Session de caisse non trouvée",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Convert cart items to order items
      const cartItems: CartItem[] = location.state.cart || [];
      const orderItems: ClientOrderItem[] = cartItems.map((item) => ({
        productId: item.itemId,
        productName: item.itemTitle,
        unitPrice: item.itemPrice,
        quantity: item.itemQuantity,
        mediasUrls: item.itemImage ? [item.itemImage] : [],
        options: item.itemOptions?.map((opt) => ({
          optionId: opt.optionId,
          optionName: opt.optionName,
          optionPrice: opt.optionPrice || 0,
        })),
        totalPrice: item.itemTotalPrice,
      }));

      // Prepare order data
      const orderData = {
        orderItems,
        total,
        subTotal: subtotal,
      };

      // Calculate cash received and change for cash payments
      const cashReceivedAmount =
        selectedMethod === "cash" ? parseFloat(cashReceived) : undefined;
      const changeGivenAmount =
        selectedMethod === "cash"
          ? parseFloat(cashReceived) - total
          : undefined;

      // Place the order using the backend service
      const createdOrder = await clientOrderService.placePOSOrder(
        orderData,
        currentSession.id,
        cashReceivedAmount,
        changeGivenAmount
      );

      // Update local session data for UI tracking
      const sale = {
        id:
          createdOrder.orderNumber ||
          createdOrder.id ||
          Date.now().toString().slice(-6),
        date: createdOrder.createdAt || new Date().toISOString(),
        items: cartItems,
        subtotal,
        tax,
        total,
        paymentMethod:
          selectedMethod === "card"
            ? "Carte"
            : selectedMethod === "mobile"
            ? "Mobile"
            : selectedMethod === "cash"
            ? "Espèces"
            : selectedMethod === "contactless"
            ? "Sans contact"
            : "Carte cadeau",
      };

      if (!currentSession.sales) currentSession.sales = [];
      currentSession.sales.push(sale);
      currentSession.totalSales = (currentSession.totalSales || 0) + total;

      if (selectedMethod === "cash") {
        currentSession.totalCash = (currentSession.totalCash || 0) + total;
      } else if (
        selectedMethod === "card" ||
        selectedMethod === "contactless"
      ) {
        currentSession.totalCard = (currentSession.totalCard || 0) + total;
      }

      localStorage.setItem("currentSession", JSON.stringify(currentSession));

      // Clear the cart after successful order
      dispatch(clearCart());

      toast({
        title: "Paiement réussi",
        description: `Commande #${sale.id} - ${total.toFixed(2)} €`,
      });

      setTimeout(() => {
        navigate("/pos");
      }, 1500);
    } catch (error: any) {
      console.error("Error placing order:", error);
      toast({
        title: "Erreur de paiement",
        description:
          error.response?.data?.message ||
          error.message ||
          "Impossible de traiter le paiement. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const change =
    selectedMethod === "cash" ? parseFloat(cashReceived || "0") - total : 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/pos")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour au panier
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Paiement</h1>
              <p className="text-sm text-muted-foreground">
                Total à payer: {total.toFixed(2)} €
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold">Caisse 1</p>
            <p className="text-sm text-muted-foreground">
              {new Date().toLocaleString("fr-FR")}
            </p>
          </div>
        </div>
      </header>

      <div className="flex gap-6 p-6">
        <div className="flex-1">
          <Card className="p-6">
            <h2 className="mb-6 text-xl font-bold">
              Choisir une méthode de paiement
            </h2>
            <p className="mb-4 text-muted-foreground">
              Montant restant à payer: {total.toFixed(2)} €
            </p>

            <div className="mb-6 grid grid-cols-3 gap-4">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <Button
                    key={method.id}
                    variant={
                      selectedMethod === method.id ? "default" : "outline"
                    }
                    className="h-24 flex-col gap-2"
                    onClick={() => setSelectedMethod(method.id)}
                  >
                    <Icon className="h-6 w-6" />
                    <span>{method.label}</span>
                  </Button>
                );
              })}
            </div>

            {selectedMethod === "cash" && (
              <Card className="bg-secondary/30 p-6">
                <div className="flex items-center gap-2">
                  <Banknote className="h-5 w-5" />
                  <h3 className="font-semibold">Paiement en espèces</h3>
                </div>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="text-sm font-medium">Montant reçu</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder={`Minimum: ${total.toFixed(2)} €`}
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  {cashReceived && parseFloat(cashReceived) >= total && (
                    <div className="space-y-2 rounded-lg bg-card p-4">
                      <div className="flex justify-between">
                        <span>Montant reçu:</span>
                        <span className="font-semibold">
                          {parseFloat(cashReceived).toFixed(2)} €
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Montant dû:</span>
                        <span className="font-semibold">
                          {total.toFixed(2)} €
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-2 text-lg font-bold">
                        <span>Monnaie à rendre:</span>
                        <span className="text-success">
                          {change.toFixed(2)} €
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            <Button
              size="lg"
              className="mt-6 w-full"
              onClick={handlePayment}
              disabled={!selectedMethod || isProcessing}
            >
              {isProcessing
                ? "Traitement..."
                : `Ajouter paiement - ${total.toFixed(2)} €`}
            </Button>
          </Card>
        </div>

        <div className="w-96">
          <Card className="p-6">
            <h2 className="mb-4 text-xl font-bold">
              Récapitulatif du paiement
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Sous-total:</span>
                <span className="font-semibold">{subtotal.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between">
                <span>TVA (0%):</span>
                <span className="font-semibold">{tax.toFixed(2)} €</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-success">{total.toFixed(2)} €</span>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="mb-3 font-semibold">Paiements ajoutés:</h3>
              <p className="text-center text-sm text-muted-foreground">
                Aucun paiement ajouté
              </p>
            </div>

            <Button
              size="lg"
              className="mt-6 w-full"
              variant="outline"
              disabled
            >
              Restant: {total.toFixed(2)} €
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Payment;
