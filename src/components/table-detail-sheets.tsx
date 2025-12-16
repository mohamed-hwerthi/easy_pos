import { useState, useEffect } from "react";
import { restaurantTableService } from "@/services/restaurant-table.service";
import { TableClient } from "@/models/table-client.model";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  CreditCard,
  Check,
  Users,
  Plus,
  Minus,
  UserPlus,
  Trash2,
  MoreVertical,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RestaurantTable } from "@/models/restaurant-table.model";
import { paymentService } from "@/services/payment-service";
import { TableStatus } from "@/models/table-status";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  onOccupyTable: (table: RestaurantTable) => void;
}

interface AddGuestFormData {
  numberOfGuests: number;
  customNames?: string[];
}

export function TableDetailSheet({
  table,
  open,
  onOpenChange,
  onGuestPaymentChange,
  onMarkAllPaid,
  onClearTable,
  onAddGuest,
  onOccupyTable,
}: TableDetailSheetProps) {
  const [clients, setClients] = useState<TableClient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [addGuestDialogOpen, setAddGuestDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<TableClient | null>(
    null
  );
  const [selectedClient, setSelectedClient] = useState<TableClient | null>(
    null
  );
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [addGuestForm, setAddGuestForm] = useState<AddGuestFormData>({
    numberOfGuests: 1,
    customNames: [],
  });
  const [useCustomNames, setUseCustomNames] = useState(false);

  useEffect(() => {
    if (table?.id && table.status !== TableStatus.FREE) loadClients();
  }, [table?.id, table?.status]);

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

  const handleOccupyTable = async (tableId: string) => {
    try {
      setIsLoading(true);
      const updatedTable = await restaurantTableService.occupyTable(tableId);
      onOccupyTable(updatedTable);
    } catch (error) {
      console.error("Erreur lors de l'occupation de la table:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const methods = await paymentService.getAllPaymentMethods();
      setPaymentMethods(methods);
      if (methods.length > 0) setPaymentMethod(methods[0]);
    } catch (error) {
      console.error("Error loading payment methods:", error);
    }
  };

  const handleOpenPaymentDialog = (client: TableClient) => {
    setSelectedClient(client);
    setPaymentAmount(client.remainingAmount?.toString() || "0");
    setPaymentDialogOpen(true);
  };

  const handlePaymentSubmit = () => {
    if (!selectedClient || !table || !paymentMethod) return;

    onGuestPaymentChange(
      table.id,
      selectedClient.id,
      parseFloat(paymentAmount),
      paymentMethod
    );

    setPaymentDialogOpen(false);
    setSelectedClient(null);
    loadClients();
  };

  const handleAddGuests = async () => {
    if (!table?.id || addGuestForm.numberOfGuests < 1) return;

    try {
      setIsLoading(true);

      // Créer les noms des clients
      const guestNames: string[] = [];
      const existingClientCount = clients.length;

      if (useCustomNames && addGuestForm.customNames) {
        // Utiliser les noms personnalisés
        for (let i = 0; i < addGuestForm.numberOfGuests; i++) {
          const customName = addGuestForm.customNames[i]?.trim();
          if (customName) {
            guestNames.push(customName);
          } else {
            guestNames.push(`Client ${existingClientCount + i + 1}`);
          }
        }
      } else {
        // Utiliser la numérotation automatique
        for (let i = 0; i < addGuestForm.numberOfGuests; i++) {
          guestNames.push(`Client ${existingClientCount + i + 1}`);
        }
      }

      // Ajouter chaque client
      for (const name of guestNames) {
        await restaurantTableService.addClientToTable(table.id, {
          name,
          amountDue: 0,
          remainingAmount: 0,
          tableId: table.id,
        });
      }

      // Recharger la liste des clients
      await loadClients();
      setAddGuestDialogOpen(false);

      // Réinitialiser le formulaire
      setAddGuestForm({
        numberOfGuests: 1,
        customNames: [],
      });
      setUseCustomNames(false);
    } catch (error) {
      console.error("Erreur lors de l'ajout des clients:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAddGuest = async () => {
    if (!table?.id) return;

    try {
      setIsLoading(true);
      const nextNumber = clients.length + 1;
      await restaurantTableService.addClientToTable(table.id, {
        name: `Client ${nextNumber}`,
        amountDue: 0,
        remainingAmount: 0,
        tableId: table.id,
      });
      await loadClients();
    } catch (error) {
      console.error("Erreur lors de l'ajout rapide:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!table?.id) return;

    try {
      setIsLoading(true);
      await restaurantTableService.removeClientFromTable(table.id, clientId);
      await loadClients();
      setDeleteDialogOpen(false);
      setClientToDelete(null);
    } catch (error) {
      console.error("Erreur lors de la suppression du client:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDeleteClient = (client: TableClient) => {
    setClientToDelete(client);
    setDeleteDialogOpen(true);
  };

  const handleUpdateCustomName = (index: number, value: string) => {
    const newCustomNames = [...(addGuestForm.customNames || [])];
    newCustomNames[index] = value;
    setAddGuestForm((prev) => ({
      ...prev,
      customNames: newCustomNames,
    }));
  };

  const getPaidCount = () => {
    return clients.filter((c) => c.remainingAmount === 0).length;
  };

  const renderClientItem = (client: TableClient, index: number) => (
    <div
      key={client.id}
      className={cn(
        "group flex items-center justify-between p-3 rounded-lg border transition-colors hover:bg-accent/50",
        client.remainingAmount === 0
          ? "bg-status-paid-bg/50 border-status-paid/30"
          : "bg-card border-border"
      )}
    >
      <div className="flex items-center gap-3 flex-1">
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
            client.remainingAmount === 0 ? "bg-status-paid/20" : "bg-muted"
          )}
        >
          <span
            className={cn(
              "text-sm font-medium",
              client.remainingAmount === 0
                ? "text-status-paid"
                : "text-muted-foreground"
            )}
          >
            {index + 1}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="font-medium text-sm text-foreground truncate">
              {client.name}
            </p>
            <div className="flex items-center gap-2">
              {client.remainingAmount !== 0 && (
                <Badge variant="outline" className="text-xs whitespace-nowrap">
                  Reste: {client.remainingAmount?.toFixed(2)} €
                </Badge>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenPaymentDialog(client);
                    }}
                    disabled={client.remainingAmount === 0}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Payer
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmDeleteClient(client);
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <p
            className={cn(
              "text-sm mt-1",
              client.remainingAmount === 0
                ? "text-status-paid"
                : "text-muted-foreground"
            )}
          >
            Total: {client.amountDue?.toFixed(2)} €
            {client.remainingAmount !== 0 && (
              <span className="ml-2">
                • Reste: {client.remainingAmount?.toFixed(2)} €
              </span>
            )}
          </p>
        </div>
      </div>

      <Button
        size="sm"
        variant={client.remainingAmount === 0 ? "outline" : "default"}
        onClick={(e) => {
          e.stopPropagation();
          client.remainingAmount !== 0 && handleOpenPaymentDialog(client);
        }}
        disabled={client.remainingAmount === 0}
        className="ml-2 flex-shrink-0"
      >
        {client.remainingAmount === 0 ? (
          <>
            <Check className="w-4 h-4 mr-1" /> Payé
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-1" /> Payer
          </>
        )}
      </Button>
    </div>
  );

  if (!table) return null;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="pb-4 border-b border-border">
            <SheetTitle>Table {table.tableNumber}</SheetTitle>
          </SheetHeader>

          <div className="py-6 space-y-6">
            {/* Table status action */}
            <div className="flex gap-2">
              {table.status === TableStatus.FREE ? (
                <Button
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOccupyTable(table.id);
                  }}
                  disabled={isLoading}
                >
                  Occuper la table
                </Button>
              ) : (
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearTable(table.id);
                  }}
                >
                  Libérer la table
                </Button>
              )}
            </div>

            {table.status !== TableStatus.FREE && (
              <>
                {/* Header clients avec bouton d'ajout rapide */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Clients</span>
                    <span className="font-semibold">
                      {clients.length} personnes ({getPaidCount()} payé)
                    </span>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleQuickAddGuest}
                    disabled={isLoading}
                    className="h-8 px-3"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Ajouter
                  </Button>
                </div>

                {/* Montant restant */}
                <div className="p-4 rounded-lg bg-status-partial-bg border border-status-partial/30">
                  <div className="flex items-center gap-2 mb-1">
                    <CreditCard className="w-4 h-4 text-status-partial" />
                    <span className="text-sm text-status-partial font-medium">
                      Reste à payer
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-status-partial">
                    {(table.remainingAmount || 0).toFixed(2)} €
                  </p>
                </div>

                {/* QR Code */}
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Code QR
                  </Label>
                  <div className="mt-1 text-sm font-mono bg-muted p-2 rounded">
                    {table.qrCode ||
                      `TABLE-${table.id.slice(0, 3).toUpperCase()}`}
                  </div>
                </div>

                {/* Liste des clients */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium">
                      Paiements par client
                    </h3>
                    {clients.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {clients.length} client{clients.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    {isLoading ? (
                      <div className="text-center py-4 text-muted-foreground">
                        Chargement...
                      </div>
                    ) : clients.length > 0 ? (
                      clients.map((client, index) =>
                        renderClientItem(client, index)
                      )
                    ) : (
                      <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">Aucun client</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Ajoutez des clients pour commencer
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ajout ultra-rapide de clients */}
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 mb-3">
                    <UserPlus className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Ajout rapide</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <Button
                        key={num}
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          if (!table.id) return;
                          try {
                            setIsLoading(true);
                            // Ajouter X clients d'un coup
                            for (let i = 0; i < num; i++) {
                              const nextNumber = clients.length + i + 1;
                              await restaurantTableService.addClientToTable(
                                table.id,
                                {
                                  name: `Client ${nextNumber}`,
                                  amountDue: 0,
                                  remainingAmount: 0,
                                  tableId: table.id,
                                }
                              );
                            }
                            await loadClients();
                          } catch (error) {
                            console.error(
                              "Erreur lors de l'ajout multiple:",
                              error
                            );
                          } finally {
                            setIsLoading(false);
                          }
                        }}
                        className="h-12"
                        disabled={isLoading}
                      >
                        <div className="flex flex-col items-center">
                          <span className="text-lg font-bold">{num}</span>
                          <span className="text-xs text-muted-foreground">
                            client{num > 1 ? "s" : ""}
                          </span>
                        </div>
                      </Button>
                    ))}
                  </div>

                  {/* Bouton pour ajouter plusieurs avec dialog */}
                  <Button
                    onClick={() => setAddGuestDialogOpen(true)}
                    className="w-full mt-3"
                    variant="ghost"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter plusieurs clients
                  </Button>
                </div>

                {/* Quick actions */}
                <div className="space-y-2 pt-6 border-t">
                  <h3 className="text-sm font-medium mb-3">Actions rapides</h3>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      table && onMarkAllPaid(table.id);
                    }}
                    className="w-full"
                    variant="default"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Tout marquer comme payé
                  </Button>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Dialog d'ajout de clients */}
      <Dialog open={addGuestDialogOpen} onOpenChange={setAddGuestDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter des clients</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Sélection du nombre de clients */}
            <div>
              <Label>Nombre de clients à ajouter</Label>
              <div className="flex items-center gap-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    if (addGuestForm.numberOfGuests > 1) {
                      setAddGuestForm((prev) => ({
                        ...prev,
                        numberOfGuests: prev.numberOfGuests - 1,
                      }));
                    }
                  }}
                  disabled={addGuestForm.numberOfGuests <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>

                <div className="flex-1 text-center">
                  <span className="text-2xl font-bold">
                    {addGuestForm.numberOfGuests}
                  </span>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setAddGuestForm((prev) => ({
                      ...prev,
                      numberOfGuests: prev.numberOfGuests + 1,
                    }));
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Option pour les noms personnalisés */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="customNames"
                checked={useCustomNames}
                onChange={(e) => {
                  setUseCustomNames(e.target.checked);
                  if (!e.target.checked) {
                    setAddGuestForm((prev) => ({ ...prev, customNames: [] }));
                  }
                }}
                className="rounded border-gray-300"
              />
              <Label htmlFor="customNames" className="cursor-pointer">
                Saisir les noms des clients
              </Label>
            </div>

            {/* Champs pour les noms personnalisés */}
            {useCustomNames && (
              <div className="space-y-2 max-h-60 overflow-y-auto p-2 border rounded-lg">
                {Array.from({ length: addGuestForm.numberOfGuests }).map(
                  (_, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-sm">
                        {index + 1}
                      </div>
                      <Input
                        placeholder={`Nom du client ${index + 1}`}
                        value={addGuestForm.customNames?.[index] || ""}
                        onChange={(e) =>
                          handleUpdateCustomName(index, e.target.value)
                        }
                        className="flex-1"
                      />
                    </div>
                  )
                )}
              </div>
            )}

            {/* Aperçu des noms */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Clients à ajouter :</p>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: addGuestForm.numberOfGuests }).map(
                  (_, index) => {
                    const existingCount = clients.length;
                    const customName = addGuestForm.customNames?.[index];
                    const displayName =
                      useCustomNames && customName
                        ? customName || `Client ${existingCount + index + 1}`
                        : `Client ${existingCount + index + 1}`;

                    return (
                      <Badge
                        key={index}
                        variant="outline"
                        className="px-3 py-1"
                      >
                        {displayName}
                      </Badge>
                    );
                  }
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setAddGuestDialogOpen(false)}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                onClick={handleAddGuests}
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading
                  ? "Ajout..."
                  : `Ajouter ${addGuestForm.numberOfGuests} client(s)`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Supprimer le client
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le client{" "}
              <span className="font-semibold">{clientToDelete?.name}</span> ?
              {clientToDelete?.remainingAmount !== 0 && (
                <div className="mt-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-destructive text-sm font-medium">
                    ⚠️ Attention : Ce client a encore{" "}
                    {clientToDelete?.remainingAmount?.toFixed(2)} € à payer.
                  </p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setClientToDelete(null);
              }}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                clientToDelete && handleDeleteClient(clientToDelete.id)
              }
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                "Suppression..."
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Effectuer un paiement</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Client</Label>
              <Input value={selectedClient?.name || ""} readOnly disabled />
            </div>

            <div>
              <Label>Montant à payer</Label>
              <Input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                min="0.01"
                step="0.01"
              />
            </div>

            <div>
              <Label>Méthode de paiement</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une méthode" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
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
