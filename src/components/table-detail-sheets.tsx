// src/components/table-detail-sheets.tsx
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Clock,
  Users,
  QrCode,
  Circle,
  CreditCard,
  AlertCircle,
  User,
  UserPlus,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { useState, useEffect } from "react";
import { restaurantTableService } from "@/services/restaurant-table.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface TableDetailSheetProps {
  table: RestaurantTable | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGuestPaymentChange: (
    tableId: string,
    clientId: string,
    amount: number,
    method: string
  ) => void;
  onMarkAllPaid: (tableId: string) => void;
  onClearTable: (tableId: string) => void;
  onAddGuest: (tableId: string) => void;
}

export function TableDetailSheet({
  table,
  open,
  onOpenChange,
  onGuestPaymentChange,
  onMarkAllPaid,
  onClearTable,
  onAddGuest,
}: TableDetailSheetProps) {
  const [clients, setClients] = useState<TableClient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<TableClient | null>(
    null
  );
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.CASH
  );

  useEffect(() => {
    if (table?.id) {
      loadClients();
    }
  }, [table?.id]);

  const loadClients = async () => {
    if (!table?.id) return;

    try {
      setIsLoading(true);
      const clientsData = await restaurantTableService.getClientsByTable(
        table.id
      );
      setClients(clientsData);
    } catch (error) {
      console.error("Error loading clients:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!table) return null;

  const totalDue = calculateTotalDue(clients);
  const totalAmount = calculateTotalAmount(clients);
  const paidCount = clients.filter(
    (client) => client.remainingAmount === 0
  ).length;
  const config = getStatusConfig(table.status);

  // Icons mapping
  const icons = {
    Check,
    Clock,
    Circle,
    AlertCircle,
  };

  const StatusIcon = icons[config.icon as keyof typeof icons] || Circle;

  const handleOpenPaymentDialog = (client: TableClient) => {
    setSelectedClient(client);
    setPaymentAmount(client.remainingAmount?.toString() || "0");
    setPaymentDialogOpen(true);
  };

  const handlePaymentSubmit = () => {
    if (!selectedClient || !table) return;

    onGuestPaymentChange(
      table.id,
      selectedClient.id,
      parseFloat(paymentAmount),
      paymentMethod
    );

    setPaymentDialogOpen(false);
    setSelectedClient(null);
  };

  const renderClientItem = (client: TableClient) => (
    <div
      key={client.id}
      className={cn(
        "flex items-center justify-between p-3 rounded-lg border transition-colors",
        client.remainingAmount === 0
          ? "bg-status-paid-bg/50 border-status-paid/30"
          : "bg-card border-border"
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center",
            client.remainingAmount === 0 ? "bg-status-paid/20" : "bg-muted"
          )}
        >
          <User
            className={cn(
              "w-4 h-4",
              client.remainingAmount === 0
                ? "text-status-paid"
                : "text-muted-foreground"
            )}
          />
        </div>
        <div>
          <p className="font-medium text-sm text-foreground">{client.name}</p>
          <div className="flex items-center gap-2">
            <p
              className={cn(
                "text-sm",
                client.remainingAmount === 0
                  ? "text-status-paid"
                  : "text-muted-foreground"
              )}
            >
              Total: {client.amountDue?.toFixed(2)} €
            </p>
            {client.remainingAmount !== 0 && (
              <Badge variant="outline" className="text-xs">
                Reste: {client.remainingAmount?.toFixed(2)} €
              </Badge>
            )}
          </div>
        </div>
      </div>
      <Button
        size="sm"
        variant={client.remainingAmount === 0 ? "outline" : "default"}
        onClick={() =>
          client.remainingAmount === 0
            ? null // Already paid
            : handleOpenPaymentDialog(client)
        }
        disabled={client.remainingAmount === 0}
        className={cn(
          client.remainingAmount === 0
            ? "border-status-paid text-status-paid hover:bg-status-paid-bg"
            : "bg-primary hover:bg-primary/90"
        )}
      >
        {client.remainingAmount === 0 ? (
          <>
            <Check className="w-4 h-4 mr-1" />
            Payé
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-1" />
            Payer
          </>
        )}
      </Button>
    </div>
  );

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="pb-4 border-b border-border">
            <SheetTitle className="flex items-center gap-3 text-2xl">
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center",
                  config.bgClass
                )}
              >
                <StatusIcon className={cn("w-6 h-6", config.textClass)} />
              </div>
              <div>
                <span>{table.tableNumber}</span>
                <Badge
                  variant="secondary"
                  className={cn(
                    "ml-2 text-xs",
                    config.bgClass,
                    config.textClass
                  )}
                >
                  {config.label}
                </Badge>
              </div>
            </SheetTitle>
          </SheetHeader>

          <div className="py-6 space-y-6">
            {/* Summary Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50">
                <Users className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Clients</p>
                  <p className="font-semibold text-foreground">
                    {clients.length > 0
                      ? `${clients.length} personne${
                          clients.length > 1 ? "s" : ""
                        } (${paidCount} payé)`
                      : "Aucun"}
                  </p>
                </div>
              </div>

              {clients.length > 0 && (
                <div
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl",
                    totalDue > 0 ? "bg-status-unpaid-bg" : "bg-status-paid-bg"
                  )}
                >
                  <CreditCard
                    className={cn(
                      "w-5 h-5",
                      totalDue > 0 ? "text-status-unpaid" : "text-status-paid"
                    )}
                  />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {totalDue > 0 ? "Reste à payer" : "Total réglé"}
                    </p>
                    <p
                      className={cn(
                        "text-2xl font-bold",
                        totalDue > 0 ? "text-status-unpaid" : "text-status-paid"
                      )}
                    >
                      {totalDue > 0
                        ? totalDue.toFixed(2)
                        : totalAmount.toFixed(2)}{" "}
                      €
                    </p>
                  </div>
                </div>
              )}

              {table.qrCode && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50">
                  <QrCode className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Code QR</p>
                    <p className="font-mono text-sm text-foreground">
                      {table.qrCode}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Guests List */}
            {clients.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">
                    Paiements par client
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {isLoading ? "Chargement..." : ""}
                  </span>
                </div>
                <div className="space-y-2">{clients.map(renderClientItem)}</div>
              </div>
            )}

            {/* Actions Section */}
            <div className="space-y-3 pt-4 border-t border-border">
              <p className="text-sm font-medium text-muted-foreground mb-3">
                Actions rapides
              </p>

              {clients.length > 0 && totalDue > 0 && (
                <Button
                  onClick={() => onMarkAllPaid(table.id)}
                  className="w-full h-12 bg-status-paid hover:bg-status-paid/90 text-primary-foreground"
                >
                  <Check className="w-5 h-5 mr-2" />
                  Tout marquer comme payé
                </Button>
              )}

              {table.status === "FREE" && (
                <Button
                  onClick={() => onAddGuest(table.id)}
                  className="w-full h-12 bg-primary hover:bg-primary/90"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Occuper la table
                </Button>
              )}

              <Button
                onClick={() => onAddGuest(table.id)}
                variant="outline"
                className="w-full h-12"
              >
                <Plus className="w-5 h-5 mr-2" />
                Ajouter un client
              </Button>

              {table.status !== "FREE" && (
                <Button
                  onClick={() => onClearTable(table.id)}
                  variant="outline"
                  className="w-full h-12"
                >
                  <Circle className="w-5 h-5 mr-2" />
                  Libérer la table
                </Button>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Effectuer un paiement</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="client">Client</Label>
              <Input
                id="client"
                value={selectedClient?.name || ""}
                disabled
                readOnly
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Montant à payer</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="amount"
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  min="0.01"
                  step="0.01"
                />
                <span className="text-muted-foreground">€</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Montant restant: {selectedClient?.remainingAmount?.toFixed(2)} €
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="method">Méthode de paiement</Label>
              <Select
                value={paymentMethod}
                onValueChange={(value: PaymentMethod) =>
                  setPaymentMethod(value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une méthode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PaymentMethod.CASH}>Espèces</SelectItem>
                  <SelectItem value={PaymentMethod.CARD}>Carte</SelectItem>
                  <SelectItem value={PaymentMethod.ONLINE}>En ligne</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setPaymentDialogOpen(false)}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                onClick={handlePaymentSubmit}
                className="flex-1"
                disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
              >
                Confirmer le paiement
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
