// src/pages/Tables.tsx
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { TableStats } from "@/components/tableStats";
import { TableHeader } from "@/components/tableHeader";
import { TableGrid } from "@/components/ui/table-grid";
import { TableDetailSheet } from "@/components/table-detail-sheets";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { restaurantTableService } from "@/services/restaurant-table.service";
import { RestaurantTable } from "@/models/restaurant-table.model";
import { TableStatus } from "@/models/table-status.model";
import { TableClient } from "@/models/table-client.model";

const Tables = () => {
  const navigate = useNavigate();
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(
    null
  );
  const [sheetOpen, setSheetOpen] = useState(false);
  const [animatingTableId, setAnimatingTableId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les tables au démarrage
  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      setIsLoading(true);
      const data = await restaurantTableService.getAll();
      setTables(data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les tables",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTableClick = async (table: RestaurantTable) => {
    try {
      // Charger les détails de la table
      const tableDetails = await restaurantTableService.getById(table.id);
      setSelectedTable(tableDetails);
      setSheetOpen(true);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les détails de la table",
        variant: "destructive",
      });
    }
  };

  const handleAddTable = async (name: string, number: number) => {
    try {
      const newTable = await restaurantTableService.create({
        tableNumber: `${name} ${number}`,
        status: TableStatus.FREE,
        qrCode: `${name.toUpperCase().replace(/\s+/g, "-")}-${number
          .toString()
          .padStart(3, "0")}`,
      });

      setTables((prev) => [...prev, newTable]);

      toast({
        title: "Table créée",
        description: `${name} ${number} ajoutée avec succès`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer la table",
        variant: "destructive",
      });
    }
  };

  const handleReorder = (newTables: RestaurantTable[]) => {
    setTables(newTables);
    // Note: Vous pourriez vouloir sauvegarder l'ordre dans le backend
  };

  const handleGuestPaymentChange = async (
    tableId: string,
    clientId: string,
    paymentAmount: number,
    method: string
  ) => {
    try {
      // Ajouter le paiement
      await restaurantTableService.addPaymentToClient(clientId, {
        clientId,
        amount: paymentAmount,
        method,
        paidAt: new Date().toISOString(),
      });

      // Mettre à jour le client
      await restaurantTableService.updateClient(clientId, {
        remainingAmount: 0, // À adapter selon votre logique
      });

      // Recharger la table
      const updatedTable = await restaurantTableService.getById(tableId);
      setSelectedTable(updatedTable);

      // Mettre à jour la liste
      setTables((prev) =>
        prev.map((t) => (t.id === tableId ? updatedTable : t))
      );

      setAnimatingTableId(tableId);
      setTimeout(() => setAnimatingTableId(null), 500);

      toast({
        title: "Paiement enregistré",
        description: "Le paiement a été enregistré avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer le paiement",
        variant: "destructive",
      });
    }
  };

  const handleMarkAllPaid = async (tableId: string) => {
    try {
      // Récupérer les clients de la table
      const clients = await restaurantTableService.getClientsByTable(tableId);

      // Marquer chaque client comme payé
      for (const client of clients) {
        await restaurantTableService.markClientAsPaid(client.id);
      }

      // Mettre à jour la table
      const updatedTable = await restaurantTableService.update(tableId, {
        status: TableStatus.PAID,
      });

      setSelectedTable(updatedTable);
      setTables((prev) =>
        prev.map((t) => (t.id === tableId ? updatedTable : t))
      );

      setAnimatingTableId(tableId);
      setTimeout(() => setAnimatingTableId(null), 500);

      toast({
        title: "Table payée",
        description: "Tous les clients ont été marqués comme payés",
      });

      setTimeout(() => setSheetOpen(false), 300);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de marquer la table comme payée",
        variant: "destructive",
      });
    }
  };

  const handleClearTable = async (tableId: string) => {
    try {
      const updatedTable = await restaurantTableService.clearTable(tableId);

      setSelectedTable(updatedTable);
      setTables((prev) =>
        prev.map((t) => (t.id === tableId ? updatedTable : t))
      );

      setAnimatingTableId(tableId);
      setTimeout(() => setAnimatingTableId(null), 500);

      toast({
        title: "Table libérée",
        description: "La table a été libérée avec succès",
      });

      setTimeout(() => setSheetOpen(false), 300);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de libérer la table",
        variant: "destructive",
      });
    }
  };

  const handleAddGuest = async (tableId: string) => {
    try {
      const newClient: Omit<TableClient, "id"> = {
        name: `Client ${Date.now().toString().slice(-4)}`,
        tableId,
        amountDue: 25, // Montant par défaut
        remainingAmount: 25,
      };

      const createdClient = await restaurantTableService.addClientToTable(
        tableId,
        newClient
      );

      // Mettre à jour la table
      const updatedTable = await restaurantTableService.update(tableId, {
        status: TableStatus.OCCUPIED,
      });

      setSelectedTable(updatedTable);
      setTables((prev) =>
        prev.map((t) => (t.id === tableId ? updatedTable : t))
      );

      setAnimatingTableId(tableId);
      setTimeout(() => setAnimatingTableId(null), 500);

      toast({
        title: "Client ajouté",
        description: "Nouveau client ajouté à la table",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le client",
        variant: "destructive",
      });
    }
  };

  const handleGoToPOS = () => {
    navigate("/pos");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-6 max-w-7xl mx-auto px-4 sm:px-6">
        {/* Bouton de retour */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={handleGoToPOS}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au POS
          </Button>
        </div>

        <TableHeader onAddTable={handleAddTable} />

        <div className="space-y-6">
          <TableStats tables={tables} />

          <div className="pt-2">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Toutes les tables
            </h2>
            <TableGrid
              tables={tables}
              onTableClick={handleTableClick}
              onReorder={handleReorder}
              animatingTableId={animatingTableId}
            />
          </div>
        </div>

        <TableDetailSheet
          table={selectedTable}
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          onGuestPaymentChange={handleGuestPaymentChange}
          onMarkAllPaid={handleMarkAllPaid}
          onClearTable={handleClearTable}
          onAddGuest={handleAddGuest}
        />
      </div>
    </div>
  );
};

export default Tables;
