import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Check, X, Plus, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface TableProcessPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (paymentData: {
    method: string;
    amount: number;
    cashReceived: number;
    changeGiven: number;
  }) => void;
  title: string;
  amount: number; // Montant total à payer
  clientName?: string;
  tableNumber?: string;
  sessionId?: string;
}

export function TableProcessPaymentDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  amount,
  clientName,
  tableNumber,
  sessionId,
}: TableProcessPaymentDialogProps) {
  const [cashReceived, setCashReceived] = useState<string>("");
  const [changeAmount, setChangeAmount] = useState<number>(0);
  const [isFullPayment, setIsFullPayment] = useState<boolean>(true);
  const [partialAmount, setPartialAmount] = useState<string>(amount.toFixed(2));

  // Réinitialiser les états quand le dialog s'ouvre
  useEffect(() => {
    if (isOpen) {
      setCashReceived("");
      setChangeAmount(0);
      setIsFullPayment(true);
      setPartialAmount(amount.toFixed(2));
    }
  }, [isOpen, amount]);

  // Calculer le change
  useEffect(() => {
    if (cashReceived) {
      const received = parseFloat(cashReceived) || 0;
      const toPay = isFullPayment ? amount : parseFloat(partialAmount) || 0;
      const change = Math.max(received - toPay, 0);
      setChangeAmount(change);
    } else {
      setChangeAmount(0);
    }
  }, [cashReceived, amount, isFullPayment, partialAmount]);

  const handleCashReceivedChange = (value: string) => {
    // Permettre uniquement les nombres et un point décimal
    const numValue = value.replace(/[^\d.]/g, "");
    // Éviter plusieurs points décimaux
    const parts = numValue.split(".");
    if (parts.length > 2) {
      return;
    }
    // Limiter à 2 décimales
    if (parts[1] && parts[1].length > 2) {
      return;
    }
    setCashReceived(numValue);
  };

  const handlePartialAmountChange = (value: string) => {
    const numValue = value.replace(/[^\d.]/g, "");
    const parts = numValue.split(".");
    if (parts.length > 2) {
      return;
    }
    if (parts[1] && parts[1].length > 2) {
      return;
    }

    const maxAmount = Math.min(parseFloat(numValue) || 0, amount);
    setPartialAmount(maxAmount.toFixed(2));
  };

  const handleConfirm = () => {
    const toPay = isFullPayment ? amount : parseFloat(partialAmount);
    const received = parseFloat(cashReceived) || 0;

    if (toPay <= 0 || received < toPay) {
      return;
    }

    onConfirm({
      method: "CASH",
      amount: toPay,
      cashReceived: received,
      changeGiven: changeAmount,
    });

    onClose();
  };

  const handleQuickAmount = (amountToAdd: number) => {
    const current = parseFloat(cashReceived) || 0;
    const newAmount = current + amountToAdd;
    setCashReceived(newAmount.toFixed(2));
  };

  const handleExactAmount = () => {
    const toPay = isFullPayment ? amount : parseFloat(partialAmount);
    setCashReceived(toPay.toFixed(2));
  };

  const getAmountToPay = () => {
    return isFullPayment ? amount : parseFloat(partialAmount) || 0;
  };

  const isPaymentValid = () => {
    const toPay = getAmountToPay();
    const received = parseFloat(cashReceived) || 0;

    return toPay > 0 && received >= toPay;
  };

  const formatCurrency = (value: number) => {
    return `${value.toFixed(2)} €`;
  };

  const quickAmounts = [5, 10, 20, 50, 100];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Résumé du paiement */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Total dû</p>
                <p className="text-2xl font-bold">{formatCurrency(amount)}</p>
              </div>
              <Badge variant="secondary" className="text-sm">
                <DollarSign className="w-3 h-3 mr-1" />
                Espèces
              </Badge>
            </div>

            {(clientName || tableNumber) && (
              <div className="grid grid-cols-2 gap-3">
                {clientName && (
                  <div>
                    <p className="text-xs text-gray-500">Client</p>
                    <p className="text-sm font-medium">{clientName}</p>
                  </div>
                )}
                {tableNumber && (
                  <div>
                    <p className="text-xs text-gray-500">Table</p>
                    <p className="text-sm font-medium">#{tableNumber}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Choix paiement complet/partiel */}
          <div className="space-y-2">
            <Label>Type de paiement</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={isFullPayment ? "default" : "outline"}
                onClick={() => setIsFullPayment(true)}
                className="h-auto py-3"
              >
                <div className="flex flex-col items-center">
                  <Check className="w-4 h-4 mb-1" />
                  <span className="text-sm">Paiement complet</span>
                  <span className="text-xs text-muted-foreground">
                    {formatCurrency(amount)}
                  </span>
                </div>
              </Button>
              <Button
                type="button"
                variant={!isFullPayment ? "default" : "outline"}
                onClick={() => setIsFullPayment(false)}
                className="h-auto py-3"
              >
                <div className="flex flex-col items-center">
                  <DollarSign className="w-4 h-4 mb-1" />
                  <span className="text-sm">Paiement partiel</span>
                  <span className="text-xs text-muted-foreground">
                    Choisir montant
                  </span>
                </div>
              </Button>
            </div>
          </div>

          {/* Montant partiel */}
          {!isFullPayment && (
            <div className="space-y-2">
              <Label htmlFor="partial-amount">Montant à payer</Label>
              <div className="relative">
                <Input
                  id="partial-amount"
                  type="text"
                  value={partialAmount}
                  onChange={(e) => handlePartialAmountChange(e.target.value)}
                  className="pl-8 text-lg"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2">
                  €
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Maximum: {formatCurrency(amount)}
              </p>
            </div>
          )}

          {/* Espèces reçus */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="cash-received">Espèces reçus</Label>
              <Badge variant="outline">
                À payer: {formatCurrency(getAmountToPay())}
              </Badge>
            </div>
            <div className="relative">
              <Input
                id="cash-received"
                type="text"
                value={cashReceived}
                onChange={(e) => handleCashReceivedChange(e.target.value)}
                placeholder="0.00"
                className="pl-8 text-lg text-xl"
                autoFocus
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl">
                €
              </span>
            </div>

            {/* Suggestions rapides */}
            <div className="space-y-2">
              <p className="text-xs text-gray-500">Suggestions rapides:</p>
              <div className="flex flex-wrap gap-2">
                {quickAmounts.map((quickAmount) => (
                  <Button
                    key={quickAmount}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAmount(quickAmount)}
                    className="flex-1 min-w-[60px]"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    {quickAmount}€
                  </Button>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleExactAmount}
                  className="flex-1"
                >
                  Montant exact
                </Button>
              </div>
            </div>
          </div>

          {/* Change à rendre */}
          {changeAmount > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-700">À rendre</span>
                </div>
                <span className="text-2xl font-bold text-green-700">
                  {formatCurrency(changeAmount)}
                </span>
              </div>
              <p className="text-xs text-green-600 mt-1">
                Le client a donné {formatCurrency(parseFloat(cashReceived))}
              </p>
            </div>
          )}

          {/* Avertissement si montant insuffisant */}
          {cashReceived && parseFloat(cashReceived) < getAmountToPay() && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-600">
                  Montant insuffisant
                </span>
              </div>
              <p className="text-sm text-red-600 mt-1">
                Il manque{" "}
                {formatCurrency(getAmountToPay() - parseFloat(cashReceived))}
              </p>
            </div>
          )}

          {/* Résumé final */}
          <div
            className={cn(
              "border rounded-lg p-3 space-y-2",
              isPaymentValid()
                ? "border-green-200 bg-green-50"
                : "border-gray-200"
            )}
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500">À payer</p>
                <p className="text-lg font-bold">
                  {formatCurrency(getAmountToPay())}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Reçu</p>
                <p
                  className={cn(
                    "text-lg font-bold",
                    parseFloat(cashReceived) >= getAmountToPay()
                      ? "text-green-600"
                      : "text-red-600"
                  )}
                >
                  {formatCurrency(parseFloat(cashReceived) || 0)}
                </p>
              </div>
            </div>
            {isPaymentValid() && (
              <p className="text-xs text-green-600 font-medium">
                ✓ Paiement valide
              </p>
            )}
          </div>

          {/* Boutons d'action */}
          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              <X className="w-4 h-4 mr-2" />
              Annuler
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!isPaymentValid()}
              className="flex-1"
            >
              <Check className="w-4 h-4 mr-2" />
              Confirmer le paiement
            </Button>
          </DialogFooter>

          {/* Informations de session */}
          {sessionId && (
            <div className="text-xs text-gray-500 text-center border-t pt-3">
              <p>Session: {sessionId.slice(-8)}</p>
              <p>{new Date().toLocaleString("fr-FR")}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
