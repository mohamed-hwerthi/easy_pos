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
import { ClientOrder } from "@/models/client/client-order.model";

const Tables = () => {
  const navigate = useNavigate();

  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(
    null
  );
  const [sheetOpen, setSheetOpen] = useState(false);
  const [animatingTableId, setAnimatingTableId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      setIsLoading(true);
      const data = await restaurantTableService.getAll();
      setTables(data);
    } catch {
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
      const tableDetails = await restaurantTableService.getById(table.id);
      setSelectedTable(tableDetails);
      setSheetOpen(true);
    } catch {
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
        remainingAmount: 0,
        clientIds: [],
        totalAmount: 0,
      });

      setTables((prev) => [...prev, newTable]);

      toast({
        title: "Table créée",
        description: `${name} ${number} ajoutée avec succès`,
      });
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de créer la table",
        variant: "destructive",
      });
    }
  };

  const handleTablesUpdate = (newTables: RestaurantTable[]) => {
    setTables(newTables);
  };

  const handleGuestPaymentChange = async (
    tableId: string,
    clientId: string,
    paymentAmount: number,
    method: string
  ) => {
    try {
      await restaurantTableService.addPaymentToClient(clientId, {
        clientId,
        amount: paymentAmount,
        method,
        paidAt: new Date().toISOString(),
      });

      await restaurantTableService.updateClient(clientId, {
        remainingAmount: 0,
      });

      const updatedTable = await restaurantTableService.getById(tableId);

      setSelectedTable(updatedTable);
      setTables((prev) =>
        prev.map((t) => (t.id === tableId ? updatedTable : t))
      );

      setAnimatingTableId(tableId);
      setTimeout(() => setAnimatingTableId(null), 500);

      toast({
        title: "Paiement enregistré",
        description: "Le paiement a été enregistré avec succès",
      });
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer le paiement",
        variant: "destructive",
      });
    }
  };

  const handleAddOrderToTable = async (tableId: string, order: ClientOrder) => {
    try {
      const session = localStorage.getItem("currentSession");
      if (!session) {
        throw new Error("No active cashier session");
      }

      const { id: cashierSessionId } = JSON.parse(session);

      const updatedTable = await restaurantTableService.getById(tableId);

      setSelectedTable(updatedTable);
      setTables((prev) =>
        prev.map((t) => (t.id === tableId ? updatedTable : t))
      );

      setAnimatingTableId(tableId);
      setTimeout(() => setAnimatingTableId(null), 500);

      toast({
        title: "Commande ajoutée",
        description: "La commande a été ajoutée à la table avec succès",
      });
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la commande à la table",
        variant: "destructive",
      });
    }
  };

  const handleMarkAllPaid = async (tableId: string) => {
    try {
      const clients = await restaurantTableService.getClientsByTable(tableId);

      for (const client of clients) {
        await restaurantTableService.markClientAsPaid(client.id);
      }

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
    } catch {
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
    } catch {
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
        amountDue: 25,
        remainingAmount: 25,
        hasOrders: false,
      };

      await restaurantTableService.addClientToTable(tableId, newClient);

      const updatedTable = await restaurantTableService.getById(tableId);

      setSelectedTable(updatedTable);
      setTables((prev) =>
        prev.map((t) => (t.id === tableId ? updatedTable : t))
      );

      toast({
        title: "Client ajouté",
        description: "Nouveau client ajouté à la table",
      });
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le client",
        variant: "destructive",
      });
    }
  };

  const handleOccupyTable = async (table: RestaurantTable) => {
    try {
      const updatedTable = await restaurantTableService.occupyTable(table.id);

      setSelectedTable(updatedTable);
      setTables((prev) =>
        prev.map((t) => (t.id === table.id ? updatedTable : t))
      );

      toast({
        title: "Table occupée",
        description: "La table a été marquée comme occupée",
      });
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible d'occuper la table",
        variant: "destructive",
      });
    }
  };

  const handleGoToPOS = () => navigate("/pos");

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
        <div className="mb-6">
          <Button variant="outline" onClick={handleGoToPOS}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au POS
          </Button>
        </div>

        <TableHeader onAddTable={handleAddTable} />
        <TableStats tables={tables} />

        {/* Ajout d'un espace ici */}
        <div className="mb-8" />

        <TableGrid
          tables={tables}
          onTableClick={handleTableClick}
          onTablesUpdate={handleTablesUpdate}
          animatingTableId={animatingTableId}
        />

        <TableDetailSheet
          table={selectedTable}
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          onGuestPaymentChange={handleGuestPaymentChange}
          onMarkAllPaid={handleMarkAllPaid}
          onClearTable={handleClearTable}
          onAddGuest={handleAddGuest}
          onOccupyTable={handleOccupyTable}
          onAddOrderToTable={handleAddOrderToTable}
        />
      </div>
    </div>
  );
};

export default Tables;
