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
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  calculateTotalAmount,
  calculateTotalDue,
  RestaurantTable,
} from "@/lib/table";

interface TableDetailSheetProps {
  table: RestaurantTable | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGuestPaymentChange: (
    tableId: string,
    guestId: string,
    paid: boolean
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
  if (!table) return null;

  const totalDue = calculateTotalDue(table.guests);
  const totalAmount = calculateTotalAmount(table.guests);
  const paidCount = table.guests.filter((g) => g.paid).length;

  const statusConfig = {
    paid: {
      icon: Check,
      label: "Payée",
      bgClass: "bg-status-paid-bg",
      textClass: "text-status-paid",
    },
    unpaid: {
      icon: Clock,
      label: "Non payée",
      bgClass: "bg-status-unpaid-bg",
      textClass: "text-status-unpaid",
    },
    partial: {
      icon: AlertCircle,
      label: "Partiel",
      bgClass: "bg-status-partial-bg",
      textClass: "text-status-partial",
    },
    empty: {
      icon: Circle,
      label: "Libre",
      bgClass: "bg-status-empty-bg",
      textClass: "text-status-empty",
    },
  };

  const config = statusConfig[table.status];
  const StatusIcon = config.icon;

  return (
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
              <span>
                {table.name} {table.number}
              </span>
              <Badge
                variant="secondary"
                className={cn("ml-2 text-xs", config.bgClass, config.textClass)}
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
                  {table.guests.length > 0
                    ? `${table.guests.length} personne${
                        table.guests.length > 1 ? "s" : ""
                      } (${paidCount} payé)`
                    : "Aucun"}
                </p>
              </div>
            </div>

            {table.guests.length > 0 && (
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

            <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50">
              <QrCode className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Code QR</p>
                <p className="font-mono text-sm text-foreground">
                  {table.qrCode}
                </p>
              </div>
            </div>
          </div>

          {/* Guests List */}
          {table.guests.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">
                Paiements par client
              </p>
              <div className="space-y-2">
                {table.guests.map((guest) => (
                  <div
                    key={guest.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border transition-colors",
                      guest.paid
                        ? "bg-status-paid-bg/50 border-status-paid/30"
                        : "bg-card border-border"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center",
                          guest.paid ? "bg-status-paid/20" : "bg-muted"
                        )}
                      >
                        <User
                          className={cn(
                            "w-4 h-4",
                            guest.paid
                              ? "text-status-paid"
                              : "text-muted-foreground"
                          )}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground">
                          {guest.name}
                        </p>
                        <p
                          className={cn(
                            "text-sm",
                            guest.paid
                              ? "text-status-paid"
                              : "text-muted-foreground"
                          )}
                        >
                          {guest.amountDue.toFixed(2)} €
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={guest.paid ? "outline" : "default"}
                      onClick={() =>
                        onGuestPaymentChange(table.id, guest.id, !guest.paid)
                      }
                      className={cn(
                        guest.paid
                          ? "border-status-paid text-status-paid hover:bg-status-paid-bg"
                          : "bg-primary hover:bg-primary/90"
                      )}
                    >
                      {guest.paid ? (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          Payé
                        </>
                      ) : (
                        "Payer"
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions Section */}
          <div className="space-y-3 pt-4 border-t border-border">
            <p className="text-sm font-medium text-muted-foreground mb-3">
              Actions rapides
            </p>

            {table.guests.length > 0 && totalDue > 0 && (
              <Button
                onClick={() => onMarkAllPaid(table.id)}
                className="w-full h-12 bg-status-paid hover:bg-status-paid/90 text-primary-foreground"
              >
                <Check className="w-5 h-5 mr-2" />
                Tout marquer comme payé
              </Button>
            )}

            {table.status === "empty" && (
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
              <UserPlus className="w-5 h-5 mr-2" />
              Ajouter un client
            </Button>

            {table.status !== "empty" && (
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
  );
}
